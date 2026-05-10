const CATEGORIES = [
  { key: "Hårdvara",   label: "Hårdvara" },
  { key: "Inloggning", label: "Inloggning" },
  { key: "Nätverk",    label: "Nätverk" },
  { key: "Telefoni",   label: "Telefoni" },
];

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function createPanel(technician) {
  let selectedCategory = null;
  let state = "idle";

  const panel = document.createElement("div");
  panel.className = "panel";

  const heading = document.createElement("h2");
  heading.textContent = technician.name;
  panel.appendChild(heading);

  const categoryList = document.createElement("div");
  categoryList.className = "category-list";

  CATEGORIES.forEach(({ key, label }) => {
    const catBtn = document.createElement("button");
    catBtn.className = "category-btn";
    catBtn.textContent = label;
    catBtn.addEventListener("click", () => {
      if (state === "running") return;
      if (selectedCategory === key) {
        catBtn.classList.remove("active");
        selectedCategory = null;
        startBtn.disabled = true;
      } else {
        categoryList.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        catBtn.classList.add("active");
        selectedCategory = key;
        startBtn.disabled = false;
      }
    });
    categoryList.appendChild(catBtn);
  });
  panel.appendChild(categoryList);

  const timerDisplay = document.createElement("div");
  timerDisplay.className = "timer-display";
  timerDisplay.textContent = "0:00";
  panel.appendChild(timerDisplay);

  const startBtn = document.createElement("button");
  startBtn.className = "start-btn";
  startBtn.textContent = "Starta";
  startBtn.disabled = true;
  panel.appendChild(startBtn);

  const timer = new Timer(seconds => {
    timerDisplay.textContent = formatTime(seconds);
  });

  startBtn.addEventListener("click", async () => {
    if (state === "idle") {
      state = "running";
      startBtn.textContent = "Stoppa";
      startBtn.classList.add("running");
      categoryList.querySelectorAll(".category-btn").forEach(b => b.disabled = true);
      timer.start();
    } else {
      const seconds = timer.stop();
      await Storage.saveEntry(technician.id, selectedCategory, seconds);

      state = "idle";
      selectedCategory = null;
      timerDisplay.textContent = "0:00";
      startBtn.textContent = "Starta";
      startBtn.classList.remove("running");
      startBtn.disabled = true;
      categoryList.querySelectorAll(".category-btn").forEach(b => {
        b.disabled = false;
        b.classList.remove("active");
      });
    }
  });

  return panel;
}

async function init() {
  const root = document.getElementById("root");
  Stats.init(root);
  const technicians = await Storage.getTechnicians();
  technicians.forEach(tech => root.appendChild(createPanel(tech)));
}

init();