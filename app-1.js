// ============================================================
// THE LEGENDS WORLD CUP '26 — app logic
// Firebase + rendering. Vanilla JS module.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ============================================================
// FIREBASE CONFIG
// ⚠️ Replace this with a NEW Firebase project's config.
// Do NOT reuse the Legends project — both groups would share the same database.
// Create a fresh project at https://console.firebase.google.com, register a web app,
// and paste the firebaseConfig block it gives you over the placeholders below.
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyCv6r2rK9V2_sfg9rdberIOtBko3N4PCBg",
  authDomain: "world-cup-2-cc7f5.firebaseapp.com",
  projectId: "world-cup-2-cc7f5",
  storageBucket: "world-cup-2-cc7f5.firebasestorage.app",
  messagingSenderId: "753404922378",
  appId: "1:753404922378:web:3c7b4562e66df03ab72df3"
};

const PLAYERS = ["Pavlo", "Fabian", "Sam"];

const ALL_TEAMS = [
  "Algeria", "Argentina", "Australia", "Austria",
  "Belgium", "Bosnia", "Brazil",
  "Canada", "Cape Verde", "Colombia", "Croatia", "Curacao", "Czechia",
  "DR Congo",
  "Ecuador", "Egypt", "England",
  "France",
  "Germany", "Ghana",
  "Haiti",
  "Iran", "Iraq", "Ivory Coast",
  "Japan", "Jordan",
  "Mexico", "Morocco",
  "Netherlands", "New Zealand", "Norway",
  "Panama", "Paraguay", "Portugal",
  "Qatar",
  "Saudi Arabia", "Scotland", "Senegal", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
  "Tunisia", "Turkiye",
  "Uruguay", "USA", "Uzbekistan"
];

const TEAM_FLAGS = {
  "Algeria": "🇩🇿", "Argentina": "🇦🇷", "Australia": "🇦🇺", "Austria": "🇦🇹",
  "Belgium": "🇧🇪", "Bosnia": "🇧🇦", "Brazil": "🇧🇷",
  "Canada": "🇨🇦", "Cape Verde": "🇨🇻", "Colombia": "🇨🇴", "Croatia": "🇭🇷", "Curacao": "🇨🇼", "Czechia": "🇨🇿",
  "DR Congo": "🇨🇩",
  "Ecuador": "🇪🇨", "Egypt": "🇪🇬", "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "France": "🇫🇷",
  "Germany": "🇩🇪", "Ghana": "🇬🇭",
  "Haiti": "🇭🇹",
  "Iran": "🇮🇷", "Iraq": "🇮🇶", "Ivory Coast": "🇨🇮",
  "Japan": "🇯🇵", "Jordan": "🇯🇴",
  "Mexico": "🇲🇽", "Morocco": "🇲🇦",
  "Netherlands": "🇳🇱", "New Zealand": "🇳🇿", "Norway": "🇳🇴",
  "Panama": "🇵🇦", "Paraguay": "🇵🇾", "Portugal": "🇵🇹",
  "Qatar": "🇶🇦",
  "Saudi Arabia": "🇸🇦", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Senegal": "🇸🇳", "South Africa": "🇿🇦", "South Korea": "🇰🇷",
  "Spain": "🇪🇸", "Sweden": "🇸🇪", "Switzerland": "🇨🇭",
  "Tunisia": "🇹🇳", "Turkiye": "🇹🇷",
  "Uruguay": "🇺🇾", "USA": "🇺🇸", "Uzbekistan": "🇺🇿",
};
function flag(team) { return TEAM_FLAGS[team] || ""; }
function teamWithFlag(team, big = false) {
  const f = flag(team);
  if (!f) return team;
  const cls = big ? "flag-big" : "flag";
  return `<span class="${cls}">${f}</span> ${team}`;
}

// ============================================================
// FIXTURES — group stage
// ============================================================
const GROUP_MATCHES = [
  { id: "G001", teamA: "Mexico", teamB: "South Africa", kickoff: "2026-06-11T19:00:00Z", stage: "group", group: "A" },
  { id: "G002", teamA: "South Korea", teamB: "Czechia", kickoff: "2026-06-12T02:00:00Z", stage: "group", group: "A" },
  { id: "G003", teamA: "Canada", teamB: "Bosnia", kickoff: "2026-06-12T19:00:00Z", stage: "group", group: "B" },
  { id: "G004", teamA: "USA", teamB: "Paraguay", kickoff: "2026-06-13T01:00:00Z", stage: "group", group: "D" },
  { id: "G005", teamA: "Qatar", teamB: "Switzerland", kickoff: "2026-06-13T19:00:00Z", stage: "group", group: "B" },
  { id: "G006", teamA: "Brazil", teamB: "Morocco", kickoff: "2026-06-13T22:00:00Z", stage: "group", group: "C" },
  { id: "G007", teamA: "Haiti", teamB: "Scotland", kickoff: "2026-06-14T01:00:00Z", stage: "group", group: "C" },
  { id: "G008", teamA: "Australia", teamB: "Turkiye", kickoff: "2026-06-14T04:00:00Z", stage: "group", group: "D" },
  { id: "G009", teamA: "Germany", teamB: "Curacao", kickoff: "2026-06-14T17:00:00Z", stage: "group", group: "E" },
  { id: "G010", teamA: "Netherlands", teamB: "Japan", kickoff: "2026-06-14T20:00:00Z", stage: "group", group: "F" },
  { id: "G011", teamA: "Ivory Coast", teamB: "Ecuador", kickoff: "2026-06-14T23:00:00Z", stage: "group", group: "E" },
  { id: "G012", teamA: "Sweden", teamB: "Tunisia", kickoff: "2026-06-15T02:00:00Z", stage: "group", group: "F" },
  { id: "G013", teamA: "Spain", teamB: "Cape Verde", kickoff: "2026-06-15T16:00:00Z", stage: "group", group: "H" },
  { id: "G014", teamA: "Belgium", teamB: "Egypt", kickoff: "2026-06-15T19:00:00Z", stage: "group", group: "G" },
  { id: "G015", teamA: "Saudi Arabia", teamB: "Uruguay", kickoff: "2026-06-15T22:00:00Z", stage: "group", group: "H" },
  { id: "G016", teamA: "Iran", teamB: "New Zealand", kickoff: "2026-06-16T01:00:00Z", stage: "group", group: "G" },
  { id: "G017", teamA: "France", teamB: "Senegal", kickoff: "2026-06-16T19:00:00Z", stage: "group", group: "I" },
  { id: "G018", teamA: "Iraq", teamB: "Norway", kickoff: "2026-06-16T22:00:00Z", stage: "group", group: "I" },
  { id: "G019", teamA: "Argentina", teamB: "Algeria", kickoff: "2026-06-17T01:00:00Z", stage: "group", group: "J" },
  { id: "G020", teamA: "Austria", teamB: "Jordan", kickoff: "2026-06-17T04:00:00Z", stage: "group", group: "J" },
  { id: "G021", teamA: "Portugal", teamB: "DR Congo", kickoff: "2026-06-17T17:00:00Z", stage: "group", group: "K" },
  { id: "G022", teamA: "England", teamB: "Croatia", kickoff: "2026-06-17T20:00:00Z", stage: "group", group: "L" },
  { id: "G023", teamA: "Ghana", teamB: "Panama", kickoff: "2026-06-17T23:00:00Z", stage: "group", group: "L" },
  { id: "G024", teamA: "Uzbekistan", teamB: "Colombia", kickoff: "2026-06-18T02:00:00Z", stage: "group", group: "K" },
  { id: "G025", teamA: "Czechia", teamB: "South Africa", kickoff: "2026-06-18T16:00:00Z", stage: "group", group: "A" },
  { id: "G026", teamA: "Switzerland", teamB: "Bosnia", kickoff: "2026-06-18T19:00:00Z", stage: "group", group: "B" },
  { id: "G027", teamA: "Canada", teamB: "Qatar", kickoff: "2026-06-18T22:00:00Z", stage: "group", group: "B" },
  { id: "G028", teamA: "Mexico", teamB: "South Korea", kickoff: "2026-06-19T01:00:00Z", stage: "group", group: "A" },
  { id: "G029", teamA: "USA", teamB: "Australia", kickoff: "2026-06-19T19:00:00Z", stage: "group", group: "D" },
  { id: "G030", teamA: "Scotland", teamB: "Morocco", kickoff: "2026-06-19T22:00:00Z", stage: "group", group: "C" },
  { id: "G031", teamA: "Brazil", teamB: "Haiti", kickoff: "2026-06-20T00:30:00Z", stage: "group", group: "C" },
  { id: "G032", teamA: "Turkiye", teamB: "Paraguay", kickoff: "2026-06-20T03:00:00Z", stage: "group", group: "D" },
  { id: "G033", teamA: "Netherlands", teamB: "Sweden", kickoff: "2026-06-20T17:00:00Z", stage: "group", group: "F" },
  { id: "G034", teamA: "Germany", teamB: "Ivory Coast", kickoff: "2026-06-20T20:00:00Z", stage: "group", group: "E" },
  { id: "G035", teamA: "Ecuador", teamB: "Curacao", kickoff: "2026-06-21T00:00:00Z", stage: "group", group: "E" },
  { id: "G036", teamA: "Tunisia", teamB: "Japan", kickoff: "2026-06-21T04:00:00Z", stage: "group", group: "F" },
  { id: "G037", teamA: "Spain", teamB: "Saudi Arabia", kickoff: "2026-06-21T16:00:00Z", stage: "group", group: "H" },
  { id: "G038", teamA: "Belgium", teamB: "Iran", kickoff: "2026-06-21T19:00:00Z", stage: "group", group: "G" },
  { id: "G039", teamA: "Uruguay", teamB: "Cape Verde", kickoff: "2026-06-21T22:00:00Z", stage: "group", group: "H" },
  { id: "G040", teamA: "New Zealand", teamB: "Egypt", kickoff: "2026-06-22T01:00:00Z", stage: "group", group: "G" },
  { id: "G041", teamA: "Argentina", teamB: "Austria", kickoff: "2026-06-22T17:00:00Z", stage: "group", group: "J" },
  { id: "G042", teamA: "France", teamB: "Iraq", kickoff: "2026-06-22T21:00:00Z", stage: "group", group: "I" },
  { id: "G043", teamA: "Norway", teamB: "Senegal", kickoff: "2026-06-23T00:00:00Z", stage: "group", group: "I" },
  { id: "G044", teamA: "Jordan", teamB: "Algeria", kickoff: "2026-06-23T03:00:00Z", stage: "group", group: "J" },
  { id: "G045", teamA: "Portugal", teamB: "Uzbekistan", kickoff: "2026-06-23T17:00:00Z", stage: "group", group: "K" },
  { id: "G046", teamA: "England", teamB: "Ghana", kickoff: "2026-06-23T20:00:00Z", stage: "group", group: "L" },
  { id: "G047", teamA: "Panama", teamB: "Croatia", kickoff: "2026-06-23T23:00:00Z", stage: "group", group: "L" },
  { id: "G048", teamA: "Colombia", teamB: "DR Congo", kickoff: "2026-06-24T02:00:00Z", stage: "group", group: "K" },
  { id: "G049", teamA: "Switzerland", teamB: "Canada", kickoff: "2026-06-24T19:00:00Z", stage: "group", group: "B" },
  { id: "G050", teamA: "Bosnia", teamB: "Qatar", kickoff: "2026-06-24T19:00:00Z", stage: "group", group: "B" },
  { id: "G051", teamA: "Scotland", teamB: "Brazil", kickoff: "2026-06-24T22:00:00Z", stage: "group", group: "C" },
  { id: "G052", teamA: "Morocco", teamB: "Haiti", kickoff: "2026-06-24T22:00:00Z", stage: "group", group: "C" },
  { id: "G053", teamA: "Czechia", teamB: "Mexico", kickoff: "2026-06-25T01:00:00Z", stage: "group", group: "A" },
  { id: "G054", teamA: "South Africa", teamB: "South Korea", kickoff: "2026-06-25T01:00:00Z", stage: "group", group: "A" },
  { id: "G055", teamA: "Ecuador", teamB: "Germany", kickoff: "2026-06-25T20:00:00Z", stage: "group", group: "E" },
  { id: "G056", teamA: "Curacao", teamB: "Ivory Coast", kickoff: "2026-06-25T20:00:00Z", stage: "group", group: "E" },
  { id: "G057", teamA: "Japan", teamB: "Sweden", kickoff: "2026-06-25T23:00:00Z", stage: "group", group: "F" },
  { id: "G058", teamA: "Tunisia", teamB: "Netherlands", kickoff: "2026-06-25T23:00:00Z", stage: "group", group: "F" },
  { id: "G059", teamA: "Turkiye", teamB: "USA", kickoff: "2026-06-26T02:00:00Z", stage: "group", group: "D" },
  { id: "G060", teamA: "Paraguay", teamB: "Australia", kickoff: "2026-06-26T02:00:00Z", stage: "group", group: "D" },
  { id: "G061", teamA: "Norway", teamB: "France", kickoff: "2026-06-26T19:00:00Z", stage: "group", group: "I" },
  { id: "G062", teamA: "Senegal", teamB: "Iraq", kickoff: "2026-06-26T19:00:00Z", stage: "group", group: "I" },
  { id: "G063", teamA: "Cape Verde", teamB: "Saudi Arabia", kickoff: "2026-06-27T00:00:00Z", stage: "group", group: "H" },
  { id: "G064", teamA: "Uruguay", teamB: "Spain", kickoff: "2026-06-27T00:00:00Z", stage: "group", group: "H" },
  { id: "G065", teamA: "Egypt", teamB: "Iran", kickoff: "2026-06-27T03:00:00Z", stage: "group", group: "G" },
  { id: "G066", teamA: "New Zealand", teamB: "Belgium", kickoff: "2026-06-27T03:00:00Z", stage: "group", group: "G" },
  { id: "G067", teamA: "Panama", teamB: "England", kickoff: "2026-06-27T21:00:00Z", stage: "group", group: "L" },
  { id: "G068", teamA: "Croatia", teamB: "Ghana", kickoff: "2026-06-27T21:00:00Z", stage: "group", group: "L" },
  { id: "G069", teamA: "Colombia", teamB: "Portugal", kickoff: "2026-06-27T23:30:00Z", stage: "group", group: "K" },
  { id: "G070", teamA: "DR Congo", teamB: "Uzbekistan", kickoff: "2026-06-27T23:30:00Z", stage: "group", group: "K" },
  { id: "G071", teamA: "Algeria", teamB: "Austria", kickoff: "2026-06-28T02:00:00Z", stage: "group", group: "J" },
  { id: "G072", teamA: "Jordan", teamB: "Argentina", kickoff: "2026-06-28T02:00:00Z", stage: "group", group: "J" },
];

const KNOCKOUT_TEMPLATES = [
  { id: "R32-01", stage: "R32", kickoff: "2026-06-28T19:00:00Z" },
  { id: "R32-02", stage: "R32", kickoff: "2026-06-29T17:00:00Z" },
  { id: "R32-03", stage: "R32", kickoff: "2026-06-29T22:30:00Z" },
  { id: "R32-04", stage: "R32", kickoff: "2026-06-30T01:00:00Z" },
  { id: "R32-05", stage: "R32", kickoff: "2026-06-30T19:00:00Z" },
  { id: "R32-06", stage: "R32", kickoff: "2026-06-30T21:00:00Z" },
  { id: "R32-07", stage: "R32", kickoff: "2026-07-01T01:00:00Z" },
  { id: "R32-08", stage: "R32", kickoff: "2026-07-01T16:00:00Z" },
  { id: "R32-09", stage: "R32", kickoff: "2026-07-01T20:00:00Z" },
  { id: "R32-10", stage: "R32", kickoff: "2026-07-02T00:00:00Z" },
  { id: "R32-11", stage: "R32", kickoff: "2026-07-02T23:00:00Z" },
  { id: "R32-12", stage: "R32", kickoff: "2026-07-02T23:00:00Z" },
  { id: "R32-13", stage: "R32", kickoff: "2026-07-03T03:00:00Z" },
  { id: "R32-14", stage: "R32", kickoff: "2026-07-03T18:00:00Z" },
  { id: "R32-15", stage: "R32", kickoff: "2026-07-03T22:00:00Z" },
  { id: "R32-16", stage: "R32", kickoff: "2026-07-04T01:30:00Z" },
  { id: "R16-1", stage: "R16", kickoff: "2026-07-04T17:00:00Z" },
  { id: "R16-2", stage: "R16", kickoff: "2026-07-04T21:00:00Z" },
  { id: "R16-3", stage: "R16", kickoff: "2026-07-05T20:00:00Z" },
  { id: "R16-4", stage: "R16", kickoff: "2026-07-06T00:00:00Z" },
  { id: "R16-5", stage: "R16", kickoff: "2026-07-06T19:00:00Z" },
  { id: "R16-6", stage: "R16", kickoff: "2026-07-07T00:00:00Z" },
  { id: "R16-7", stage: "R16", kickoff: "2026-07-07T16:00:00Z" },
  { id: "R16-8", stage: "R16", kickoff: "2026-07-07T20:00:00Z" },
  { id: "QF-1", stage: "QF", kickoff: "2026-07-09T20:00:00Z" },
  { id: "QF-2", stage: "QF", kickoff: "2026-07-10T19:00:00Z" },
  { id: "QF-3", stage: "QF", kickoff: "2026-07-11T21:00:00Z" },
  { id: "QF-4", stage: "QF", kickoff: "2026-07-12T01:00:00Z" },
  { id: "SF-1", stage: "SF", kickoff: "2026-07-14T19:00:00Z" },
  { id: "SF-2", stage: "SF", kickoff: "2026-07-15T19:00:00Z" },
  { id: "3RD", stage: "3RD", kickoff: "2026-07-18T21:00:00Z" },
  { id: "F", stage: "F", kickoff: "2026-07-19T19:00:00Z" },
];

const CHAMPION_BONUS = 10;
const TOPSCORER_BONUS = 5;
const CHAMPION_LOCK = "2026-06-11T19:00:00Z";
const FIRST_KICKOFF = "2026-06-11T19:00:00Z";

// TheSportsDB sync
const TSDB_LEAGUE_ID = 4429;
const TSDB_SEASONS = ["2026", "2026-2027"];
function tsdbUrl(season) {
  return `https://www.thesportsdb.com/api/v1/json/123/eventsseason.php?id=${TSDB_LEAGUE_ID}&s=${encodeURIComponent(season)}`;
}
const TEAM_ALIASES = {
  "czechrepublic": "czechia", "korearepublic": "southkorea", "republicofkorea": "southkorea",
  "bosniaherzegovina": "bosnia", "bosniaandherzegovina": "bosnia",
  "turkey": "turkiye", "unitedstates": "usa", "us": "usa", "unitedstatesofamerica": "usa",
  "democraticrepublicofthecongo": "drcongo", "drccongo": "drcongo", "congo": "drcongo",
  "ivorycoast": "ivorycoast", "cotedivoire": "ivorycoast",
  "curacao": "curacao", "capeverde": "capeverde", "caboverde": "capeverde",
  "newzealand": "newzealand", "southafrica": "southafrica", "saudiarabia": "saudiarabia",
};
function normTeam(s) {
  const cleaned = (s || "").toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  return TEAM_ALIASES[cleaned] || cleaned;
}

// ============================================================
// STATE
// ============================================================
let db = null;
let authenticatedUser = null;
let users = {};
let predictions = {};
let results = {};
let champions = {};
let topScorers = {};
let topScorerActual = "";
let knockoutTeams = {};
let activeFilter = "all";
let activeTab = "matches";
let usersLoaded = false;
let autoSyncTimer = null;
let lastSyncTime = null;

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function initFirebase() {
  if (firebaseConfig.apiKey.startsWith("PASTE_")) {
    document.getElementById("setup-warning").style.display = "block";
    return false;
  }
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  return true;
}

function startListeners() {
  onSnapshot(collection(db, "users"), (snap) => {
    users = {};
    snap.forEach(d => { users[d.id] = d.data(); });
    usersLoaded = true;
    const savedName = localStorage.getItem("wc26_user");
    const savedToken = localStorage.getItem("wc26_token");
    if (savedName && savedToken && users[savedName]?.passwordHash === savedToken) {
      authenticatedUser = savedName;
    } else if (savedName && !users[savedName]) {
      authenticatedUser = null;
    }
    renderAll();
  });
  onSnapshot(collection(db, "predictions"), (snap) => {
    predictions = {};
    snap.forEach(d => { predictions[d.id] = d.data().pick; });
    renderMatches(); renderBracket(); renderLeaderboard();
  });
  onSnapshot(collection(db, "results"), (snap) => {
    results = {};
    snap.forEach(d => { results[d.id] = d.data().winner; });
    renderMatches(); renderBracket(); renderLeaderboard();
  });
  onSnapshot(collection(db, "champions"), (snap) => {
    champions = {};
    snap.forEach(d => { champions[d.id] = d.data().pick; });
    renderChampion(); renderLeaderboard();
  });
  onSnapshot(collection(db, "topScorers"), (snap) => {
    topScorers = {};
    snap.forEach(d => { topScorers[d.id] = d.data().pick; });
    renderTopScorer(); renderLeaderboard();
  });
  onSnapshot(collection(db, "meta"), (snap) => {
    snap.forEach(d => {
      if (d.id === "topScorerActual") topScorerActual = d.data().value || "";
    });
    renderTopScorer(); renderLeaderboard();
  });
  onSnapshot(collection(db, "knockoutTeams"), (snap) => {
    knockoutTeams = {};
    snap.forEach(d => { knockoutTeams[d.id] = d.data(); });
    renderMatches(); renderBracket();
  });
}

// ============================================================
// AUTH
// ============================================================
async function tryLogin(name) {
  if (!name) return;
  if (!usersLoaded) { toast("Still loading… try again", true); return; }
  if (!users[name]) {
    const pw = prompt(`First time playing as ${name}.\n\nCreate a password (at least 4 characters).\nYou'll enter this every time you sign in.`);
    if (pw === null) return;
    if (!pw || pw.length < 4) { alert("Password must be at least 4 characters."); return; }
    const pw2 = prompt(`Confirm password for ${name}:`);
    if (pw2 === null) return;
    if (pw !== pw2) { alert("Passwords don't match."); return; }
    const hash = await sha256(pw);
    try {
      await setDoc(doc(db, "users", name), { passwordHash: hash, createdAt: new Date().toISOString() });
      localStorage.setItem("wc26_user", name);
      localStorage.setItem("wc26_token", hash);
      authenticatedUser = name;
      toast(`Welcome, ${name}`);
      renderAll();
    } catch (e) { console.error(e); toast("Couldn't save password", true); }
  } else {
    const pw = prompt(`Enter password for ${name}:`);
    if (pw === null) return;
    const hash = await sha256(pw);
    if (hash !== users[name].passwordHash) { alert("Wrong password. Try again."); return; }
    localStorage.setItem("wc26_user", name);
    localStorage.setItem("wc26_token", hash);
    authenticatedUser = name;
    toast(`Welcome back, ${name}`);
    renderAll();
  }
}

function logout() {
  authenticatedUser = null;
  localStorage.removeItem("wc26_user");
  localStorage.removeItem("wc26_token");
  renderAll();
}

function renderUserBar() {
  const bar = document.getElementById("userbar");
  if (authenticatedUser) {
    bar.innerHTML = `
      <span class="ub-label">Signed in as</span>
      <span class="logged-in">${authenticatedUser}</span>
      <button class="logout-btn" id="logout-btn">Sign out</button>
    `;
    document.getElementById("logout-btn").onclick = logout;
  } else {
    bar.innerHTML = `
      <label for="user-select" class="ub-label">Sign in as</label>
      <select id="user-select">
        <option value="">— pick your name —</option>
        ${PLAYERS.map(p => `<option value="${p}">${p}${users[p] ? "" : " (new)"}</option>`).join("")}
      </select>
    `;
    document.getElementById("user-select").onchange = (e) => {
      const name = e.target.value;
      e.target.value = "";
      if (name) tryLogin(name);
    };
  }
}

// ============================================================
// HELPERS
// ============================================================
function knockoutMatchesWithTeams() {
  return KNOCKOUT_TEMPLATES.map(t => {
    const teams = knockoutTeams[t.id] || { teamA: "TBD", teamB: "TBD" };
    return { ...t, teamA: teams.teamA, teamB: teams.teamB };
  });
}
function allMatches() {
  return [...GROUP_MATCHES, ...knockoutMatchesWithTeams()]
    .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
}
function isLocked(match) { return new Date() >= new Date(match.kickoff); }
function hasTeams(match) {
  return match.teamA && match.teamA !== "TBD" && match.teamB && match.teamB !== "TBD";
}
function stageLabel(match) {
  if (match.stage === "group") return `Group ${match.group}`;
  return { R32: "Round of 32", R16: "Round of 16", QF: "Quarter-final", SF: "Semi-final", "3RD": "Third place", F: "FINAL" }[match.stage] || match.stage;
}
function formatKickoff(iso) {
  const d = new Date(iso);
  const opts = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleString(undefined, opts);
}
function countdownString(iso) {
  const target = new Date(iso).getTime();
  const ms = target - Date.now();
  if (ms <= 0) return { text: "Locked", cls: "locked" };
  const totalSecs = Math.floor(ms / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  let text;
  if (days > 0) text = `${days}d ${hours}h ${mins}m`;
  else if (hours > 0) text = `${hours}h ${mins}m`;
  else text = `${mins}m`;
  const cls = ms < 60 * 60 * 1000 ? "urgent" : "";
  return { text, cls };
}
function toast(msg, isError = false) {
  const c = document.getElementById("toast-container");
  const t = document.createElement("div");
  t.className = "toast" + (isError ? " error" : "");
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ============================================================
// HERO COUNTDOWN
// ============================================================
function updateHeroCountdown() {
  const blocks = document.getElementById("countdown-blocks");
  if (!blocks) return;
  const target = new Date(FIRST_KICKOFF).getTime();
  const ms = target - Date.now();

  const label = document.querySelector('#hero-countdown .label');
  if (ms <= 0) {
    if (label) label.textContent = "Tournament is LIVE";
    blocks.innerHTML = `
      <div class="countdown-block live"><div class="num">●</div><div class="unit">live</div></div>
      <div class="countdown-block"><div class="num">G0</div><div class="unit">stage</div></div>
    `;
    return;
  }
  const totalSecs = Math.floor(ms / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  blocks.innerHTML = `
    <div class="countdown-block"><div class="num">${pad(days)}</div><div class="unit">days</div></div>
    <div class="countdown-block"><div class="num">${pad(hours)}</div><div class="unit">hrs</div></div>
    <div class="countdown-block"><div class="num">${pad(mins)}</div><div class="unit">min</div></div>
    <div class="countdown-block"><div class="num">${pad(secs)}</div><div class="unit">sec</div></div>
  `;
}
function updateMastheadDate() {
  const el = document.getElementById("masthead-date");
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
}

// ============================================================
// RENDER: Matches
// ============================================================
function renderMatches() {
  const container = document.getElementById("matches-container");
  if (!container) return;
  const matches = allMatches();
  const filtered = matches.filter(m => {
    const locked = isLocked(m);
    const hasResult = !!results[m.id];
    if (activeFilter === "upcoming") return !locked && hasTeams(m);
    if (activeFilter === "finished") return hasResult;
    if (activeFilter === "group") return m.stage === "group";
    if (activeFilter === "knockout") return m.stage !== "group";
    return true;
  });
  const visible = activeFilter === "knockout"
    ? filtered
    : filtered.filter(m => m.stage === "group" || hasTeams(m));
  if (visible.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <span class="big">Nothing to show here</span>
        <span>Try a different filter, or check the Bracket tab.</span>
      </div>`;
    return;
  }
  let html = "";
  visible.forEach(m => { html += renderMatchCard(m); });
  container.innerHTML = html;
  wireMatchHandlers(container);
}

function renderMatchCard(m) {
  const locked = isLocked(m);
  const result = results[m.id];
  const allowDraw = m.stage === "group";
  const tbd = !hasTeams(m);
  const userPick = authenticatedUser ? predictions[`${authenticatedUser}_${m.id}`] : null;
  const pickLabels = {
    A: tbd ? "TBD" : m.teamA,
    D: "Draw",
    B: tbd ? "TBD" : m.teamB
  };

  let picksHtml = "";
  if (!tbd) {
    picksHtml = '<div class="picks' + (allowDraw ? "" : " no-draw") + '">';
    const options = allowDraw ? ["A", "D", "B"] : ["A", "B"];
    options.forEach(opt => {
      const selected = userPick === opt ? " selected" : "";
      let resultClass = "";
      if (result) {
        if (opt === result) resultClass = " correct";
        else if (userPick === opt && opt !== result) resultClass = " wrong";
      }
      const disabled = locked || !authenticatedUser ? "disabled" : "";
      picksHtml += `<button class="pick-btn${selected}${resultClass}" data-pick="${opt}" data-match-id="${m.id}" ${disabled}>${pickLabels[opt]}</button>`;
    });
    picksHtml += '</div>';
  }

  let metaRight;
  if (!tbd) {
    const cd = countdownString(m.kickoff);
    metaRight = `<span class="countdown ${cd.cls}">${cd.cls === 'locked' ? '🔒 Locked' : cd.text}</span>`;
  } else {
    metaRight = `<span class="countdown locked">Teams TBD</span>`;
  }

  const stagePillCls = "stage-pill" + (m.stage === "F" ? " final" : "");
  const stagePillHtml = m.stage === 'group'
    ? `<span class="group-pill">${stageLabel(m)}</span>`
    : `<span class="${stagePillCls}">${stageLabel(m)}</span>`;

  let lockNotice = "";
  if (!tbd && !authenticatedUser) {
    lockNotice = '<div class="lock-notice">↑ Sign in above to vote</div>';
  } else if (!tbd && locked && !result) {
    lockNotice = '<div class="lock-notice locked">🔒 Voting closed · awaiting result</div>';
  }

  let othersHtml = "";
  if (locked && authenticatedUser && !tbd) {
    const others = PLAYERS.filter(p => p !== authenticatedUser).map(p => ({
      player: p, pick: predictions[`${p}_${m.id}`]
    })).filter(x => x.pick);
    if (others.length > 0) {
      const simpleLabels = { A: m.teamA, D: "Draw", B: m.teamB };
      othersHtml = '<div class="others-picks">' +
        others.map(x => {
          let cls = "";
          if (result) cls = x.pick === result ? " correct" : " wrong";
          return `<span class="other-pick${cls}"><strong>${x.player}</strong>${simpleLabels[x.pick]}</span>`;
        }).join("") + '</div>';
    }
  }

  let resultHtml = "";
  if (locked && !tbd && authenticatedUser) {
    if (result) {
      const simpleLabels = { A: m.teamA, D: "Draw", B: m.teamB };
      resultHtml = `<div class="result-row">
        <span class="result-final">${simpleLabels[result]}</span>
        <select class="result-select" data-match-id="${m.id}">
          <option value="">Edit result…</option>
          <option value="A">${m.teamA}</option>
          ${allowDraw ? '<option value="D">Draw</option>' : ""}
          <option value="B">${m.teamB}</option>
          <option value="__clear__">Clear</option>
        </select>
      </div>`;
    } else {
      resultHtml = `<div class="result-row">
        <label>Enter result</label>
        <select class="result-select" data-match-id="${m.id}">
          <option value="">—</option>
          <option value="A">${m.teamA} won</option>
          ${allowDraw ? '<option value="D">Draw</option>' : ""}
          <option value="B">${m.teamB} won</option>
        </select>
      </div>`;
    }
  }

  const teamADisplay = tbd ? '<span class="tbd">TBD</span>' : `${m.teamA} <span class="flag">${flag(m.teamA)}</span>`;
  const teamBDisplay = tbd ? '<span class="tbd">TBD</span>' : `<span class="flag">${flag(m.teamB)}</span> ${m.teamB}`;

  return `
    <div class="match${tbd ? ' tbd' : ''}">
      <div class="match-meta">
        <span class="left">
          ${stagePillHtml}
        </span>
        ${metaRight}
      </div>
      <div class="match-teams">
        <div class="team-name team-a${tbd ? ' tbd' : ''}">${teamADisplay}</div>
        <div class="vs">vs</div>
        <div class="team-name team-b${tbd ? ' tbd' : ''}">${teamBDisplay}</div>
      </div>
      ${picksHtml}${lockNotice}${othersHtml}${resultHtml}
    </div>
  `;
}

function wireMatchHandlers(container) {
  container.querySelectorAll(".pick-btn").forEach(btn => {
    btn.onclick = () => handlePick(btn.dataset.matchId, btn.dataset.pick);
  });
  container.querySelectorAll(".result-select").forEach(sel => {
    sel.onchange = () => handleResult(sel.dataset.matchId, sel.value);
  });
  container.querySelectorAll(".ko-team-select").forEach(sel => {
    sel.onchange = () => handleKnockoutTeam(sel.dataset.matchId, sel.dataset.slot, sel.value);
  });
}

async function handlePick(matchId, pick) {
  if (!authenticatedUser) { toast("Sign in first", true); return; }
  const match = allMatches().find(m => m.id === matchId);
  if (!match || !hasTeams(match)) { toast("Teams not set yet", true); return; }
  if (isLocked(match)) { toast("Voting is closed", true); return; }
  try {
    await setDoc(doc(db, "predictions", `${authenticatedUser}_${matchId}`), {
      user: authenticatedUser, matchId, pick,
      updatedAt: new Date().toISOString()
    });
    toast(`Pick saved: ${pick === 'D' ? 'Draw' : pick === 'A' ? match.teamA : match.teamB}`);
  } catch (e) { console.error(e); toast("Couldn't save pick", true); }
}

async function handleResult(matchId, value) {
  if (!authenticatedUser) { toast("Sign in first", true); return; }
  if (!value) return;
  try {
    if (value === "__clear__") {
      await deleteDoc(doc(db, "results", matchId));
      toast("Result cleared");
    } else {
      await setDoc(doc(db, "results", matchId), { winner: value, source: "manual" });
      toast("Result saved");
    }
  } catch (e) { console.error(e); toast("Couldn't save result", true); }
}

// Manual fallback for filling knockout bracket slots when TheSportsDB
// hasn't published the matchup yet (placeholder names won't auto-sync).
async function handleKnockoutTeam(matchId, slot, value) {
  if (!authenticatedUser) { toast("Sign in first", true); return; }
  if (!value) return;
  const tpl = KNOCKOUT_TEMPLATES.find(t => t.id === matchId);
  if (!tpl) return;
  const current = knockoutTeams[matchId] || { teamA: "TBD", teamB: "TBD" };
  const next = {
    teamA: current.teamA || "TBD",
    teamB: current.teamB || "TBD",
  };
  const team = value === "__clear__" ? "TBD" : value;
  if (slot === "A") next.teamA = team; else next.teamB = team;

  try {
    if (next.teamA === "TBD" && next.teamB === "TBD") {
      await deleteDoc(doc(db, "knockoutTeams", matchId));
      toast("Slot cleared");
    } else {
      // source:"manual" tells syncFromTSDB not to overwrite this slot.
      await setDoc(doc(db, "knockoutTeams", matchId), {
        teamA: next.teamA, teamB: next.teamB,
        source: "manual", updatedAt: new Date().toISOString()
      });
      toast("Bracket updated");
    }
  } catch (e) { console.error(e); toast("Couldn't save team", true); }
}

function knockoutTeamOptions(selected) {
  const opts = ALL_TEAMS.map(t =>
    `<option value="${t}"${t === selected ? " selected" : ""}>${t}</option>`
  ).join("");
  return opts;
}

// ============================================================
// BRACKET
// ============================================================
function renderBracket() {
  const container = document.getElementById("bracket-container");
  if (!container) return;
  const rounds = [
    { stage: "R32", label: "Round of 32", count: 16 },
    { stage: "R16", label: "Round of 16", count: 8 },
    { stage: "QF",  label: "Quarter-finals", count: 4 },
    { stage: "SF",  label: "Semi-finals", count: 2 },
    { stage: "3RD", label: "Third Place Play-off", count: 1 },
    { stage: "F",   label: "Final 🏆", count: 1 },
  ];
  const knockouts = knockoutMatchesWithTeams();
  let html = "";
  rounds.forEach(r => {
    const matches = knockouts.filter(k => k.stage === r.stage);
    const filled = matches.filter(m => hasTeams(m)).length;
    let gridCls = "";
    if (r.count === 1) gridCls = "cols-1";
    else if (r.count === 2) gridCls = "cols-2";
    else if (r.count === 4) gridCls = "cols-4";
    else if (r.count === 8) gridCls = "cols-8";
    else if (r.count === 16) gridCls = "cols-16";
    html += `
      <div class="bracket-round">
        <div class="bracket-round-header">
          <span class="label">${r.label}</span>
          <span class="count">${filled} / ${r.count} set</span>
        </div>
        <div class="bracket-grid ${gridCls}">
          ${matches.map(m => renderBracketCard(m)).join("")}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  wireMatchHandlers(container);
}

function renderBracketCard(m) {
  const tbd = !hasTeams(m);
  const locked = isLocked(m);
  const result = results[m.id];
  const userPick = authenticatedUser ? predictions[`${authenticatedUser}_${m.id}`] : null;
  const simpleLabels = { A: m.teamA, B: m.teamB };
  const cd = countdownString(m.kickoff);

  let inner;
  if (tbd) {
    inner = `
      <div class="bracket-teams">
        <div class="row"><span class="tbd">TBD</span></div>
        <div class="row divider">— vs —</div>
        <div class="row"><span class="tbd">TBD</span></div>
      </div>
      <div class="lock-notice" style="text-align:left;margin-top:8px;">Fills after the previous round</div>
    `;
  } else {
    let picksHtml = '<div class="picks no-draw">';
    ["A", "B"].forEach(opt => {
      const selected = userPick === opt ? " selected" : "";
      let resultClass = "";
      if (result) {
        if (opt === result) resultClass = " correct";
        else if (userPick === opt && opt !== result) resultClass = " wrong";
      }
      const disabled = locked || !authenticatedUser ? "disabled" : "";
      picksHtml += `<button class="pick-btn${selected}${resultClass}" data-pick="${opt}" data-match-id="${m.id}" ${disabled}>${simpleLabels[opt]}</button>`;
    });
    picksHtml += '</div>';

    let lockNotice = "";
    if (!authenticatedUser) lockNotice = '<div class="lock-notice">↑ Sign in to vote</div>';

    let resultHtml = "";
    if (locked && authenticatedUser) {
      if (result) {
        resultHtml = `<div class="result-row" style="font-size:12px">
          <span class="result-final">${simpleLabels[result]}</span>
          <select class="result-select" data-match-id="${m.id}">
            <option value="">Edit…</option>
            <option value="A">${m.teamA}</option>
            <option value="B">${m.teamB}</option>
            <option value="__clear__">Clear</option>
          </select>
        </div>`;
      } else {
        resultHtml = `<div class="result-row" style="font-size:12px">
          <label>Result</label>
          <select class="result-select" data-match-id="${m.id}">
            <option value="">—</option>
            <option value="A">${m.teamA}</option>
            <option value="B">${m.teamB}</option>
          </select>
        </div>`;
      }
    }

    let othersHtml = "";
    if (locked && authenticatedUser) {
      const others = PLAYERS.filter(p => p !== authenticatedUser).map(p => ({
        player: p, pick: predictions[`${p}_${m.id}`]
      })).filter(x => x.pick);
      if (others.length > 0) {
        othersHtml = '<div class="others-picks">' +
          others.map(x => {
            let cls = "";
            if (result) cls = x.pick === result ? " correct" : " wrong";
            return `<span class="other-pick${cls}"><strong>${x.player}</strong>${simpleLabels[x.pick]}</span>`;
          }).join("") + '</div>';
      }
    }

    inner = `
      <div class="bracket-teams">
        <div class="row"><span class="flag">${flag(m.teamA)}</span> ${m.teamA}</div>
        <div class="row divider">— vs —</div>
        <div class="row"><span class="flag">${flag(m.teamB)}</span> ${m.teamB}</div>
      </div>
      ${picksHtml}${lockNotice}${othersHtml}${resultHtml}
    `;
  }

  // Manual team editor — fallback for when TheSportsDB hasn't filled the slot.
  // Shown to any signed-in player, until the match locks (kickoff passes).
  let editHtml = "";
  if (authenticatedUser && !locked) {
    const curA = m.teamA && m.teamA !== "TBD" ? m.teamA : "";
    const curB = m.teamB && m.teamB !== "TBD" ? m.teamB : "";
    editHtml = `
      <details class="ko-edit"${tbd ? " open" : ""}>
        <summary>✎ Set teams</summary>
        <div class="ko-edit-row">
          <select class="ko-team-select" data-match-id="${m.id}" data-slot="A">
            <option value="">— Team A —</option>
            ${knockoutTeamOptions(curA)}
            ${curA ? '<option value="__clear__">Clear</option>' : ''}
          </select>
          <select class="ko-team-select" data-match-id="${m.id}" data-slot="B">
            <option value="">— Team B —</option>
            ${knockoutTeamOptions(curB)}
            ${curB ? '<option value="__clear__">Clear</option>' : ''}
          </select>
        </div>
      </details>
    `;
  }

  const finalCls = m.stage === "F" ? " final-card" : "";
  return `
    <div class="bracket-match${tbd ? ' tbd' : ''}${finalCls}">
      <div class="bracket-match-time">
        <span>${stageLabel(m)}</span>
        <span class="countdown ${cd.cls}">${cd.text}</span>
      </div>
      ${inner}
      ${editHtml}
    </div>
  `;
}

// ============================================================
// CHAMPION
// ============================================================
function renderChampion() {
  const grid = document.getElementById("champion-grid");
  const others = document.getElementById("others-champions");
  const display = document.getElementById("your-champion-display");
  if (!grid || !others || !display) return;
  const locked = new Date() >= new Date(CHAMPION_LOCK);
  const myPick = authenticatedUser ? champions[authenticatedUser] : null;

  if (myPick) {
    display.innerHTML = `
      <div class="your-pick-display">
        <span class="label">Your pick · 🏆 Champion</span>
        <span class="val"><span class="flag">${flag(myPick)}</span>${myPick}</span>
        ${locked ? '' : '<span class="note">You can still change it until first kickoff.</span>'}
      </div>`;
  } else {
    display.innerHTML = authenticatedUser
      ? `<div class="your-pick-display empty">
           <span class="label">Your pick · 🏆 Champion</span>
           <span class="val">No pick yet — choose below</span>
         </div>`
      : `<div class="your-pick-display empty">
           <span class="label">Your pick · 🏆 Champion</span>
           <span class="val">Sign in above first</span>
         </div>`;
  }

  const sortedTeams = [...ALL_TEAMS].sort();
  grid.innerHTML = sortedTeams.map(t => {
    const selected = myPick === t ? " selected" : "";
    const disabled = locked || !authenticatedUser ? "disabled" : "";
    return `<button class="champion-btn${selected}" data-team="${t}" ${disabled}><span class="flag-big">${flag(t)}</span><span>${t}</span></button>`;
  }).join("");
  grid.querySelectorAll("button:not([disabled])").forEach(btn => {
    btn.onclick = () => handleChampionPick(btn.dataset.team);
  });

  if (locked) {
    const html = PLAYERS.filter(p => p !== authenticatedUser).map(p => {
      const pick = champions[p];
      return `<div class="row"><strong>${p}</strong>${pick ? `<span style="font-size:18px;margin-right:4px">${flag(pick)}</span> ${pick}` : "<em style='color:var(--muted)'>(no pick)</em>"}</div>`;
    }).join("");
    others.innerHTML = `<h3>Other players' picks</h3>${html}`;
  } else {
    others.innerHTML = `<div class="locked-msg">🔒 Other players' picks revealed at first kickoff</div>`;
  }
}

async function handleChampionPick(team) {
  if (!authenticatedUser) return;
  if (new Date() >= new Date(CHAMPION_LOCK)) { toast("Champion picks are locked", true); return; }
  try {
    await setDoc(doc(db, "champions", authenticatedUser), {
      user: authenticatedUser, pick: team, updatedAt: new Date().toISOString()
    });
    toast(`Champion pick: ${team}`);
  } catch (e) { console.error(e); toast("Couldn't save", true); }
}

// ============================================================
// TOP SCORER
// ============================================================
function renderTopScorer() {
  const display = document.getElementById("your-topscorer-display");
  const input = document.getElementById("topscorer-input");
  const saveBtn = document.getElementById("topscorer-save");
  const others = document.getElementById("others-topscorer");
  const adminBox = document.getElementById("topscorer-admin");
  const actualInput = document.getElementById("topscorer-actual");
  const actualDisplay = document.getElementById("topscorer-actual-display");
  if (!display) return;

  const locked = new Date() >= new Date(CHAMPION_LOCK);
  const myPick = authenticatedUser ? topScorers[authenticatedUser] : null;

  if (myPick) {
    display.innerHTML = `
      <div class="your-pick-display">
        <span class="label">Your pick · ⚽ Golden Boot</span>
        <span class="val">${myPick}</span>
        ${locked ? '' : '<span class="note">You can still change it until first kickoff.</span>'}
      </div>`;
  } else {
    display.innerHTML = authenticatedUser
      ? `<div class="your-pick-display empty">
           <span class="label">Your pick · ⚽ Golden Boot</span>
           <span class="val">No pick yet — type below</span>
         </div>`
      : `<div class="your-pick-display empty">
           <span class="label">Your pick · ⚽ Golden Boot</span>
           <span class="val">Sign in above first</span>
         </div>`;
  }
  input.value = myPick || "";
  input.disabled = locked || !authenticatedUser;
  saveBtn.disabled = locked || !authenticatedUser;

  if (locked) {
    const html = PLAYERS.filter(p => p !== authenticatedUser).map(p => {
      const pick = topScorers[p];
      let badge = "";
      if (topScorerActual && pick) {
        const correct = pick.trim().toLowerCase() === topScorerActual.trim().toLowerCase();
        badge = correct ? " ✓" : "";
      }
      return `<div class="row"><strong>${p}</strong>${pick || "<em style='color:var(--muted)'>(no pick)</em>"}${badge}</div>`;
    }).join("");
    others.innerHTML = `<h3>Other players' picks</h3>${html}`;
  } else {
    others.innerHTML = `<div class="locked-msg">🔒 Other players' picks revealed at first kickoff</div>`;
  }

  if (authenticatedUser) {
    adminBox.style.display = "block";
    actualInput.value = topScorerActual || "";
    actualDisplay.textContent = topScorerActual ? `Current: ${topScorerActual}` : "(not set yet)";
  } else {
    adminBox.style.display = "none";
  }
}

// ============================================================
// LEADERBOARD — Podium
// ============================================================
function computeScores() {
  const matches = allMatches();
  const finalMatch = matches.find(m => m.stage === "F" && results[m.id]);
  const wcWinner = finalMatch
    ? (results[finalMatch.id] === "A" ? finalMatch.teamA : finalMatch.teamB)
    : null;

  return PLAYERS.map(p => {
    let matchPoints = 0, correctCount = 0, totalPicked = 0;
    matches.forEach(m => {
      const pick = predictions[`${p}_${m.id}`];
      const result = results[m.id];
      if (pick && result) {
        totalPicked++;
        if (pick === result) { matchPoints++; correctCount++; }
      }
    });
    const champPick = champions[p];
    const championPoints = (wcWinner && champPick === wcWinner) ? CHAMPION_BONUS : 0;
    const tsPick = topScorers[p];
    const topScorerPoints = (topScorerActual && tsPick &&
      tsPick.trim().toLowerCase() === topScorerActual.trim().toLowerCase()) ? TOPSCORER_BONUS : 0;
    return {
      player: p, matchPoints, championPoints, topScorerPoints,
      total: matchPoints + championPoints + topScorerPoints,
      correctCount, totalPicked, champPick, tsPick
    };
  }).sort((a, b) => b.total - a.total);
}

function renderLeaderboard() {
  const lb = document.getElementById("leaderboard");
  if (!lb) return;
  const scores = computeScores();

  if (scores.length === 0) {
    lb.innerHTML = `<div class="podium-empty">No players yet.</div>`;
    return;
  }

  // Podium order in DOM: rank-2 (left), rank-1 (middle), rank-3 (right)
  const rank1 = scores[0];
  const rank2 = scores[1];
  const rank3 = scores[2];

  const isTied = scores.length >= 2 && rank2 && rank1.total === rank2.total && rank1.total > 0;
  const allZero = scores.every(s => s.total === 0);

  let bannerHtml = "";
  if (allZero) {
    bannerHtml = `<div class="tied-banner">— Tournament not started · All tied on 0 —</div>`;
  } else if (isTied) {
    bannerHtml = `<div class="tied-banner">— Currently tied at the top —</div>`;
  }

  function podiumStep(rank, s) {
    if (!s) return `<div class="podium-step"></div>`;
    const isMe = s.player === authenticatedUser;
    const champBit = s.champPick ? `🏆 ${s.champPick}` : '';
    const tsBit = s.tsPick ? `⚽ ${s.tsPick}` : '';
    const picks = [champBit, tsBit].filter(Boolean).join(' · ');
    const bonusBits = [];
    if (s.championPoints) bonusBits.push(`🏆 Champion ✓ +${s.championPoints}`);
    if (s.topScorerPoints) bonusBits.push(`⚽ Top scorer ✓ +${s.topScorerPoints}`);

    const baseLabel = { 1: '1st', 2: '2nd', 3: '3rd' }[rank];

    return `
      <div class="podium-step rank-${rank}">
        <div class="medal">${baseLabel}</div>
        <div class="podium-card">
          <div class="podium-name">${s.player}${isMe ? '<span class="me-tag">YOU</span>' : ''}</div>
          <div class="podium-points">${s.total}<small>points</small></div>
          <div class="podium-stat">
            ${s.correctCount}/${s.totalPicked} correct
            ${picks && isMe ? `<br>${picks}` : ''}
            ${bonusBits.length ? `<br><span class="bonus">${bonusBits.join(' · ')}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  // Breakdown table
  const breakdownRows = scores.map((s, i) => {
    const isMe = s.player === authenticatedUser;
    return `
      <tr class="${isMe ? 'me' : ''}">
        <td class="player">${s.player}${isMe ? ' <span style="font-family:JetBrains Mono,monospace;font-size:9px;color:var(--accent);letter-spacing:0.1em;text-transform:uppercase;">(you)</span>' : ''}</td>
        <td class="num">${s.correctCount}/${s.totalPicked}</td>
        <td class="num">${s.matchPoints}</td>
        <td class="num">${s.championPoints || '—'}</td>
        <td class="num">${s.topScorerPoints || '—'}</td>
        <td class="total">${s.total}</td>
      </tr>
    `;
  }).join('');

  lb.innerHTML = `
    ${bannerHtml}
    <div class="podium">
      ${podiumStep(1, rank1)}
      ${podiumStep(2, rank2)}
      ${podiumStep(3, rank3)}
    </div>

    <div class="breakdown-wrap">
      <h3>Score breakdown</h3>
      <table class="breakdown-table">
        <thead>
          <tr>
            <th>Player</th>
            <th style="text-align:right">Correct</th>
            <th style="text-align:right">Points</th>
            <th style="text-align:right">Champion</th>
            <th style="text-align:right">Top scorer</th>
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${breakdownRows}</tbody>
      </table>
    </div>
  `;
}

// ============================================================
// SYNC
// ============================================================
async function fetchTSDBEvents() {
  for (const season of TSDB_SEASONS) {
    try {
      const r = await fetch(tsdbUrl(season));
      if (!r.ok) continue;
      const data = await r.json();
      const events = data.events || data.event || null;
      if (events && events.length > 0) return { season, events };
    } catch (e) { console.warn(`TSDB fetch failed for season ${season}:`, e); }
  }
  return { season: null, events: [] };
}

async function syncFromTSDB(manual = false) {
  const btn = document.getElementById("sync-btn");
  const status = document.getElementById("sync-status");
  if (btn) btn.disabled = true;
  if (status) status.innerHTML = "Syncing…";

  let updatedResults = 0, updatedTeams = 0, errors = 0;
  try {
    const { season, events } = await fetchTSDBEvents();
    if (!events.length) {
      throw new Error("No events from TheSportsDB yet. The season may not be populated.");
    }
    const wcEvents = events.filter(e => e.idLeague === String(TSDB_LEAGUE_ID) || e.strLeague?.includes("World Cup"));
    const myMatches = allMatches();

    for (const e of wcEvents) {
      const home = e.strHomeTeam || "";
      const away = e.strAwayTeam || "";
      const homeScore = (e.intHomeScore != null && e.intHomeScore !== "") ? parseInt(e.intHomeScore, 10) : null;
      const awayScore = (e.intAwayScore != null && e.intAwayScore !== "") ? parseInt(e.intAwayScore, 10) : null;
      const ts = e.strTimestamp ? new Date(e.strTimestamp + (e.strTimestamp.endsWith("Z") ? "" : "Z")).getTime() : null;
      if (!home || !away || !ts) continue;

      const normHome = normTeam(home);
      const normAway = normTeam(away);

      let matched = null;
      let teamsOrder = null;
      for (const m of myMatches) {
        if (!hasTeams(m)) continue;
        const myA = normTeam(m.teamA);
        const myB = normTeam(m.teamB);
        const dt = Math.abs(new Date(m.kickoff).getTime() - ts);
        if (dt > 6 * 3600 * 1000) continue;
        if (myA === normHome && myB === normAway) { matched = m; teamsOrder = "AB"; break; }
        if (myA === normAway && myB === normHome) { matched = m; teamsOrder = "BA"; break; }
      }

      if (matched && homeScore !== null && awayScore !== null) {
        let winner;
        if (homeScore === awayScore) {
          winner = matched.stage === "group" ? "D" : null;
        } else if (teamsOrder === "AB") {
          winner = homeScore > awayScore ? "A" : "B";
        } else {
          winner = homeScore > awayScore ? "B" : "A";
        }
        if (winner) {
          const existing = results[matched.id];
          if (existing !== winner) {
            try {
              await setDoc(doc(db, "results", matched.id), { winner, source: "tsdb", syncedAt: new Date().toISOString() });
              updatedResults++;
            } catch (err) { console.error(err); errors++; }
          }
        }
      }

      for (const tpl of KNOCKOUT_TEMPLATES) {
        const existingTeams = knockoutTeams[tpl.id];
        if (existingTeams && existingTeams.teamA && existingTeams.teamA !== "TBD" && existingTeams.source !== "tsdb") continue;
        const dt = Math.abs(new Date(tpl.kickoff).getTime() - ts);
        if (dt > 3 * 3600 * 1000) continue;
        const myA = ALL_TEAMS.find(t => normTeam(t) === normHome);
        const myB = ALL_TEAMS.find(t => normTeam(t) === normAway);
        if (!myA || !myB) continue;
        if (!existingTeams || existingTeams.teamA !== myA || existingTeams.teamB !== myB) {
          try {
            await setDoc(doc(db, "knockoutTeams", tpl.id), {
              teamA: myA, teamB: myB, source: "tsdb", syncedAt: new Date().toISOString()
            });
            updatedTeams++;
          } catch (err) { console.error(err); errors++; }
        }
        break;
      }
    }

    lastSyncTime = new Date();
    const summary = `<span class="ok">✓ SYNCED</span> ${lastSyncTime.toLocaleTimeString()} · ${updatedResults} result${updatedResults===1?"":"s"} · ${updatedTeams} bracket update${updatedTeams===1?"":"s"}${errors ? ` · <span class="err">${errors} error${errors===1?"":"s"}</span>` : ""}`;
    if (status) status.innerHTML = summary;
    if (manual) toast("Sync complete");
  } catch (e) {
    console.error(e);
    if (status) status.innerHTML = `<span class="err">✗ ${e.message || "Sync failed"}</span>`;
    if (manual) toast("Sync failed: " + (e.message || ""), true);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ============================================================
// EVENT WIRING
// ============================================================
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.onclick = () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
    ["matches", "bracket", "champion", "topscorer", "leaderboard"].forEach(t => {
      document.getElementById("tab-" + t).style.display = activeTab === t ? "" : "none";
    });
  };
});

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    activeFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
    renderMatches();
  };
});

document.getElementById("sync-btn").onclick = () => syncFromTSDB(true);

const autoToggle = document.getElementById("auto-sync-toggle");
autoToggle.checked = localStorage.getItem("wc26_autosync") === "1";
function applyAutoSync() {
  if (autoSyncTimer) { clearInterval(autoSyncTimer); autoSyncTimer = null; }
  if (autoToggle.checked) {
    autoSyncTimer = setInterval(() => syncFromTSDB(false), 5 * 60 * 1000);
  }
}
autoToggle.onchange = () => {
  localStorage.setItem("wc26_autosync", autoToggle.checked ? "1" : "0");
  applyAutoSync();
  if (autoToggle.checked) { toast("Auto-sync ON"); syncFromTSDB(false); }
  else { toast("Auto-sync OFF"); }
};

document.getElementById("topscorer-save").onclick = async () => {
  if (!authenticatedUser) return;
  if (new Date() >= new Date(CHAMPION_LOCK)) { toast("Top scorer picks are locked", true); return; }
  const pick = document.getElementById("topscorer-input").value.trim();
  if (!pick) { toast("Type a player name first", true); return; }
  try {
    await setDoc(doc(db, "topScorers", authenticatedUser), {
      user: authenticatedUser, pick, updatedAt: new Date().toISOString()
    });
    toast(`Top scorer pick: ${pick}`);
  } catch (e) { console.error(e); toast("Couldn't save", true); }
};

document.getElementById("topscorer-actual-save").onclick = async () => {
  if (!authenticatedUser) return;
  const v = document.getElementById("topscorer-actual").value.trim();
  try {
    if (!v) {
      await deleteDoc(doc(db, "meta", "topScorerActual"));
      toast("Cleared");
    } else {
      await setDoc(doc(db, "meta", "topScorerActual"), { value: v, updatedAt: new Date().toISOString(), updatedBy: authenticatedUser });
      toast("Actual top scorer saved");
    }
  } catch (e) { console.error(e); toast("Couldn't save", true); }
};

document.getElementById("teams-list").innerHTML =
  ALL_TEAMS.map(t => `<option value="${t}"></option>`).join("");

function renderAll() {
  renderUserBar();
  renderMatches();
  renderBracket();
  renderChampion();
  renderTopScorer();
  renderLeaderboard();
}

// Boot
updateHeroCountdown();
renderAll();
if (initFirebase()) startListeners();
applyAutoSync();

// Tick
setInterval(() => {
  updateHeroCountdown();
}, 1000);
setInterval(() => {
  renderMatches();
  renderBracket();
}, 15000);
