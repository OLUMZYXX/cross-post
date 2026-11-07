const { withAppDelegate, withInfoPlist } = require("expo/config-plugins");
const { SCENE_DELEGATE_CLASS, SCENE_DELEGATE_SOURCE } = require("./sceneDelegateSource");

const appendSceneDelegate = (contents) =>
  contents.includes(SCENE_DELEGATE_CLASS) ? contents : contents + SCENE_DELEGATE_SOURCE;

const buildSceneManifest = () => ({
  UIApplicationSupportsMultipleScenes: false,
  UISceneConfigurations: {
    UIWindowSceneSessionRoleApplication: [
      {
        UISceneConfigurationName: "Default Configuration",
        UISceneDelegateClassName: `$(PRODUCT_MODULE_NAME).${SCENE_DELEGATE_CLASS}`,
      },
    ],
  },
});

const withSceneDelegate = (config) => {
  const withPlist = withInfoPlist(config, (modConfig) => {
    modConfig.modResults.UIApplicationSceneManifest = buildSceneManifest();
    return modConfig;
  });
  return withAppDelegate(withPlist, (modConfig) => {
    if (modConfig.modResults.language !== "swift") {
      throw new Error("withSceneDelegate: only Swift AppDelegate is supported");
    }
    modConfig.modResults.contents = appendSceneDelegate(modConfig.modResults.contents);
    return modConfig;
  });
};

module.exports = withSceneDelegate;
