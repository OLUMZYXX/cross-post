import "./global.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { ActivityIndicator, View, Linking, AppState, BackHandler, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import HomePage from "./components/HomePage";
import Onboarding from "./components/Onboarding";
import BiometricLock from "./components/BiometricLock";
import { ToastProvider } from "./components/Toast";
import { authAPI, notificationAPI, platformAPI, getToken, clearToken, wakeUpServer } from "./services/api";

// Configure how notifications appear when app is in foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // May fail in Expo Go — push notifications require a development build
}

const ONBOARDING_KEY = "@crosspost_onboarded";
const BIOMETRIC_KEY = "@crosspost_biometric_enabled";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [oauthRefreshKey, setOauthRefreshKey] = useState(0);
  const [biometricLocked, setBiometricLocked] = useState(false);
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Register for push notifications and send token to server
  // Note: Remote push notifications require a development build, not Expo Go (SDK 53+)
  const registerForPushNotifications = useCallback(async () => {
    try {
      if (!Device.isDevice) return;

      // Android needs a notification channel (works in Expo Go for local notifications)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance?.MAX ?? 4,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4ade80",
        }).catch(() => {});
      }

      // Check/request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      // Get the Expo push token — this may fail in Expo Go
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        ...(projectId && { projectId }),
      });

      // Send token to server
      await notificationAPI.registerPushToken(tokenData.data).catch(() => {});
    } catch {
      // Push registration may fail in Expo Go — that's expected
    }
  }, []);

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event.url;
      const match = url.match(/crosspost:\/\/oauth\/(\w+)\/callback/);
      if (!match) return;

      const platform = match[1];
      const urlObj = new URL(url.replace("crosspost://", "http://dummy.com/"));
      const params = urlObj.searchParams;
      const displayName = platform.charAt(0).toUpperCase() + platform.slice(1);

      // If Facebook returned code+state directly to the app, POST to server to complete the exchange
      if (
        platform === "facebook" &&
        params.get("code") &&
        params.get("state")
      ) {
        try {
          const code = params.get("code");
          const state = params.get("state");
          const res = await platformAPI.completeFacebookAuth(code, state);

          if (res?.data?.missingPages) {
            alert(
              `${displayName} connected — no Facebook Pages were found. Create or link a Facebook Page (or ensure your account manages one) to enable page publishing.`,
            );
          } else {
            alert(`${displayName} connected successfully!`);
          }

          setOauthRefreshKey((prev) => prev + 1);
        } catch (err) {
          alert(
            `${displayName} connection failed: ${err.message || "server error"}`,
          );
        }

        return;
      }

      if (params.get("success") === "true") {
        alert(`${displayName} connected successfully!`);
        // Trigger a refresh so HomePage re-fetches platforms
        setOauthRefreshKey((prev) => prev + 1);
      } else {
        alert(`${displayName} connection failed: ${params.get("error")}`);
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => subscription?.remove();
  }, []);

  // Check biometric lock when app comes to foreground from background.
  // Only trigger if the app was in the background for more than 3 seconds,
  // so that brief system dialogs (image picker, share sheet, etc.) don't
  // cause a false lock.
  const backgroundAtRef = useRef(null);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "background") {
        backgroundAtRef.current = Date.now();
      }

      if (appState.current === "background" && nextState === "active") {
        const elapsed = Date.now() - (backgroundAtRef.current || 0);
        // Only lock if the app was in the background for at least 3 seconds
        if (elapsed >= 3000) {
          const enabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
          const token = await getToken();
          if (enabled === "true" && token) {
            setBiometricLocked(true);
          }
        }
      }
      appState.current = nextState;
    });

    return () => subscription?.remove();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    try {
      // Listener for notifications received while app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(() => {
        // Trigger a refresh of notification count in HomePage
        setOauthRefreshKey((prev) => prev + 1);
      });

      // Listener for when user taps on a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
        // Navigate to home if not already there
        if (currentScreen !== "home") {
          setCurrentScreen("home");
        }
      });
    } catch {
      // Notification listeners may not work in Expo Go — that's OK
    }

    return () => {
      try {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      } catch {
        // Cleanup may fail in Expo Go — safe to ignore
      }
    };
  }, [currentScreen]);

  useEffect(() => {
    // Pre-warm the server (Render free tier sleeps after inactivity)
    wakeUpServer();

    (async () => {
      const onboarded = await AsyncStorage.getItem(ONBOARDING_KEY);

      if (onboarded !== "true") {
        setCurrentScreen("onboarding");
        return;
      }

      const token = await getToken();
      if (token) {
        try {
          const { data } = await authAPI.getMe();
          setUser(data.user);
          setCurrentScreen("home");

          // Register for push notifications after successful auth
          registerForPushNotifications();

          // Check if biometric lock should show on initial load
          const biometricEnabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
          if (biometricEnabled === "true") {
            setBiometricLocked(true);
          }

          return;
        } catch {
          await clearToken();
        }
      }

      setCurrentScreen("signin");
    })();
  }, []);

  // Handle Android back button/gesture for auth screens
  useEffect(() => {
    const handler = () => {
      // From signup, go back to signin
      if (currentScreen === "signup") {
        setCurrentScreen("signin");
        return true;
      }
      // On signin/home/onboarding, let default behavior
      return false;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handler);
    return () => subscription.remove();
  }, [currentScreen]);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setCurrentScreen("signup");
  };

  if (!currentScreen) {
    return (
      <View className="flex-1 bg-gray-950 items-center justify-center">
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  const renderScreen = () => {
    if (currentScreen === "onboarding") {
      return <Onboarding onComplete={completeOnboarding} />;
    }

    if (currentScreen === "signup") {
      return (
        <SignUp
          onNavigateToSignIn={() => setCurrentScreen("signin")}
          onNavigateToHome={(userData) => {
            setUser(userData);
            setCurrentScreen("home");
            registerForPushNotifications();
          }}
        />
      );
    }

    if (currentScreen === "signin") {
      return (
        <SignIn
          onNavigateToSignUp={() => setCurrentScreen("signup")}
          onNavigateToHome={(userData) => {
            setUser(userData);
            setCurrentScreen("home");
            registerForPushNotifications();
          }}
        />
      );
    }

    if (currentScreen === "home") {
      return (
        <HomePage
          user={user}
          onUpdateUser={setUser}
          oauthRefreshKey={oauthRefreshKey}
          onLogout={() => {
            setUser(null);
            setCurrentScreen("signin");
          }}
        />
      );
    }

    return null;
  };

  return (
    <ToastProvider>
      {renderScreen()}
      {biometricLocked && (
        <BiometricLock onUnlock={() => setBiometricLocked(false)} />
      )}
    </ToastProvider>
  );
}
