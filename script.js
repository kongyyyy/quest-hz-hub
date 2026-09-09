const modes = [
  {
    id:"120-native", hz:120, title:"120 Hz", kind:"native",
    label:"Native high refresh", badge:"Native",
    command:`adb shell setprop debug.oculus.refreshRate 120`,
    reset:`adb shell setprop debug.oculus.refreshRate ""`,
    notes:"Quest 2, Quest 3 and Quest 3S support 120 Hz. Availability can depend on the device and OS."
  },
  {
    id:"100-50", hz:50, title:"50 FPS", kind:"experimental",
    label:"100 Hz ÷ 2 frame pacing", badge:"Frame pacing",
    command:`adb shell setprop debug.oculus.refreshRate 100
adb shell setprop debug.oculus.swapInterval 2`,
    reset:`adb shell setprop debug.oculus.swapInterval ""
adb shell setprop debug.oculus.refreshRate ""`,
    notes:"Uses a 100 Hz display rate with a swap interval of 2 to target an effective 50 FPS. This is not a native 50 Hz panel mode."
  },
  {
    id:"90-45", hz:45, title:"45 FPS", kind:"experimental",
    label:"90 Hz ÷ 2 frame pacing", badge:"Frame pacing",
    command:`adb shell setprop debug.oculus.refreshRate 90
adb shell setprop debug.oculus.swapInterval 2`,
    reset:`adb shell setprop debug.oculus.swapInterval ""
adb shell setprop debug.oculus.refreshRate ""`,
    notes:"90 ÷ 2 = 45 effective FPS. The display remains at 90 Hz."
  },
  {
    id:"80-40", hz:40, title:"40 FPS", kind:"experimental",
    label:"80 Hz ÷ 2 frame pacing", badge:"Frame pacing",
    command:`adb shell setprop debug.oculus.refreshRate 80
adb shell setprop debug.oculus.swapInterval 2`,
    reset:`adb shell setprop debug.oculus.swapInterval ""
adb shell setprop debug.oculus.refreshRate ""`,
    notes:"80 ÷ 2 = 40 effective FPS. The display remains at 80 Hz."
  },
  {
    id:"72-36", hz:36, title:"36 FPS", kind:"experimental",
    label:"72 Hz ÷ 2 frame pacing", badge:"Frame pacing",
    command:`adb shell setprop debug.oculus.refreshRate 72
adb shell setprop debug.oculus.swapInterval 2`,
    reset:`adb shell setprop debug.oculus.swapInterval ""
adb shell setprop debug.oculus.refreshRate ""`,
    notes:"72 ÷ 2 = 36 effective FPS. This is the classic swap-interval example."
  },
  {
    id:"120-60", hz:60, title:"60 FPS", kind:"experimental",
    label:"120 Hz ÷ 2 frame pacing", badge:"Frame pacing",
    command:`adb shell setprop debug.oculus.refreshRate 120
adb shell setprop debug.oculus.swapInterval 2`,
    reset:`adb shell setprop debug.oculus.swapInterval ""
adb shell setprop debug.oculus.refreshRate ""`,
    notes:"Targets 60 effective FPS while the display runs at 120 Hz. Do not confuse this with a native 60 Hz interactive Quest mode."
  },
  {
    id:"120-30", hz:30, title:"30 FPS", kind:"experimental",
    label:"120 Hz ÷ 4 frame pacing", badge:"Frame pacing",
    command:`adb shell setprop debug.oculus.refreshRate 120
adb shell setprop debug.oculus.swapInterval 4`,
    reset:`adb shell setprop debug.oculus.swapInterval ""
adb shell setprop debug.oculus.refreshRate ""`,
    notes:"Targets 30 effective FPS using 120 Hz and swap interval 4."
  },
  {
    id:"90-native", hz:90, title:"90 Hz", kind:"native",
    label:"Native high refresh", badge:"Native",
    command:`adb shell setprop debug.oculus.refreshRate 90`,
    reset:`adb shell setprop debug.oculus.refreshRate ""`,
    notes:"90 Hz is supported on Quest 2, Quest 3, Quest 3S and Quest Pro."
  }
];

const cards = document.querySelector("#cards");
const search = document.querySelector("#search");
const count = document.querySelector("#count");
const details = document.querySelector("#details");
const detailsContent = document.querySelector("#detailsContent");
const toast = document.querySelector("#toast");

function render(filter="") {
  const q = filter.toLowerCase().trim();
  const list = modes.filter(m => `${m.title} ${m.label} ${m.notes}`.toLowerCase().includes(q));
  count.textContent = `${list.length} modes`;
  cards.innerHTML = list.map(m => `
    <article class="card" data-id="${m.id}" tabindex="0" role="button">
      <div class="hz">${m.hz}<span class="unit">${m.title.includes("FPS") ? " FPS" : " Hz"}</span></div>
      <div class="label">${m.label}</div>
      <span class="badge ${m.kind}">${m.badge}</span>
    </article>
  `).join("");
  cards.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => openDetails(card.dataset.id));
    card.addEventListener("keydown", e => { if(e.key==="Enter" || e.key===" ") openDetails(card.dataset.id); });
  });
}
function openDetails(id) {
  const m = modes.find(x=>x.id===id);
  detailsContent.innerHTML = `
    <div class="detail-grid">
      <div>
        <div class="eyebrow">${m.badge.toUpperCase()}</div>
        <h3>${m.title}</h3>
        <div class="sub">${m.label}</div>
        <div class="codebox">
          <div class="code-head"><span>APPLY</span><button class="copy" data-copy="${encodeURIComponent(m.command)}">COPY</button></div>
          <div class="code">${escapeHtml(m.command)}</div>
        </div>
        <div class="codebox">
          <div class="code-head"><span>RESET</span><button class="copy" data-copy="${encodeURIComponent(m.reset)}">COPY</button></div>
          <div class="code">${escapeHtml(m.reset)}</div>
        </div>
      </div>
      <aside class="info">
        <h4>What this does</h4>
        <p>${m.notes}</p>
        <h4>Before you run it</h4>
        <ul>
          <li>Enable Developer Mode and ADB debugging.</li>
          <li>Connect the headset to your computer and confirm ADB sees it.</li>
          <li>Check the actual result with your Quest performance overlay.</li>
        </ul>
        <h4>Important</h4>
        <p>ADB system properties are not guaranteed to persist after reboot and can change with Horizon OS updates.</p>
      </aside>
    </div>`;
  details.classList.remove("hidden");
  details.scrollIntoView({behavior:"smooth", block:"center"});
  details.querySelectorAll(".copy").forEach(btn => btn.addEventListener("click", () => copy(decodeURIComponent(btn.dataset.copy))));
}
function escapeHtml(s){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
async function copy(text){
  try { await navigator.clipboard.writeText(text); showToast("Copied ADB commands"); }
  catch { showToast("Copy failed — select the commands manually"); }
}
function showToast(text){toast.textContent=text;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1800)}
search.addEventListener("input", e => render(e.target.value));
document.querySelector("#closeDetails").addEventListener("click", ()=>details.classList.add("hidden"));
render();
