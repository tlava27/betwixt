(function () {
  const LAUNCH_DATE = "2026-09-25"; // Eastern calendar date for puzzle index 0
  const MAX_ATTEMPTS = 3;
  const STORAGE_STREAK = "betwixt_streak";
  const STORAGE_LAST_PLAYED = "betwixt_lastPlayedDate";
  const STORAGE_STATE_PREFIX = "betwixt_state_";
  const STORAGE_DEBUG_DAY_OFFSET = "betwixt_debugDayOffset"; // beta-testing "skip to next day" control

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

  function dateStringToDayIndex(dateStr) {
    return dateStringToDayCount(dateStr) - dateStringToDayCount(LAUNCH_DATE);
  }

  // Inverse of dateStringToDayIndex — UTC-anchored like its counterpart, so
  // this stays correct across DST the same way the forward conversion does.
  function dayIndexToDateString(dayIndex) {
    const ms = (dateStringToDayCount(LAUNCH_DATE) + dayIndex) * 86400000;
    return new Date(ms).toISOString().slice(0, 10);
  }

  function getDayIndex(now) {
    const todayStr = getEasternDateString(now);
    const realIndex = dateStringToDayIndex(todayStr);
    const debugOffset = parseInt(localStorage.getItem(STORAGE_DEBUG_DAY_OFFSET) || "0", 10);
    return realIndex + debugOffset;
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

  // Points awarded toward the streak total, keyed by which guess solved it.
  const POINTS_BY_ATTEMPT = { 1: 5, 2: 3, 3: 1 };

  function applySkipBreak(dayIndex) {
    const raw = localStorage.getItem(STORAGE_LAST_PLAYED);
    if (raw === null) return;
    const lastPlayedIndex = parseInt(raw, 10);
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

  // Shared by both share buttons (puzzle result, history). Tries the
  // clipboard API, falls back to execCommand, falls back to a visible
  // "copy this text" message -- never fails silently.
  function copyWithFeedback(text, buttonEl, defaultLabel, messageEl) {
    function showCopied() {
      buttonEl.textContent = "Copied!";
      setTimeout(function () {
        buttonEl.textContent = defaultLabel;
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
  }

  document.addEventListener("DOMContentLoaded", function () {
    const now = new Date();
    const dayIndex = getDayIndex(now);

    const gameEl = document.getElementById("game");
    const streakEl = document.getElementById("streak");
    const displayEl = document.getElementById("puzzle-display");
    const attemptsEl = document.getElementById("attempts");
    const messageEl = document.getElementById("message");
    const formEl = document.getElementById("guess-form");
    const inputEl = document.getElementById("guess-input");
    const shareButton = document.getElementById("share-button");
    const skipDayButton = document.getElementById("skip-day-button");
    const streakInfoButton = document.getElementById("streak-info-button");
    const streakInfoEl = document.getElementById("streak-info");

    if (streakInfoButton) {
      streakInfoButton.addEventListener("click", function () {
        const showing = !streakInfoEl.hidden;
        streakInfoEl.hidden = showing;
        streakInfoButton.setAttribute("aria-expanded", String(!showing));
      });
    }

    if (skipDayButton) {
      skipDayButton.addEventListener("click", function () {
        const current = parseInt(localStorage.getItem(STORAGE_DEBUG_DAY_OFFSET) || "0", 10);
        localStorage.setItem(STORAGE_DEBUG_DAY_OFFSET, String(current + 1));
        location.reload();
      });
    }

    // History modal setup lives before the not-launched/exhausted early
    // returns below, on purpose -- the reopen icon has to keep working even
    // once a player has run out of puzzles to play.
    const historyModalEl = document.getElementById("history-modal");
    const historyGridEl = document.getElementById("history-grid");
    const historyMonthLabelEl = document.getElementById("history-month-label");
    const historyPrevButton = document.getElementById("history-prev-month");
    const historyNextButton = document.getElementById("history-next-month");
    const historyCloseButton = document.getElementById("history-close-button");
    const historyOpenButton = document.getElementById("history-open-button");
    const historyShareButton = document.getElementById("history-share-button");
    const historyShareMessageEl = document.getElementById("history-share-message");

    const MONTH_NAMES = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const STATUS_EMOJI = {
      five: "🟢",
      three: "🟡",
      one: "🟠",
      missed: "🔴",
      skipped: "⭕",
      future: "⬜",
    };

    function ymdToDateString(year, month, day) {
      return year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    }

    function parseDateParts(dateStr) {
      const parts = dateStr.split("-").map(Number);
      return { year: parts[0], month: parts[1] - 1, day: parts[2] };
    }

    const todayParts = parseDateParts(dayIndexToDateString(dayIndex));
    const launchParts = parseDateParts(LAUNCH_DATE);
    let historyViewYear = todayParts.year;
    let historyViewMonth = todayParts.month;

    // Single source of truth for a calendar cell's outcome -- both the
    // rendered grid and the shareable text read from this, so they can't
    // drift out of sync with each other.
    function getDayStatus(cellDayIndex) {
      if (cellDayIndex < 0 || cellDayIndex > dayIndex) return "future";
      const dayState = loadState(cellDayIndex);
      if (dayState.solved) {
        const points = POINTS_BY_ATTEMPT[dayState.attempts.length];
        return points === 5 ? "five" : points === 3 ? "three" : "one";
      }
      if (dayState.failed) return "missed";
      if (cellDayIndex === dayIndex) return "future"; // today, unresolved edge case
      return "skipped";
    }

    function renderHistoryCalendar() {
      historyMonthLabelEl.textContent = MONTH_NAMES[historyViewMonth] + " " + historyViewYear;

      const isEarliestMonth =
        historyViewYear === launchParts.year && historyViewMonth === launchParts.month;
      const isLatestMonth =
        historyViewYear === todayParts.year && historyViewMonth === todayParts.month;
      historyPrevButton.disabled = isEarliestMonth;
      historyNextButton.disabled = isLatestMonth;

      historyGridEl.innerHTML = "";
      const firstWeekday = new Date(historyViewYear, historyViewMonth, 1).getDay();
      const daysInMonth = new Date(historyViewYear, historyViewMonth + 1, 0).getDate();

      for (let i = 0; i < firstWeekday; i++) {
        const blank = document.createElement("div");
        blank.className = "cal-day cal-day--empty";
        historyGridEl.appendChild(blank);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const cellDayIndex = dateStringToDayIndex(
          ymdToDateString(historyViewYear, historyViewMonth, day)
        );
        const cell = document.createElement("div");
        cell.className = "cal-day cal-day--" + getDayStatus(cellDayIndex);
        const circle = document.createElement("span");
        circle.className = "cal-day-circle";
        circle.textContent = String(day);
        cell.appendChild(circle);
        historyGridEl.appendChild(cell);
      }
    }

    function buildHistoryShareText() {
      const firstWeekday = new Date(historyViewYear, historyViewMonth, 1).getDay();
      const daysInMonth = new Date(historyViewYear, historyViewMonth + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < firstWeekday; i++) cells.push(STATUS_EMOJI.future);
      for (let day = 1; day <= daysInMonth; day++) {
        const cellDayIndex = dateStringToDayIndex(
          ymdToDateString(historyViewYear, historyViewMonth, day)
        );
        cells.push(STATUS_EMOJI[getDayStatus(cellDayIndex)]);
      }
      const rows = [];
      for (let i = 0; i < cells.length; i += 7) {
        rows.push(cells.slice(i, i + 7).join(""));
      }
      return (
        "My Betwixt history — " +
        MONTH_NAMES[historyViewMonth] +
        " " +
        historyViewYear +
        " ᴉ\n" +
        rows.join("\n")
      );
    }

    function openHistoryModal() {
      historyViewYear = todayParts.year;
      historyViewMonth = todayParts.month;
      historyShareMessageEl.textContent = "";
      renderHistoryCalendar();
      historyModalEl.hidden = false;
    }

    function closeHistoryModal() {
      historyModalEl.hidden = true;
    }

    historyPrevButton.addEventListener("click", function () {
      historyViewMonth--;
      if (historyViewMonth < 0) {
        historyViewMonth = 11;
        historyViewYear--;
      }
      historyShareMessageEl.textContent = "";
      renderHistoryCalendar();
    });

    historyNextButton.addEventListener("click", function () {
      historyViewMonth++;
      if (historyViewMonth > 11) {
        historyViewMonth = 0;
        historyViewYear++;
      }
      historyShareMessageEl.textContent = "";
      renderHistoryCalendar();
    });

    historyCloseButton.addEventListener("click", closeHistoryModal);

    if (historyOpenButton) {
      historyOpenButton.addEventListener("click", openHistoryModal);
    }

    if (historyShareButton) {
      historyShareButton.addEventListener("click", function () {
        copyWithFeedback(
          buildHistoryShareText(),
          historyShareButton,
          "Share history",
          historyShareMessageEl
        );
      });
    }

    if (dayIndex < 0) {
      gameEl.innerHTML = '<p class="end-state">Come back soon — Betwixt hasn\'t launched yet.</p>';
      return;
    }

    if (dayIndex >= PUZZLES.length) {
      gameEl.innerHTML =
        '<p class="end-state">Thanks for testing the beta! More puzzles to be added soon.</p>';
      return;
    }

    applySkipBreak(dayIndex);

    const puzzle = PUZZLES[dayIndex];
    let state = loadState(dayIndex);

    function renderStreak() {
      const streak = getStreak();
      streakEl.textContent = streak > 0 ? "🔥 Points streak: " + streak : "";
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

    // Post-solve reveal: two translucent ovals laid directly over this same
    // row, sized from the real rendered text so nothing pokes outside either
    // oval -- left oval spans "a"+answer, right spans answer+"b", overlapping
    // exactly on the revealed letters.
    function renderSolved() {
      displayEl.textContent = "";

      const ovalA = document.createElement("div");
      ovalA.className = "overlap-oval";
      const ovalB = document.createElement("div");
      ovalB.className = "overlap-oval";
      displayEl.appendChild(ovalA);
      displayEl.appendChild(ovalB);

      const row = document.createElement("div");
      row.className = "puzzle-row";
      const prefix = document.createElement("span");
      prefix.textContent = puzzle.a;
      row.appendChild(prefix);
      const tileGroup = document.createElement("span");
      renderBlanks(tileGroup, puzzle.answer.split(""));
      row.appendChild(tileGroup);
      const suffix = document.createElement("span");
      suffix.textContent = puzzle.b;
      row.appendChild(suffix);
      displayEl.appendChild(row);

      const pad = 9;
      const wrapRect = displayEl.getBoundingClientRect();
      const spotRect = prefix.getBoundingClientRect();
      const tilesRect = tileGroup.getBoundingClientRect();
      const houseRect = suffix.getBoundingClientRect();
      const top = tilesRect.top - wrapRect.top - pad;
      const height = tilesRect.height + pad * 2;

      ovalA.style.left = spotRect.left - wrapRect.left - pad + "px";
      ovalA.style.width = tilesRect.right - spotRect.left + pad * 2 + "px";
      ovalA.style.top = top + "px";
      ovalA.style.height = height + "px";

      ovalB.style.left = tilesRect.left - wrapRect.left - pad + "px";
      ovalB.style.width = houseRect.right - tilesRect.left + pad * 2 + "px";
      ovalB.style.top = top + "px";
      ovalB.style.height = height + "px";

      attemptsEl.textContent = "";
      const pointsEarned = POINTS_BY_ATTEMPT[state.attempts.length];
      const pointsWord = pointsEarned === 1 ? "point" : "points";
      messageEl.textContent =
        "Solved in " + state.attempts.length + "/" + MAX_ATTEMPTS + "! +" + pointsEarned + " " + pointsWord;
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
      messageEl.textContent = 'The answer was "' + puzzle.answer + '". Points streak broken.';
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
        setStreak(getStreak() + POINTS_BY_ATTEMPT[state.attempts.length]);
        localStorage.setItem(STORAGE_LAST_PLAYED, String(dayIndex));
        render();
        openHistoryModal();
        return;
      }

      state.attempts.push(guess);
      if (state.attempts.length >= MAX_ATTEMPTS) {
        state.failed = true;
        saveState(dayIndex, state);
        setStreak(0);
        localStorage.setItem(STORAGE_LAST_PLAYED, String(dayIndex));
        render();
        openHistoryModal();
        return;
      }

      saveState(dayIndex, state);
      render();
      messageEl.textContent = "Not quite.";
      messageEl.className = "message miss";
    });

    shareButton.addEventListener("click", function () {
      const text =
        "I solved today's Betwixt in " +
        state.attempts.length +
        "/" +
        MAX_ATTEMPTS +
        "! ᴉ";
      copyWithFeedback(text, shareButton, "Share result", messageEl);
    });

    render();
  });
})();
