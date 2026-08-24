document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");

  function showTab(which) {
    const isLogin = which === "login";
    loginForm.style.display = isLogin ? "block" : "none";
    registerForm.style.display = isLogin ? "none" : "block";
    tabLogin.classList.toggle("active", isLogin);
    tabRegister.classList.toggle("active", !isLogin);
  }
  tabLogin.addEventListener("click", () => showTab("login"));
  tabRegister.addEventListener("click", () => showTab("register"));

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const btn = loginForm.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.dataset.orig = btn.textContent;
    btn.textContent = "⏳ Logging in…";
    const res = await MR.api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (res && res.token) {
      localStorage.setItem("mr_token", res.token);
      localStorage.setItem("mr_user", JSON.stringify(res.user));
      MR.toast("✅ Welcome back, " + res.user.name, "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 150);
      return;
    }
    const known = JSON.parse(localStorage.getItem("mr_local_users") || "{}");
    const hash = await MR.sha256(password);
    if (known[email] && known[email].hash === hash) {
      localStorage.setItem("mr_demo", "1");
      localStorage.setItem("mr_user", JSON.stringify({ name: known[email].name || email.split("@")[0], email }));
      MR.toast("⚡ Logged in (offline mode)", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 150);
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.orig || "Login →";
      MR.toast(known[email] ? "❌ Wrong password" : "❌ Account not found — Register tab se banao (offline bhi chalega)", "error");
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById("reg-name").value.trim(),
      email: document.getElementById("reg-email").value.trim(),
      password: document.getElementById("reg-password").value,
      phone: document.getElementById("reg-phone").value.trim(),
      bloodGroup: document.getElementById("reg-blood").value
    };
    const btn = registerForm.querySelector("button[type=submit]");
    btn.disabled = true;
    btn.dataset.orig = btn.textContent;
    btn.textContent = "⏳ Creating Account…";
    const hash = await MR.sha256(payload.password);
    const res = await MR.api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
    const known = JSON.parse(localStorage.getItem("mr_local_users") || "{}");
    known[payload.email] = { name: payload.name, hash };
    localStorage.setItem("mr_local_users", JSON.stringify(known));
    delete payload.password;
    localStorage.setItem("mr_demo", "1");
    localStorage.setItem("mr_user", JSON.stringify({ name: payload.name, email: payload.email }));
    if (res && res.token) {
      localStorage.setItem("mr_token", res.token);
      MR.toast("🎉 Account created!", "success");
    } else {
      MR.toast("⚡ Account created (saved on this device)", "success");
    }
    setTimeout(() => (window.location.href = "dashboard.html"), 250);
  });

  const demoBtn = document.getElementById("demo-login");
  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      localStorage.setItem("mr_demo", "1");
      localStorage.setItem("mr_user", JSON.stringify({ name: "Demo User", email: "demo@medirescue.ai" }));
      window.location.href = "dashboard.html";
    });
  }

  if (MR.user) {
    const hint = document.getElementById("auth-hint");
    if (hint) hint.textContent = `Already logged in as ${MR.user.name}. Go to dashboard →`;
  }
});
