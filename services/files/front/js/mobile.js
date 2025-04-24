let shakeDialogIsOpen = false;

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

    Capacitor.Plugins.PushNotifications.requestPermissions().then((result) => {
        if (result.receive === "granted") {
            Capacitor.Plugins.PushNotifications.register();
        }
    });

    Capacitor.Plugins.PushNotifications.addListener("registration", (token) => {
        localStorage.setItem("fcmToken", token.value);
    });

    Capacitor.Plugins.CapacitorShake.addListener("shake", () => {
        if (
            location.pathname !== "/pages/local1v1.html" &&
            location.pathname !== "/pages/ai1v1.html" &&
            location.pathname !== "/pages/online1v1.html"
        ) {
            if (shakeDialogIsOpen) return;

            shakeDialogIsOpen = true;

            Capacitor.Plugins.Dialog.confirm({
                title: "A problem?",
                message:
                    "It looks like you are having a hard time with the app",
                okButtonTitle: "File a bug report",
            }).then((res) => {
                if (res.value)
                    location.assign(
                        "https://github.com/puceaulytech/etron/issues/new",
                    );

                shakeDialogIsOpen = false;
            });
        }
    });
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
