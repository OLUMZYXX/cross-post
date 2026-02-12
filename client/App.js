import "./global.css";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import HomePage from "./components/HomePage";
import Onboarding from "./components/Onboarding";
import { ToastProvider } from "./components/Toast";

const ONBOARDING_KEY = "@crosspost_onboarded";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(null);
  const [user, setUser] = useState({ name: "User" });

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setCurrentScreen(value === "true" ? "signin" : "onboarding");
    });
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setCurrentScreen("signup");
  };

  if (!currentScreen) return null;

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
          onNavigateToHome={() => {
            setUser({ name: "User" });
            setCurrentScreen("home");
          }}
        />
      );
    }

    if (currentScreen === "home") {
      return (
        <HomePage
          user={user}
          onLogout={() => setCurrentScreen("signin")}
        />
      );
    }

    return null;
  };

  return <ToastProvider>{renderScreen()}</ToastProvider>;
}