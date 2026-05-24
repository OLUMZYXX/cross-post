import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Appearance, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { vars } from "nativewind";

const THEME_KEY = "@crosspost_theme";

export const LIGHT_COLORS = {
  paper: "#DDD3BD",
  paperLight: "#E3DAC4",
  paperDeep: "#CFC4AB",
  ink: "#1B1711",
  inkMuted: "#473D33",
  inkSoft: "#6A5F50",
  terracotta: "#B14026",
  terracottaShadow: "#8E311B",
  terracottaSoft: "#D9B19F",
  olive: "#4F573A",
  oliveSoft: "#A8AE94",
  info: "#3F576A",
  infoSoft: "#BBC7D1",
  rule: "#BFB39B",
  ruleSoft: "#CEC4AD",
  white: "#FFFFFF",
};

export const DARK_COLORS = {
  paper: "#0B141A",
  paperLight: "#161F25",
  paperDeep: "#1A252C",
  ink: "#E9EDEF",
  inkMuted: "#A4B2BC",
  inkSoft: "#6E7C85",
  terracotta: "#D9613F",
  terracottaShadow: "#A53A20",
  terracottaSoft: "#3A2A24",
  olive: "#A2AC81",
  oliveSoft: "#3A4030",
  info: "#86A4B8",
  infoSoft: "#2A3D4A",
  rule: "#2A3942",
  ruleSoft: "#202C33",
  white: "#FFFFFF",
};

let activeColors = LIGHT_COLORS;
export function getColors() {
  return activeColors;
}

export const COLORS = LIGHT_COLORS;

export const FONTS = {
  serif: "Fraunces_500Medium",
  serifItalic: "Fraunces_500Medium_Italic",
  serifSemibold: "Fraunces_600SemiBold",
  serifBold: "Fraunces_700Bold",
  sans: "HankenGrotesk_400Regular",
  sansMedium: "HankenGrotesk_500Medium",
  sansSemibold: "HankenGrotesk_600SemiBold",
  sansBold: "HankenGrotesk_700Bold",
};

export const BRAND = {
  name: "Crosspost",
  dot: "·",
  tagline: "One thought, sent everywhere it should live.",
  eyebrow: "COMPOSE ONCE",
};

function hexToRgbTriple(hex) {
  const m = hex.replace("#", "");
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

const TOKEN_TO_VAR = {
  paper: "--c-paper",
  paperLight: "--c-paper-light",
  paperDeep: "--c-paper-deep",
  ink: "--c-ink",
  inkMuted: "--c-ink-muted",
  inkSoft: "--c-ink-soft",
  terracotta: "--c-terracotta",
  terracottaShadow: "--c-terracotta-shadow",
  terracottaSoft: "--c-terracotta-soft",
  olive: "--c-olive",
  oliveSoft: "--c-olive-soft",
  info: "--c-info",
  infoSoft: "--c-info-soft",
  rule: "--c-rule",
  ruleSoft: "--c-rule-soft",
};

function paletteToVars(palette) {
  const out = {};
  for (const [token, varName] of Object.entries(TOKEN_TO_VAR)) {
    out[varName] = hexToRgbTriple(palette[token]);
  }
  return vars(out);
}

const ThemeContext = createContext({
  mode: "system",
  resolved: "light",
  colors: LIGHT_COLORS,
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("system");
  const [systemScheme, setSystemScheme] = useState(
    Appearance.getColorScheme() || "light",
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((v) => {
        if (v === "light" || v === "dark" || v === "system") setMode(v);
      })
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || "light");
    });
    return () => sub.remove();
  }, []);

  const resolved = mode === "system" ? systemScheme : mode;
  const colors = resolved === "dark" ? DARK_COLORS : LIGHT_COLORS;
  activeColors = colors;
  const themeVars = useMemo(() => paletteToVars(colors), [colors]);

  const setTheme = useCallback((next) => {
    setMode(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ mode, resolved, colors, setTheme, hydrated }),
    [mode, resolved, colors, setTheme, hydrated],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVars]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
