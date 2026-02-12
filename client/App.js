import "./global.css";
import { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import HomePage from "./components/HomePage";
import Onboarding from "./components/Onboarding";
import { ToastProvider } from "./components/Toast";
import { authAPI, getToken, clearToken } from "./services/api";

const ONBOARDING_KEY = "@crosspost_onboarded";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(null);
  const [user, setUser] = useState(null);

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
