import "./global.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { View, Linking, AppState, BackHandler, Platform } from "react-native";
import {
  useFonts,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import useShareIntentSafe from "./hooks/useShareIntentSafe";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import HomePage from "./components/HomePage";
import Onboarding from "./components/Onboarding";
import BiometricLock from "./components/BiometricLock";
import ServerLoadingAnimation from "./components/ServerLoadingAnimation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastProvider, toast } from "./components/Toast";
import { ThemeProvider } from "./constants/theme";
import {
  authAPI,
  notificationAPI,
  platformAPI,
  getToken,
  clearToken,
  wakeUpServer,
} from "./services/api";

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {}

const ONBOARDING_KEY = "@crosspost_onboarded";
const BIOMETRIC_KEY = "@crosspost_biometric_enabled";

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });

  const [currentScreen, setCurrentScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [oauthRefreshKey, setOauthRefreshKey] = useState(0);
  const [biometricLocked, setBiometricLocked] = useState(false);
  const [sharedContent, setSharedContent] = useState(null);
  const [bootHoldElapsed, setBootHoldElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBootHoldElapsed(true), 4000);
    return () => clearTimeout(t);
  }, []);
  const appState = useRef(AppState.currentState);
  const notificationListener = useRef();
  const responseListener = useRef();

  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentSafe();

  useEffect(() => {
    if (hasShareIntent && shareIntent) {
      const text = shareIntent.text || shareIntent.webUrl || "";
      if (text) {
        setSharedContent({ text });
        resetShareIntent();
      }
    }
  }, [hasShareIntent, shareIntent]);

  const registerForPushNotifications = useCallback(async () => {
    try {
      if (!Device.isDevice) return;

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance?.MAX ?? 4,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4ade80",
        }).catch(() => {});
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") return;

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({
        ...(projectId && { projectId }),
      });

      await notificationAPI.registerPushToken(tokenData.data).catch(() => {});
    } catch {}
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
            toast({
              type: "info",
              title: `${displayName} connected`,
              message:
                "No Facebook Page found. Link a Page to enable publishing.",
            });
          } else {
            toast({ type: "success", title: `${displayName} connected!` });
          }

          setOauthRefreshKey((prev) => prev + 1);
        } catch (err) {
          toast({
            type: "error",
            title: "Couldn't connect",
            message:
              "We couldn't connect this account. Please try a different account.",
          });
        }

        return;
      }

      if (params.get("success") === "true") {
        toast({ type: "success", title: `${displayName} connected!` });
        setOauthRefreshKey((prev) => prev + 1);
      } else {
        toast({
          type: "error",
          title: "Couldn't connect",
          message: `We couldn't connect this ${displayName} account. Please try a different account.`,
        });
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

  const backgroundAtRef = useRef(null);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (nextState === "background") {
          backgroundAtRef.current = Date.now();
        }

        if (appState.current === "background" && nextState === "active") {
          const elapsed = Date.now() - (backgroundAtRef.current || 0);
          if (elapsed >= 3000) {
            const enabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
            const token = await getToken();
            if (enabled === "true" && token) {
              setBiometricLocked(true);
            }
          }
        }
        appState.current = nextState;
      },
    );

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    try {
      notificationListener.current =
        Notifications.addNotificationReceivedListener(() => {
          setOauthRefreshKey((prev) => prev + 1);
        });

      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(() => {
          if (currentScreen !== "home") {
            setCurrentScreen("home");
          }
        });
    } catch {}

    return () => {
      try {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      } catch {}
    };
  }, [currentScreen]);

  useEffect(() => {
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

          registerForPushNotifications();

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

  useEffect(() => {
    const handler = () => {
      if (currentScreen === "signup") {
        setCurrentScreen("signin");
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handler,
    );
    return () => subscription.remove();
  }, [currentScreen]);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setCurrentScreen("signup");
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      await clearToken();
    } catch {}
    setUser(null);
    setCurrentScreen("onboarding");
  };

  const isBooting = !currentScreen || !fontsLoaded || !bootHoldElapsed;

  const renderScreen = () => {
    if (isBooting) {
      return <ServerLoadingAnimation />;
    }
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
          onResetOnboarding={resetOnboarding}
          sharedContent={sharedContent}
          onSharedContentHandled={() => setSharedContent(null)}
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          {renderScreen()}
          {biometricLocked && (
            <BiometricLock onUnlock={() => setBiometricLocked(false)} />
          )}
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
