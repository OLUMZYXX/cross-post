import "./global.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { ActivityIndicator, View, Linking, AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import HomePage from "./components/HomePage";
import Onboarding from "./components/Onboarding";
import BiometricLock from "./components/BiometricLock";
import { ToastProvider } from "./components/Toast";
import { authAPI, platformAPI, getToken, clearToken, wakeUpServer } from "./services/api";

const ONBOARDING_KEY = "@crosspost_onboarded";
const BIOMETRIC_KEY = "@crosspost_biometric_enabled";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [oauthRefreshKey, setOauthRefreshKey] = useState(0);
  const [biometricLocked, setBiometricLocked] = useState(false);
  const appState = useRef(AppState.currentState);

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
  // We intentionally only check "background → active" (not "inactive → active")
  // because system dialogs like the biometric/password prompt cause "inactive"
  // briefly — triggering the lock again would create an endless password loop.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (appState.current === "background" && nextState === "active") {
        const enabled = await AsyncStorage.getItem(BIOMETRIC_KEY);
        const token = await getToken();
        if (enabled === "true" && token) {
          setBiometricLocked(true);
        }
      }
      appState.current = nextState;
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Pre-warm the server (Render free tier sleeps after inactivity)
    wakeUpServer();

    (async () => {
      // In development, always show onboarding on every reload
      if (__DEV__) {
        setCurrentScreen("onboarding");
        return;
      }

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

  const completeOnboarding = async () => {
    if (!__DEV__) {
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    }
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
