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
    const res = await MR.api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (res && res.token) {
      localStorage.setItem("mr_token", res.token);
      localStorage.setItem("mr_user", JSON.stringify(res.user));
      MR.toast("✅ Welcome back, " + res.user.name, "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 600);
    } else {
      const known = JSON.parse(localStorage.getItem("mr_local_users") || "{}");
      if (known[email] && known[email] === password) {
        localStorage.setItem("mr_demo", "1");
        localStorage.setItem("mr_user", JSON.stringify({ name: email.split("@")[0], email }));
        window.location.href = "dashboard.html";
      } else {
        MR.toast("⚠️ Server unreachable. Use demo login: demo@medirescue.ai / demo123", "warn");
      }
    }
    btn.disabled = false;
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
    const res = await MR.api("/auth/register", { method: "POST", body: JSON.stringify(payload) });
    if (res && res.token) {
      localStorage.setItem("mr_token", res.token);
      localStorage.setItem("mr_user", JSON.stringify(res.user));
      MR.toast("🎉 Account created!", "success");
      setTimeout(() => (window.location.href = "dashboard.html"), 600);
    } else {
      const known = JSON.parse(localStorage.getItem("mr_local_users") || "{}");
      known[payload.email] = payload.password;
      localStorage.setItem("mr_local_users", JSON.stringify(known));
      delete payload.password;
      localStorage.setItem("mr_demo", "1");
      localStorage.setItem("mr_user", JSON.stringify({ name: payload.name, email: payload.email }));
      MR.toast("📴 Offline mode — account saved locally", "warn");
      setTimeout(() => (window.location.href = "dashboard.html"), 700);
    }
    btn.disabled = false;
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
