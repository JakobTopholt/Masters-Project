// ----- UI elements -----
const startBtn   = document.getElementById('startBtn');
const log        = document.getElementById('log');
const typingArea = document.getElementById('typingArea');   // textarea
const exportBtn  = document.getElementById('exportBtn');    // export button
const nameEl     = document.getElementById('name');         // participant name input

// ----- Status helper -----
const statusEl = document.getElementById('status') || (() => {
  const d = document.createElement('div');
  d.id = 'status';
  d.className = 'status';
  d.style = 'margin-top:8px;font-size:12px;opacity:.8';
  document.querySelector('.card')?.appendChild(d);
  return d;
})();
const setStatus = (t) => { statusEl.textContent = t; console.log('[status]', t); };

// ----- Participant name in localStorage -----
const NAME_KEY = 'typingTest.participantName';
if (nameEl) {
  nameEl.value = localStorage.getItem(NAME_KEY) || '';
  nameEl.addEventListener('input', () =>
    localStorage.setItem(NAME_KEY, nameEl.value.trim())
  );
}

// ----- local storage helpers for events -----
const STORAGE_KEY = 'typingTest.events';
const readEvents  = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
};
const writeEvents = (arr) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
const appendLine  = (t) => {
  const time = new Date().toLocaleTimeString();
  log.textContent = `[${time}] ${t}\n` + log.textContent;
};

// ----- Firebase (CDN ESM imports in a module) -----
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// config (from Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBZMmEM6N8GtgNcvR9h7nm8vZ5r-D_L1-8",
  authDomain: "pain-typing-test.firebaseapp.com",
  projectId: "pain-typing-test",
  storageBucket: "pain-typing-test.firebasestorage.app",
  messagingSenderId: "710181767573",
  appId: "1:710181767573:web:7eb05352c663027f3fce9c"
};

// ----- init Firebase -----
let app, auth, db, uid = null;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db   = getFirestore(app);
  setStatus("Firebase initialized");
} catch (e) {
  setStatus("Firebase init FAILED — check config");
  console.error(e);
}

// ----- export helper -----
// Download an array of events as a JSON file
function downloadJson(filename, data) {
  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ----- session state and creator -----
let currentSessionId = null;

// create a session doc; events will reference sessionId
function startSession() {
  const localId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  currentSessionId = localId;

  if (uid && db) {
    const meta = {
      startedAt: new Date().toISOString(),
      ts_server: serverTimestamp(),
      participantName: nameEl?.value.trim() || null,
      userAgent: navigator.userAgent,
      viewport: { w: innerWidth, h: innerHeight }
    };
    addDoc(collection(db, 'users', uid, 'sessions'), meta)
      .then(ref => {
        currentSessionId = ref.id;              // prefer Firestore id
        appendLine(`↳ session started id: ${ref.id}`);
      })
      .catch(err => appendLine(`↳ session create failed: ${err.message}`));
  }
}

// ----- helper: upsert the user profile document -----
async function saveUserProfile(uid, data) {
  // merge:true = update or create if missing
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

// ----- sign in (anonymous) -----
if (auth) {
  signInAnonymously(auth).catch(e => {
    setStatus("Anon sign-in failed");
    console.error(e);
  });
  onAuthStateChanged(auth, (user) => {
    uid = user?.uid || null;
    setStatus(uid ? `Signed in (anon) uid=${uid.slice(0,6)}…` : "Not signed in");
  });
}

// ----- event recording -----
async function recordEvent(type, extra = {}) {
  const participantName = nameEl?.value.trim() || null;

  const evt = {
    type,
    ts: Date.now(),
    iso: new Date().toISOString(),
    perf: performance.now(),
    participantName,
    sessionId: currentSessionId,
    userAgent: navigator.userAgent,
    viewport: { w: innerWidth, h: innerHeight },
    ...extra
  };

  // local-first
  const events = readEvents();
  events.unshift(evt);
  writeEvents(events);
  appendLine(`${evt.type} at ${evt.iso} (local ok)`);
  console.log('Recorded event:', evt);

  // try online
  try {
    if (!uid || !db) throw new Error("No uid/db yet");

    // make sure user profile exists / is updated
    if (participantName) {
      await saveUserProfile(uid, {
        name: participantName,
        updatedAt: serverTimestamp()
      });
    }

    const ref = await addDoc(
      collection(db, 'users', uid, 'events'),
      { ...evt, ts_server: serverTimestamp() }
    );
    appendLine(`↳ saved online id: ${ref.id}`);
  } catch (e) {
    appendLine(`↳ online save failed: ${e.message}`);
    console.warn(e);
  }
}

// ----- extra event logging for typing area -----
if (typingArea) {
  // When user focuses the textarea
  typingArea.addEventListener('focus', () => {
    recordEvent('typing-focus');
  });

  // When user leaves the textarea
  typingArea.addEventListener('blur', () => {
    recordEvent('typing-blur');
  });

  // When user presses a key (we log which key)
  typingArea.addEventListener('keydown', (e) => {
    recordEvent('typing-keydown', {
      key: e.key,
      code: e.code,
      ctrl: e.ctrlKey,
      alt: e.altKey,
      meta: e.metaKey,
    });
  });

  // When the text content changes (we log length only, not full text)
  typingArea.addEventListener('input', (e) => {
    recordEvent('typing-input', {
      length: e.target.value.length
    });
  });
}

// ----- show last event on load -----
const prev = readEvents()[0];
if (prev) appendLine(`Last event: ${prev.type} at ${prev.iso}`);

// ----- wire buttons -----
startBtn.addEventListener('click', async () => {
  if (!currentSessionId) startSession();
  await recordEvent('start-button-pressed');
});

if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const events = readEvents();
    if (!events.length) {
      appendLine('No events to export yet.');
      return;
    }

    const filename = `typing-events-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')}.json`;

    downloadJson(filename, events);
    appendLine(`Exported ${events.length} events to ${filename}`);
  });
}