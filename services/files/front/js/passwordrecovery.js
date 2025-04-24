const recoveryForm = document.getElementById("passwd-recovery-form");
const usernameInput = document.getElementById("username-input");
const passwordInput = document.getElementById("password-input");
const otpInput = document.getElementById("otp-input");
const errorDisplay = document.getElementById("error-display");
const successDisplay = document.getElementById("success-display");

recoveryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const resp = await apiFetch("/api/auth/resetpassword", {
        method: "POST",
        body: JSON.stringify({
            username: usernameInput.value,
            password: passwordInput.value,
            totpCode: otpInput.value,
        }),
    });

    const body = await resp.json();

    if (!resp.ok) {
        successDisplay.style.display = "none";
        errorDisplay.style.display = "flex";

        if (body.code === "E_INVALID_TOTP_CODE") {
            errorDisplay.textContent = "Invalid one-time password";
        } else if (body.code === "E_USER_NOT_FOUND") {
            errorDisplay.textContent = "User not found";
        }
    } else {
        errorDisplay.style.display = "none";
        successDisplay.style.display = "flex";
        successDisplay.textContent = "Success!";

        setTimeout(() => {
            location.assign("/");
        }, 500);
    }
});
