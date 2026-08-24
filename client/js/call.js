const CallUI = (() => {
  let ctx = null;
  let ringInterval = null;
  let tick = null;
  let seconds = 0;
  let el = null;
  let activeNumber = "";

  function audio() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function beep(freq, dur) {
    try {
      const c = audio();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g);
      g.connect(c.destination);
      const t = c.currentTime;
      g.gain.setValueAtTime(0.055, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur);
    } catch {}
  }

  function startRing() {
    stopRing();
    const ringOnce = () => {
      beep(440, 0.4);
      setTimeout(() => beep(480, 0.4), 450);
    };
    ringOnce();
    ringInterval = setInterval(ringOnce, 2400);
  }

  function stopRing() {
    if (ringInterval) clearInterval(ringInterval);
    ringInterval = null;
  }

  function fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function ensureDom() {
    if (el) return;
    el = document.createElement("div");
    el.className = "call-overlay";
    el.id = "call-overlay";
    el.innerHTML = `
      <div class="call-card">
        <div class="call-avatar">🚑</div>
        <h3 id="call-name">Rescue Line</h3>
        <p id="call-number"></p>
        <p id="call-status">Calling…</p>
        <div class="call-timer" id="call-timer" style="display:none">00:00</div>
        <div class="call-controls">
          <button class="call-btn" id="call-mute" type="button"><span>🎤</span><small>Mute</small></button>
          <button class="call-btn" id="call-speaker" type="button"><span>🔊</span><small>Speaker</small></button>
          <button class="call-btn end" id="call-end" type="button"><span>📵</span><small>End</small></button>
        </div>
      </div>`;
    document.body.appendChild(el);
    document.getElementById("call-mute").addEventListener("click", (e) => {
      const b = e.currentTarget;
      b.classList.toggle("active");
      b.querySelector("span").textContent = b.classList.contains("active") ? "🔇" : "🎤";
    });
    document.getElementById("call-speaker").addEventListener("click", (e) => {
      const b = e.currentTarget;
      b.classList.toggle("active");
    });
    document.getElementById("call-end").addEventListener("click", hangup);
  }

  function hangup() {
    stopRing();
    if (tick) clearInterval(tick);
    tick = null;
    const status = document.getElementById("call-status");
    if (status && el && el.classList.contains("show")) {
      status.textContent = `Call ended • ${fmt(seconds)}`;
    }
    setTimeout(close, 1400);
  }

  function close() {
    if (!el) return;
    el.classList.remove("show");
    stopRing();
    if (tick) clearInterval(tick);
    tick = null;
  }

  function open(name, number) {
    seconds = 0;
    activeNumber = number;
    ensureDom();
    el.classList.add("show");
    document.getElementById("call-name").textContent = name || "Rescue Line";
    document.getElementById("call-number").textContent = number;
    document.getElementById("call-status").textContent = "Calling…";
    document.getElementById("call-timer").style.display = "none";
    document.querySelectorAll(".call-btn").forEach((b) => b.classList.remove("active"));
    document.querySelector("#call-mute span").textContent = "🎤";
    startRing();
    if (navigator.vibrate) navigator.vibrate([250, 150, 250]);

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    if (isMobile) {
      document.getElementById("call-status").textContent = "Connecting to phone dialer…";
      setTimeout(() => {
        stopRing();
        window.location.href = "tel:" + String(number).replace(/[^+0-9]/g, "");
      }, 1200);
      return;
    }
    setTimeout(() => {
      if (!el.classList.contains("show")) return;
      stopRing();
      document.getElementById("call-status").textContent = "Connected — Live Call";
      const timerEl = document.getElementById("call-timer");
      timerEl.style.display = "block";
      timerEl.textContent = "00:00";
      if (navigator.vibrate) navigator.vibrate(120);
      tick = setInterval(() => {
        seconds++;
        timerEl.textContent = fmt(seconds);
      }, 1000);
    }, 2600);
  }

  return { open, close, hangup };
})();
