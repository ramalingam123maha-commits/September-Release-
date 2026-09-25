// Logout page behaviour: countdown with cancel, then confirmed state.
(function () {
  "use strict";

  var COUNTDOWN_SECONDS = 3;
  var remaining = COUNTDOWN_SECONDS;

  var loggingOutView = document.getElementById("logging-out-view");
  var loggedOutView = document.getElementById("logged-out-view");
  var countdownEl = document.getElementById("countdown");
  var cancelBtn = document.getElementById("cancel-btn");

  var intervalId = null;

  // Hook for real apps: clear session/token here.
  function clearSession() {
    try {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
    } catch (err) {
      // Storage may be unavailable (private mode); safe to ignore.
    }
  }

  function finishLogout() {
    clearInterval(intervalId);
    clearSession();
    loggingOutView.classList.add("hidden");
    loggedOutView.classList.remove("hidden");
  }

  function startCountdown() {
    intervalId = setInterval(function () {
      remaining -= 1;
      countdownEl.textContent = remaining;
      if (remaining <= 0) {
        finishLogout();
      }
    }, 1000);
  }

  cancelBtn.addEventListener("click", function () {
    clearInterval(intervalId);
    history.length > 1 ? history.back() : (window.location.href = "index.html");
  });

  startCountdown();
})();
