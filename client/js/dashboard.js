document.addEventListener("DOMContentLoaded", async () => {
  if (!MR.requireAuth()) return;

  const stats = await MR.api("/stats");
  if (stats) {
    document.getElementById("stat-active").textContent = stats.activeEmergencies;
    document.getElementById("stat-resolved").textContent = stats.resolved;
    document.getElementById("stat-ambulance").textContent = stats.ambulanceRequests;
    document.getElementById("stat-hospitals").textContent = stats.hospitals;
  } else {
    const local = JSON.parse(localStorage.getItem("mr_local_emergencies") || "[]");
    document.getElementById("stat-active").textContent = local.filter((e) => e.status === "ACTIVE").length;
    document.getElementById("stat-resolved").textContent = local.filter((e) => e.status !== "ACTIVE").length;
    document.getElementById("stat-ambulance").textContent = localStorage.getItem("mr_local_amb_requests") || 0;
    document.getElementById("stat-hospitals").textContent = "8";
  }

  let list = await MR.api("/emergency?limit=6");
  if (!list) list = JSON.parse(localStorage.getItem("mr_local_emergencies") || "[]");
  const zone = document.getElementById("recent-list");
  zone.innerHTML = list.length
    ? list
        .map(
          (e) => `
        <div class="list-item">
          <div>
            <b>${e.id}</b> — ${e.type || "Emergency"}
            <div style="font-size:.8rem;color:var(--muted)">${MR.timeAgo(e.createdAt)} • ${e.location ? `📍 ${e.location.lat.toFixed(3)}, ${e.location.lng.toFixed(3)}` : "no GPS"}</div>
          </div>
          ${MR.priorityBadge(e.severity || "HIGH")}
        </div>`
        )
        .join("")
    : `<p style="color:var(--muted);font-size:.9rem">No emergencies yet. Stay safe! 🙏</p>`;

  const fleet = await MR.api("/ambulance");
  const fleetZone = document.getElementById("fleet-list");
  fleetZone.innerHTML = fleet
    ? fleet
        .map(
          (a) => `
        <div class="list-item">
          <div><b>${a.code}</b> — ${a.type}<div style="font-size:.8rem;color:var(--muted)">Driver: ${a.driver}</div></div>
          <span class="badge badge-green">AVAILABLE</span>
        </div>`
        )
        .join("")
    : `<p style="color:var(--muted);font-size:.9rem">5 units ready (offline demo data)</p>`;
});
