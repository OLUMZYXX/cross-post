import { Platform, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import PlaceholderScreen from "../screens/PlaceholderScreen";

const Stack = createNativeStackNavigator();

function GlassHeader() {
  return (
    <BlurView
      intensity={100}
      tint="systemChromeMaterialDark"
      className="absolute inset-0"
    />
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTransparent: true,
          headerBlurEffect:
            Platform.OS === "ios" ? "systemChromeMaterialDark" : undefined,
          headerBackground: () =>
            Platform.OS === "ios" ? <GlassHeader /> : null,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
          headerTintColor: "#fff",
          headerLargeTitleStyle: {
            color: "#fff",
          },
          headerTitleStyle: {
            color: "#fff",
          },
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Stack.Screen
          name="Placeholder"
          component={PlaceholderScreen}
          options={{
            title: "Cross-Post",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
