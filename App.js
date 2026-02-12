import "./global.css";
import { useState } from "react";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import HomePage from "./components/HomePage";
import Onboarding from "./components/Onboarding";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("onboarding");

  if (currentScreen === "onboarding") {
    return <Onboarding onComplete={() => setCurrentScreen("signup")} />;
  }

  if (currentScreen === "signup") {
    return (
      <SignUp
        onNavigateToSignIn={() => setCurrentScreen("signin")}
        onNavigateToHome={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "signin") {
    return (
      <SignIn
        onNavigateToSignUp={() => setCurrentScreen("signup")}
        onNavigateToHome={() => setCurrentScreen("home")}
      />
    );
  }

  if (currentScreen === "home") {
    return <HomePage onLogout={() => setCurrentScreen("onboarding")} />;
  }

  return <Onboarding onComplete={() => setCurrentScreen("signup")} />;
}
