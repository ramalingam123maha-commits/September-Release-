const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const formMessage = document.getElementById("formMessage");
const togglePass = document.getElementById("togglePass");

// Show / hide password
togglePass.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePass.textContent = isHidden ? "Hide" : "Show";
  togglePass.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail() {
  const value = emailInput.value.trim();
  if (!value) {
    setError(emailInput, emailError, "Email is required");
    return false;
  }
  if (!EMAIL_RE.test(value)) {
    setError(emailInput, emailError, "Enter a valid email address");
    return false;
  }
  clearError(emailInput, emailError);
  return true;
}

function validatePassword() {
  const value = passwordInput.value;
  if (!value) {
    setError(passwordInput, passwordError, "Password is required");
    return false;
  }
  if (value.length < 8) {
    setError(passwordInput, passwordError, "Password must be at least 8 characters");
    return false;
  }
  clearError(passwordInput, passwordError);
  return true;
}

function setError(input, el, msg) {
  input.classList.add("invalid");
  el.textContent = msg;
}

function clearError(input, el) {
  input.classList.remove("invalid");
  el.textContent = "";
}

emailInput.addEventListener("blur", validateEmail);
passwordInput.addEventListener("blur", validatePassword);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formMessage.textContent = "";
  formMessage.className = "form-message";

  const emailOk = validateEmail();
  const passwordOk = validatePassword();

  if (!emailOk || !passwordOk) return;

  // Simulated authentication — replace with a real API call.
  formMessage.textContent = "Signing in...";
  const btn = form.querySelector(".btn-primary");
  btn.disabled = true;

  setTimeout(() => {
    formMessage.textContent = "Signed in successfully!";
    formMessage.classList.add("success");
    btn.disabled = false;
    form.reset();
  }, 900);
});
