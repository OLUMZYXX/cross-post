const SCENE_DELEGATE_CLASS = "CrossPostSceneDelegate";

const SCENE_DELEGATE_SOURCE = `

class ${SCENE_DELEGATE_CLASS}: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  private var appDelegate: AppDelegate? {
    UIApplication.shared.delegate as? AppDelegate
  }

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = appDelegate,
          let appWindow = appDelegate.window else { return }

    appWindow.windowScene = windowScene
    appWindow.makeKeyAndVisible()
    window = appWindow

    if let initialUrl = connectionOptions.urlContexts.first?.url {
      _ = appDelegate.application(UIApplication.shared, open: initialUrl, options: [:])
    }
    if let activity = connectionOptions.userActivities.first {
      _ = appDelegate.application(UIApplication.shared, continue: activity, restorationHandler: { _ in })
    }
  }

  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let appDelegate = appDelegate else { return }
    URLContexts.forEach { context in
      var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
      options[.sourceApplication] = context.options.sourceApplication
      _ = appDelegate.application(UIApplication.shared, open: context.url, options: options)
    }
  }

  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    _ = appDelegate?.application(UIApplication.shared, continue: userActivity, restorationHandler: { _ in })
  }

  func sceneDidBecomeActive(_ scene: UIScene) {
    appDelegate?.applicationDidBecomeActive(UIApplication.shared)
  }

  func sceneWillResignActive(_ scene: UIScene) {
    appDelegate?.applicationWillResignActive(UIApplication.shared)
  }

  func sceneWillEnterForeground(_ scene: UIScene) {
    appDelegate?.applicationWillEnterForeground(UIApplication.shared)
  }

  func sceneDidEnterBackground(_ scene: UIScene) {
    appDelegate?.applicationDidEnterBackground(UIApplication.shared)
  }
}
`;

module.exports = { SCENE_DELEGATE_CLASS, SCENE_DELEGATE_SOURCE };
