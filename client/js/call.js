const CallUI = (() => {
  let ctx = null;
  let ringInterval = null;
  let tick = null;
  let seconds = 0;
  let el = null;
  let mode = null;
  let stream = null;

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

  function stopStream() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  function build(m) {
    const d = document.createElement("div");
    d.className = "call-overlay";
    const media =
      m === "video"
        ? `<div class="call-video-wrap" id="call-video-wrap">
             <video id="call-video" autoplay playsinline muted></video>
             <span class="call-live-dot" id="call-live-dot">● LIVE</span>
           </div>`
        : `<div class="call-avatar">🚑</div>`;
    d.innerHTML = `
      <div class="call-card">
        ${media}
        <h3 id="call-name"></h3>
        <p id="call-number"></p>
        <p id="call-status">Calling…</p>
        <div class="call-timer" id="call-timer" style="display:none">00:00</div>
        <div class="call-controls" id="call-controls"></div>
      </div>`;
    return d;
  }

  function makeBtn(id, icon, label, extra) {
    return `<button class="call-btn ${extra || ""}" id="${id}" type="button"><span>${icon}</span><small>${label}</small></button>`;
  }

  function ensureDom(m) {
    close();
    mode = m;
    el = build(m);
    document.body.appendChild(el);
    const controls = document.getElementById("call-controls");
    if (m === "voice") {
      controls.innerHTML = makeBtn("call-mute", "🎤", "Mute") + makeBtn("call-speaker", "🔊", "Speaker") + makeBtn("call-end", "📵", "End", "end");
    } else {
      controls.innerHTML = makeBtn("call-mic", "🎙️", "Mic") + makeBtn("call-cam", "🎥", "Camera") + makeBtn("call-end", "📵", "End", "end");
    }
    document.getElementById("call-end").addEventListener("click", hangup);

    const micBtn = document.getElementById("call-mute") || document.getElementById("call-mic");
    if (micBtn)
      micBtn.addEventListener("click", () => {
        micBtn.classList.toggle("active");
        const on = !micBtn.classList.contains("active");
        micBtn.querySelector("span").textContent = on ? (m === "voice" ? "🎤" : "🎙️") : "🔇";
        micBtn.querySelector("small").textContent = on ? (m === "voice" ? "Mute" : "Mic") : "Muted";
        if (stream) {
          stream.getAudioTracks().forEach((t) => (t.enabled = false));
          stream.getAudioTracks().forEach((t) => (t.enabled = on));
        }
      });

    const camBtn = document.getElementById("call-cam");
    if (camBtn)
      camBtn.addEventListener("click", () => {
        camBtn.classList.toggle("active");
        const on = !camBtn.classList.contains("active");
        if (stream) stream.getVideoTracks().forEach((t) => (t.enabled = on));
      });

    const spkBtn = document.getElementById("call-speaker");
    if (spkBtn) spkBtn.addEventListener("click", () => spkBtn.classList.toggle("active"));
  }

  function startTick(statusText) {
    stopRing();
    document.getElementById("call-status").textContent = statusText;
    const timerEl = document.getElementById("call-timer");
    timerEl.style.display = "block";
    timerEl.textContent = "00:00";
    if (navigator.vibrate) navigator.vibrate(120);
    tick = setInterval(() => {
      seconds++;
      timerEl.textContent = fmt(seconds);
    }, 1000);
  }

  function hangup() {
    const wasVisible = el && el.classList.contains("show");
    stopRing();
    if (tick) clearInterval(tick);
    tick = null;
    if (wasVisible) {
      const status = document.getElementById("call-status");
      if (status) status.textContent = `Call ended • ${fmt(seconds)}`;
    }
    stopStream();
    setTimeout(close, 1400);
  }

  function close() {
    if (!el) return;
    el.remove();
    el = null;
    stopRing();
    if (tick) clearInterval(tick);
    tick = null;
    stopStream();
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function handoffToDialer(number) {
    document.getElementById("call-status").textContent = "Connecting to phone dialer…";
    setTimeout(() => {
      stopRing();
      window.location.href = "tel:" + String(number).replace(/[^+0-9]/g, "");
    }, 1200);
  }

  function open(name, number) {
    seconds = 0;
    ensureDom("voice");
    el.classList.add("show");
    document.getElementById("call-name").textContent = name || "Rescue Line";
    document.getElementById("call-number").textContent = number;
    startRing();
    if (navigator.vibrate) navigator.vibrate([250, 150, 250]);
    if (isMobile()) return handoffToDialer(number);
    setTimeout(() => {
      if (!document.getElementById("call-status")) return;
      startTick("Connected — Live Call");
    }, 2600);
  }

  async function openVideo(name, number) {
    seconds = 0;
    ensureDom("video");
    el.classList.add("show");
    document.getElementById("call-name").textContent = name || "Rescue Line";
    document.getElementById("call-number").textContent = number;
    document.getElementById("call-status").textContent = "Requesting camera…";
    beep(520, 0.35);
    if (navigator.vibrate) navigator.vibrate([250, 150, 250]);

    if (isMobile()) return handoffToDialer(number);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("unsupported");
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 } }, audio: true });
      const v = document.getElementById("call-video");
      if (v) v.srcObject = stream;
      startTick("🟢 LIVE — Video Connected");
    } catch (err) {
      const wrap = document.getElementById("call-video-wrap");
      if (wrap) wrap.style.display = "none";
      startTick("⚠️ Camera blocked — Audio-only mode");
    }
  }

  return { open, openVideo, close, hangup };
})();
