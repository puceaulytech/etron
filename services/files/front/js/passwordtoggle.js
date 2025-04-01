const passwordToggle = document.querySelector("#password-toggle");

passwordToggle.addEventListener("click", () => {
    const passwordInput = document.querySelector("input[name='password']");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        passwordToggle.src = "/assets/eye-icon.svg";
    } else {
        passwordInput.type = "password";
        passwordToggle.src = "/assets/eye-off-icon.svg";
    }
});
