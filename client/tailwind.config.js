const cssVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./navigation/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: cssVar("--c-paper"),
        "paper-light": cssVar("--c-paper-light"),
        "paper-deep": cssVar("--c-paper-deep"),
        ink: cssVar("--c-ink"),
        "ink-muted": cssVar("--c-ink-muted"),
        "ink-soft": cssVar("--c-ink-soft"),
        terracotta: cssVar("--c-terracotta"),
        "terracotta-shadow": cssVar("--c-terracotta-shadow"),
        "terracotta-soft": cssVar("--c-terracotta-soft"),
        olive: cssVar("--c-olive"),
        "olive-soft": cssVar("--c-olive-soft"),
        info: cssVar("--c-info"),
        "info-soft": cssVar("--c-info-soft"),
        rule: cssVar("--c-rule"),
        "rule-soft": cssVar("--c-rule-soft"),
      },
      fontFamily: {
        serif: ["Fraunces_500Medium"],
        "serif-italic": ["Fraunces_500Medium_Italic"],
        "serif-semibold": ["Fraunces_600SemiBold"],
        "serif-bold": ["Fraunces_700Bold"],
        sans: ["HankenGrotesk_400Regular"],
        "sans-medium": ["HankenGrotesk_500Medium"],
        "sans-semibold": ["HankenGrotesk_600SemiBold"],
        "sans-bold": ["HankenGrotesk_700Bold"],
        jakarta: ["PlusJakartaSans_500Medium"],
        "jakarta-semibold": ["PlusJakartaSans_600SemiBold"],
        "jakarta-bold": ["PlusJakartaSans_700Bold"],
        "jakarta-extrabold": ["PlusJakartaSans_800ExtraBold"],
      },
    },
  },
  plugins: [],
};
