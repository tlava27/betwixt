(function () {
  const LAUNCH_DATE = "2026-09-25"; // Eastern calendar date for puzzle index 0
  const MAX_ATTEMPTS = 3;
  const STORAGE_STREAK = "betwixt_streak";
  const STORAGE_LAST_PLAYED = "betwixt_lastPlayedDate";
  const STORAGE_STATE_PREFIX = "betwixt_state_";

  function getEasternDateString(date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  }

  function dateStringToDayCount(dateStr) {
    // Treat the Eastern calendar-date label as a UTC midnight instant purely
    // to diff whole calendar days — never used as a real timezone offset,
    // so DST transitions in America/New_York can't skew the count.
    return Math.floor(new Date(dateStr + "T00:00:00Z").getTime() / 86400000);
  }

  function getDayIndex(now) {
    const todayStr = getEasternDateString(now);
    return dateStringToDayCount(todayStr) - dateStringToDayCount(LAUNCH_DATE);
  }

  function loadState(dayIndex) {
    const raw = localStorage.getItem(STORAGE_STATE_PREFIX + dayIndex);
    if (!raw) return { attempts: [], solved: false, failed: false };
    try {
      return JSON.parse(raw);
    } catch (e) {
      return { attempts: [], solved: false, failed: false };
    }
  }

  function saveState(dayIndex, state) {
    localStorage.setItem(STORAGE_STATE_PREFIX + dayIndex, JSON.stringify(state));
  }

  function getStreak() {
    const raw = localStorage.getItem(STORAGE_STREAK);
    return raw ? parseInt(raw, 10) || 0 : 0;
  }

  function setStreak(n) {
    localStorage.setItem(STORAGE_STREAK, String(n));
  }

  function applySkipBreak(todayStr, dayIndex) {
    const lastPlayed = localStorage.getItem(STORAGE_LAST_PLAYED);
    if (!lastPlayed) return;
    const lastPlayedIndex = dateStringToDayCount(lastPlayed) - dateStringToDayCount(LAUNCH_DATE);
    if (dayIndex - lastPlayedIndex > 1) {
      setStreak(0);
    }
  }

  function renderBlanks(container, slots) {
    container.innerHTML = "";
    slots.forEach((letter) => {
      const span = document.createElement("span");
      span.className = "blank-slot";
      span.textContent = letter || "_";
      container.appendChild(span);
    });
  }

  // Guesses 1-2: a single continuous line (no countable segments, no length hint).
  // Guess 3+: discrete per-letter boxes at the real answer length.
  function renderBlankArea(container, answer, attemptsUsed) {
    container.innerHTML = "";
    if (attemptsUsed >= 2) {
      const slots = answer.split("").map((ch, i) => (i === 0 ? ch : ""));
      renderBlanks(container, slots);
      return;
    }
    if (attemptsUsed >= 1) {
      const letterSpan = document.createElement("span");
      letterSpan.className = "blank-slot";
      letterSpan.textContent = answer[0];
      container.appendChild(letterSpan);
    }
    const line = document.createElement("span");
    line.className = "blank-line";
    container.appendChild(line);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const now = new Date();
    const todayStr = getEasternDateString(now);
    const dayIndex = getDayIndex(now);

    const gameEl = document.getElementById("game");
    const streakEl = document.getElementById("streak");
    const displayEl = document.getElementById("puzzle-display");
    const attemptsEl = document.getElementById("attempts");
    const messageEl = document.getElementById("message");
    const formEl = document.getElementById("guess-form");
    const inputEl = document.getElementById("guess-input");
    const shareButton = document.getElementById("share-button");

    if (dayIndex < 0) {
      gameEl.innerHTML = '<p class="end-state">Come back soon — Betwixt hasn\'t launched yet.</p>';
      return;
    }

    if (dayIndex >= PUZZLES.length) {
      gameEl.innerHTML =
        '<p class="end-state">Thanks for testing the beta! More puzzles to be added soon.</p>';
      return;
    }

    applySkipBreak(todayStr, dayIndex);

    const puzzle = PUZZLES[dayIndex];
    let state = loadState(dayIndex);

    function renderStreak() {
      const streak = getStreak();
      streakEl.textContent = streak > 0 ? "🔥 Streak: " + streak : "";
    }

    function renderActive() {
      const attemptsUsed = state.attempts.length;
      displayEl.textContent = "";
      const prefix = document.createElement("span");
      prefix.textContent = puzzle.a + " ";
      displayEl.appendChild(prefix);
      const blankSpan = document.createElement("span");
      renderBlankArea(blankSpan, puzzle.answer, attemptsUsed);
      displayEl.appendChild(blankSpan);
      const suffix = document.createElement("span");
      suffix.textContent = " " + puzzle.b;
      displayEl.appendChild(suffix);

      attemptsEl.textContent = "Guess " + (attemptsUsed + 1) + " of " + MAX_ATTEMPTS;
      inputEl.disabled = false;
      inputEl.value = "";
      formEl.querySelector("button").disabled = false;
      shareButton.hidden = true;
      inputEl.focus();
    }

    function renderSolved() {
      const slots = puzzle.answer.split("");
      displayEl.textContent = "";
      const prefix = document.createElement("span");
      prefix.textContent = puzzle.a + " ";
      displayEl.appendChild(prefix);
      const blankSpan = document.createElement("span");
      renderBlanks(blankSpan, slots);
      displayEl.appendChild(blankSpan);
      const suffix = document.createElement("span");
      suffix.textContent = " " + puzzle.b;
      displayEl.appendChild(suffix);

      attemptsEl.textContent = "";
      messageEl.textContent = "Solved in " + state.attempts.length + "/" + MAX_ATTEMPTS + "!";
      messageEl.className = "message solved";
      inputEl.disabled = true;
      formEl.querySelector("button").disabled = true;
      shareButton.hidden = false;
    }

    function renderFailed() {
      const slots = puzzle.answer.split("");
      displayEl.textContent = "";
      const prefix = document.createElement("span");
      prefix.textContent = puzzle.a + " ";
      displayEl.appendChild(prefix);
      const blankSpan = document.createElement("span");
      renderBlanks(blankSpan, slots);
      displayEl.appendChild(blankSpan);
      const suffix = document.createElement("span");
      suffix.textContent = " " + puzzle.b;
      displayEl.appendChild(suffix);

      attemptsEl.textContent = "";
      messageEl.textContent = 'The answer was "' + puzzle.answer + '". Streak broken.';
      messageEl.className = "message failed";
      inputEl.disabled = true;
      formEl.querySelector("button").disabled = true;
      shareButton.hidden = true;
    }

    function render() {
      renderStreak();
      messageEl.textContent = "";
      messageEl.className = "message";
      if (state.solved) {
        renderSolved();
      } else if (state.failed) {
        renderFailed();
      } else {
        renderActive();
      }
    }

    formEl.addEventListener("submit", function (e) {
      e.preventDefault();
      if (state.solved || state.failed) return;

      const guess = inputEl.value.trim().toLowerCase();
      if (!guess) return;

      if (guess === puzzle.answer) {
        state.attempts.push(guess);
        state.solved = true;
        saveState(dayIndex, state);
        setStreak(getStreak() + 1);
        localStorage.setItem(STORAGE_LAST_PLAYED, todayStr);
        render();
        return;
      }

      state.attempts.push(guess);
      if (state.attempts.length >= MAX_ATTEMPTS) {
        state.failed = true;
        saveState(dayIndex, state);
        setStreak(0);
        localStorage.setItem(STORAGE_LAST_PLAYED, todayStr);
        render();
        return;
      }

      saveState(dayIndex, state);
      render();
      messageEl.textContent = "Not quite.";
      messageEl.className = "message miss";
    });

    function fallbackCopy(text) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        return ok;
      } catch (e) {
        return false;
      }
    }

    shareButton.addEventListener("click", function () {
      const text =
        "I solved today's Betwixt in " +
        state.attempts.length +
        "/" +
        MAX_ATTEMPTS +
        "! 🔗";

      function showCopied() {
        shareButton.textContent = "Copied!";
        setTimeout(function () {
          shareButton.textContent = "Share result";
        }, 1500);
      }

      function showManualFallback() {
        messageEl.textContent = 'Copy this: "' + text + '"';
        messageEl.className = "message";
      }

      function tryFallback() {
        if (fallbackCopy(text)) {
          showCopied();
        } else {
          showManualFallback();
        }
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(tryFallback);
      } else {
        tryFallback();
      }
    });

    render();
  });
})();
