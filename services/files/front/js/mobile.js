if (typeof Capacitor !== "undefined" && Capacitor.isNativePlatform()) {
    if (location.pathname === "/pages/passwordrecovery.html") {
        Capacitor.Plugins.ScreenOrientation.lock({ orientation: "portrait" });
    } else {
        Capacitor.Plugins.ScreenOrientation.lock({ orientation: "landscape" });
    }

    Capacitor.Plugins.App.addListener("backButton", () => {
        history.back();
    });
}
