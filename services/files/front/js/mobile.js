if (typeof Capacitor !== "undefined" && Capacitor.isNativePlatform()) {
    if (location.pathname === "/pages/passwordrecovery.html") {
        Capacitor.Plugins.ScreenOrientation.lock({ orientation: "portrait" });
    } else {
        Capacitor.Plugins.ScreenOrientation.lock({ orientation: "landscape" });
    }

    Capacitor.Plugins.App.addListener("backButton", () => {
        history.back();
    });

    document.querySelector(".tutorial-controls > span").remove();
    document.querySelector(".tutorial-controls .tutorial-part").remove();
    document.querySelector(".tutorial-controls .tutorial-part img").src =
        "/assets/tutorial-controls-mobile.gif";
    document.querySelector(".tutorial-controls .tutorial-part span").innerText =
        "Tap the screen and move by using the joystick";
}

function mobileVibrate() {
    if (typeof Capacitor === "undefined") return;

    Capacitor.Plugins.Haptics.vibrate();
}

function mobileLightImpact() {
    if (typeof Capacitor === "undefined") return;

    Capacitor.Plugins.Haptics.impact({ style: "LIGHT" });
}

function mobileMediumImpact() {
    if (typeof Capacitor === "undefined") return;

    Capacitor.Plugins.Haptics.impact({ style: "MEDIUM" });
}

function mobileHeavyImpact() {
    if (typeof Capacitor === "undefined") return;

    Capacitor.Plugins.Haptics.impact({ style: "HEAVY" });
}

function mobileNotificationVibrate() {
    if (typeof Capacitor === "undefined") return;

    Capacitor.Plugins.Haptics.impact({ type: "SUCCESS" });
}
