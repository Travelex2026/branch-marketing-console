(function () {
  "use strict";
  var form = document.getElementById("loginForm");
  var errEl = document.getElementById("loginError");
  var btn = document.getElementById("loginBtn");
  var pwField = document.getElementById("password");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    errEl.hidden = true;
    btn.disabled = true;
    btn.textContent = "Signing in…";
    fetch("/api/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwField.value })
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          return { ok: res.ok, body: body };
        });
      })
      .then(function (r) {
        if (r.ok) {
          window.location.href = "/";
        } else {
          errEl.textContent = r.body.error || "Incorrect password";
          errEl.hidden = false;
          btn.disabled = false;
          btn.textContent = "Sign in";
          pwField.select();
        }
      })
      .catch(function () {
        errEl.textContent = "Could not reach the server. Check your connection and try again.";
        errEl.hidden = false;
        btn.disabled = false;
        btn.textContent = "Sign in";
      });
  });
})();
