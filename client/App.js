import "./global.css";
import { useState, useEffect, useCallback, useRef } from "react";
import { ActivityIndicator, View, Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import HomePage from "./components/HomePage";
import Onboarding from "./components/Onboarding";
import InstagramConfirm from "./components/InstagramConfirm";
import { ToastProvider } from "./components/Toast";
import { authAPI, getToken, clearToken } from "./services/api";

const ONBOARDING_KEY = "@crosspost_onboarded";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(null);
  const [user, setUser] = useState(null);
  const [oauthRefreshKey, setOauthRefreshKey] = useState(0);
  const [instagramConfirmData, setInstagramConfirmData] = useState(null);

  useEffect(() => {
    const handleDeepLink = async (event) => {
      const url = event.url;
      const match = url.match(/crosspost:\/\/oauth\/(\w+)\/callback/);
      if (!match) return;

      const platform = match[1];
      const urlObj = new URL(
        url.replace("crosspost://", "http://dummy.com/"),
      );
      const params = urlObj.searchParams;
      const displayName =
        platform.charAt(0).toUpperCase() + platform.slice(1);

      // Instagram confirmation flow — show account details before saving
      if (platform === "instagram" && params.get("confirm") === "true") {
        setInstagramConfirmData({
          username: params.get("username") || "Unknown",
          userId: params.get("userId") || "",
          accountType: params.get("accountType") || "",
          profilePic: params.get("profilePic") || "",
          stateId: params.get("stateId") || "",
        });
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

  useEffect(() => {
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
          return;
        } catch {
          await clearToken();
        }
      }

      setCurrentScreen("signin");
    })();
  }, []);

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
    // Instagram account confirmation overlay
    if (instagramConfirmData) {
      return (
        <InstagramConfirm
          accountData={instagramConfirmData}
          onConfirm={(username) => {
            setInstagramConfirmData(null);
            alert(`Instagram (@${username}) connected successfully!`);
            setOauthRefreshKey((prev) => prev + 1);
          }}
          onCancel={() => {
            setInstagramConfirmData(null);
          }}
        />
      );
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

  return <ToastProvider>{renderScreen()}</ToastProvider>;
}
