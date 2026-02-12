import "./global.css";
import { useState } from "react";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import HomePage from "./components/HomePage";
import Onboarding from "./components/Onboarding";
import { ToastProvider } from "./components/Toast";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("onboarding");
  const [user, setUser] = useState({ name: "User" });

  const renderScreen = () => {
    if (currentScreen === "onboarding") {
      return <Onboarding onComplete={() => setCurrentScreen("signup")} />;
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
          onLogout={() => setCurrentScreen("onboarding")}
        />
      );
    }

    return <Onboarding onComplete={() => setCurrentScreen("signup")} />;
  };

  return <ToastProvider>{renderScreen()}</ToastProvider>;
}