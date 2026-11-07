const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("expo/config-plugins");

const MIN_DEPLOYMENT_TARGET = "15.1";
const MARKER = "crosspostMinDeploymentTarget";

const buildSnippet = () => `
    ${MARKER} = '${MIN_DEPLOYMENT_TARGET}'
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        current = build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET']
        if current.nil? || current.to_f < ${MIN_DEPLOYMENT_TARGET}
          build_config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${MIN_DEPLOYMENT_TARGET}'
        end
      end
    end`;

const patchPodfile = (contents) => {
  if (contents.includes(MARKER)) return contents;
  return contents.replace(
    /post_install do \|installer\|/,
    (match) => `${match}${buildSnippet()}`
  );
};

const withPodDeploymentTarget = (config) =>
  withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, "Podfile");
      const contents = fs.readFileSync(podfilePath, "utf8");
      fs.writeFileSync(podfilePath, patchPodfile(contents));
      return modConfig;
    },
  ]);

module.exports = withPodDeploymentTarget;
