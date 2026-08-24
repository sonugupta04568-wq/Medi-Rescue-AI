(async () => {
  const qs = new URLSearchParams(location.search);
  const PEER = "p" + Math.random().toString(36).slice(2, 8);
  const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  const $ = (id) => document.getElementById(id);

  let roomId = qs.get("room");
  const isJoiner = !!roomId;
  let pc = null;
  let localStream = null;
  let since = 0;
  let pollTimer = null;
  let seconds = 0;
  let pendingCandidates = [];
  let ended = false;

  const setStatus = (t) => ($("status").textContent = t);
  const fmt = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");

  function note(text) {
    const n = $("note");
    n.textContent = text;
    n.style.display = "block";
  }

  async function api(path, options) {
    return MR.api("/call" + path, options);
  }

  async function getMedia() {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 } },
      audio: true
    });
    $("local-video").srcObject = localStream;
  }

  function ensurePc() {
    if (pc) return pc;
    pc = new RTCPeerConnection(ICE);
    localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));

    pc.onicecandidate = (e) => {
      if (e.candidate) send("candidate", e.candidate.toJSON());
    };

    pc.ontrack = (e) => {
      $("remote-video").srcObject = e.streams[0];
      $("waiting").style.display = "none";
      $("live-dot").style.display = "block";
      setStatus("🟢 LIVE — 2-way video connected");
      startTimerOnce();
    };

    pc.onconnectionstatechange = () => {
      if (pc && ["failed", "disconnected"].includes(pc.connectionState)) {
        setStatus("⚠️ Connection lost — page refresh karo");
      }
    };
    return pc;
  }

  let timerStarted = false;
  function startTimerOnce() {
    if (timerStarted) return;
    timerStarted = true;
    setInterval(() => {
      seconds++;
      $("timer").textContent = fmt(seconds);
    }, 1000);
  }

  async function send(type, payload) {
    await api(`/${roomId}/signal`, {
      method: "POST",
      body: JSON.stringify({ from: PEER, type, payload })
    });
  }

  function flushCandidates() {
    pendingCandidates.forEach((c) => {
      try { pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    });
    pendingCandidates = [];
  }

  async function handleSignal(sig) {
    try {
      if (sig.type === "offer") {
        const peer = ensurePc();
        await peer.setRemoteDescription(new RTCSessionDescription(sig.payload));
        flushCandidates();
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await send("answer", { type: answer.type, sdp: answer.sdp });
        setStatus("Connecting…");
      } else if (sig.type === "answer") {
        if (pc && pc.signalingState !== "stable") {
          await pc.setRemoteDescription(new RTCSessionDescription(sig.payload));
          flushCandidates();
          setStatus("Connecting…");
        }
      } else if (sig.type === "candidate") {
        if (pc && pc.remoteDescription && pc.remoteDescription.type) {
          try { await pc.addIceCandidate(new RTCIceCandidate(sig.payload)); } catch {}
        } else {
          pendingCandidates.push(sig.payload);
        }
      }
    } catch (err) {
      console.warn("signal error:", err);
    }
  }

  function startPolling() {
    pollTimer = setInterval(async () => {
      if (ended) return;
      const res = await api(`/${roomId}/signals?since=${since}&peer=${PEER}`);
      if (!res || !res.signals) return;
      for (const sig of res.signals) {
        since = Math.max(since, sig.i + 1);
        await handleSignal(sig);
      }
    }, 1000);
  }

  async function init() {
    if (!roomId) {
      const res = await api("/room", { method: "POST", body: JSON.stringify({}) });
      if (!res || !res.roomId) {
        note("📴 Backend offline hai. 2-way calling ke liye 'npm start' chala kar localhost:5000 se kholo.");
        setStatus("Offline preview — sirf apna camera");
        try {
          await getMedia();
        } catch {
          setStatus("❌ Camera permission chahiye");
        }
        return;
      }
      roomId = res.roomId;
    }

    $("room-code").textContent = roomId;
    const inviteUrl = `${location.origin}${location.pathname}?room=${roomId}`;
    $("invite-link").value = inviteUrl;

    const info = await api(`/${roomId}`);
    if (!info || !info.exists) {
      note("Ye room expire ho gaya — naya room ke liye bina ?room= ke page kholo.");
      setStatus("Room expired");
      return;
    }

    try {
      await getMedia();
    } catch (err) {
      setStatus("❌ Camera/Mic allow karo — address bar lock icon → Site settings");
      note("Camera block hai. Allow karke page refresh karo.");
      return;
    }

    startPolling();

    if (isJoiner) {
      setStatus("Joining room " + roomId + "…");
    } else {
      setStatus("Invite ready — dusre device se link kholo");
      const peer = ensurePc();
      const offer = await peer.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await peer.setLocalDescription(offer);
      await send("offer", { type: offer.type, sdp: offer.sdp });
    }
  }

  $("copy-btn").addEventListener("click", async () => {
    const input = $("invite-link");
    try {
      await navigator.clipboard.writeText(input.value);
    } catch {
      input.select();
      document.execCommand("copy");
    }
    $("copy-btn").textContent = "✅ Copied!";
    setTimeout(() => ($("copy-btn").textContent = "📋 Copy Link"), 1600);
  });

  $("mic-btn").addEventListener("click", () => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    $("mic-btn").querySelector("span").textContent = track.enabled ? "🎙️" : "🔇";
    $("mic-btn").querySelector("small").textContent = track.enabled ? "Mic" : "Muted";
  });

  $("cam-btn").addEventListener("click", () => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    track.enabled = !track.enabled;
    $("cam-btn").querySelector("span").textContent = track.enabled ? "🎥" : "📷";
    $("cam-btn").querySelector("small").textContent = track.enabled ? "Camera" : "Off";
  });

  $("end-btn").addEventListener("click", () => {
    ended = true;
    if (pollTimer) clearInterval(pollTimer);
    stopAll();
    setStatus(`Call ended • ${fmt(seconds)}`);
  });

  function stopAll() {
    if (localStream) localStream.getTracks().forEach((t) => t.stop());
    if (pc) pc.close();
    $("live-dot").style.display = "none";
    $("waiting").style.display = "flex";
    $("waiting").innerHTML = `<span class="big">📵</span><p><b>Call ended</b></p>`;
  }

  window.addEventListener("beforeunload", () => {
    ended = true;
    stopAll();
  });

  init();
})();
