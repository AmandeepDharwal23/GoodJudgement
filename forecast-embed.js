/**
 * Interactive Forecast Widget
 * Inspired by Good Judgement Open
 *
 * Embed this on any website (including Webflow) to create
 * interactive forecast/prediction questions.
 *
 * Usage:
 *   ForecastWidget.init({ container: '#my-div', questions: [...] });
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'forecast_widget_votes';

  // ── Styles ──────────────────────────────────────────────────────────
  const CSS = `
    .fw-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 720px;
      margin: 0 auto;
    }

    .fw-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      margin-bottom: 24px;
      overflow: hidden;
      border: 1px solid #e8e8e8;
      transition: box-shadow 0.2s ease;
    }

    .fw-card:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    }

    .fw-header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 20px 24px;
      position: relative;
    }

    .fw-deadline {
      display: inline-block;
      background: rgba(255, 255, 255, 0.15);
      color: #a8d8ea;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .fw-question {
      color: #ffffff;
      font-size: 17px;
      font-weight: 600;
      line-height: 1.45;
      margin: 0;
    }

    .fw-body {
      padding: 20px 24px;
    }

    .fw-context {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.55;
      margin-bottom: 18px;
      padding: 12px 14px;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 3px solid #3b82f6;
    }

    .fw-label {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .fw-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .fw-option-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      background: #ffffff;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
    }

    .fw-option-btn:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .fw-option-btn.fw-selected {
      border-color: #3b82f6;
      background: #eff6ff;
      color: #1d4ed8;
    }

    .fw-option-btn.fw-selected .fw-radio {
      border-color: #3b82f6;
      background: #3b82f6;
    }

    .fw-option-btn.fw-selected .fw-radio::after {
      content: '';
      display: block;
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
    }

    .fw-radio {
      width: 20px;
      height: 20px;
      border: 2px solid #d1d5db;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .fw-submit-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.3px;
    }

    .fw-submit-btn:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
    }

    .fw-submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    /* ── Results view ── */
    .fw-results {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .fw-result-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .fw-result-label {
      width: 140px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      flex-shrink: 0;
      text-align: right;
    }

    .fw-bar-track {
      flex: 1;
      height: 28px;
      background: #f3f4f6;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }

    .fw-bar-fill {
      height: 100%;
      border-radius: 6px;
      transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      min-width: 2px;
    }

    .fw-bar-fill.fw-color-0 { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
    .fw-bar-fill.fw-color-1 { background: linear-gradient(90deg, #ef4444, #f87171); }
    .fw-bar-fill.fw-color-2 { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .fw-bar-fill.fw-color-3 { background: linear-gradient(90deg, #10b981, #34d399); }
    .fw-bar-fill.fw-color-4 { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }

    .fw-result-pct {
      width: 48px;
      font-size: 14px;
      font-weight: 700;
      color: #1f2937;
      text-align: right;
      flex-shrink: 0;
    }

    .fw-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid #f3f4f6;
    }

    .fw-vote-count {
      font-size: 12px;
      color: #9ca3af;
    }

    .fw-your-vote {
      font-size: 12px;
      color: #3b82f6;
      font-weight: 600;
    }

    .fw-change-btn {
      font-size: 12px;
      color: #6b7280;
      background: none;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 4px 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .fw-change-btn:hover {
      color: #3b82f6;
      border-color: #3b82f6;
      background: #eff6ff;
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .fw-header { padding: 16px 18px; }
      .fw-body { padding: 16px 18px; }
      .fw-question { font-size: 15px; }
      .fw-result-label { width: 100px; font-size: 12px; }
      .fw-result-row { gap: 8px; }
    }
  `;

  // ── Helpers ─────────────────────────────────────────────────────────
  function loadVotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveVote(questionId, option) {
    const votes = loadVotes();
    votes[questionId] = option;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  }

  function loadTallies() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY + '_tallies') || '{}');
    } catch {
      return {};
    }
  }

  function saveTallies(tallies) {
    localStorage.setItem(STORAGE_KEY + '_tallies', JSON.stringify(tallies));
  }

  function recordTally(questionId, option) {
    const tallies = loadTallies();
    if (!tallies[questionId]) tallies[questionId] = {};
    tallies[questionId][option] = (tallies[questionId][option] || 0) + 1;
    saveTallies(tallies);
    return tallies[questionId];
  }

  function removeTally(questionId, option) {
    const tallies = loadTallies();
    if (tallies[questionId] && tallies[questionId][option]) {
      tallies[questionId][option] = Math.max(0, tallies[questionId][option] - 1);
    }
    saveTallies(tallies);
    return tallies[questionId] || {};
  }

  function getTotalVotes(tally) {
    return Object.values(tally).reduce((sum, v) => sum + v, 0);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Render ──────────────────────────────────────────────────────────
  function renderQuestion(q, container) {
    const votes = loadVotes();
    const hasVoted = votes[q.id] !== undefined;

    const card = document.createElement('div');
    card.className = 'fw-card';
    card.id = 'fw-card-' + q.id;

    // Header
    card.innerHTML = `
      <div class="fw-header">
        <div class="fw-deadline">${escapeHtml(q.deadline)}</div>
        <p class="fw-question">${escapeHtml(q.question)}</p>
      </div>
      <div class="fw-body">
        ${q.context ? `<div class="fw-context">${escapeHtml(q.context)}</div>` : ''}
        <div class="fw-label">${hasVoted ? 'Community Forecast' : 'What do you think?'}</div>
        <div class="fw-content"></div>
      </div>
    `;

    const contentEl = card.querySelector('.fw-content');

    if (hasVoted) {
      renderResults(q, contentEl, votes[q.id]);
    } else {
      renderVoting(q, contentEl);
    }

    container.appendChild(card);
  }

  function renderVoting(q, container) {
    let selected = null;

    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'fw-options';

    q.options.forEach(function (opt) {
      const btn = document.createElement('button');
      btn.className = 'fw-option-btn';
      btn.innerHTML = `
        <span>${escapeHtml(opt)}</span>
        <span class="fw-radio"></span>
      `;
      btn.addEventListener('click', function () {
        optionsDiv.querySelectorAll('.fw-option-btn').forEach(function (b) {
          b.classList.remove('fw-selected');
        });
        btn.classList.add('fw-selected');
        selected = opt;
        submitBtn.disabled = false;
      });
      optionsDiv.appendChild(btn);
    });

    const submitBtn = document.createElement('button');
    submitBtn.className = 'fw-submit-btn';
    submitBtn.textContent = 'Submit My Forecast';
    submitBtn.disabled = true;
    submitBtn.addEventListener('click', function () {
      if (!selected) return;
      saveVote(q.id, selected);
      recordTally(q.id, selected);

      // Re-render card
      const card = document.getElementById('fw-card-' + q.id);
      const body = card.querySelector('.fw-content');
      const label = card.querySelector('.fw-label');
      label.textContent = 'Community Forecast';
      body.innerHTML = '';
      renderResults(q, body, selected);
    });

    container.appendChild(optionsDiv);
    container.appendChild(submitBtn);
  }

  function renderResults(q, container, userVote) {
    const tallies = loadTallies();
    const tally = tallies[q.id] || {};
    const total = getTotalVotes(tally);

    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'fw-results';

    q.options.forEach(function (opt, i) {
      const count = tally[opt] || 0;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;

      const row = document.createElement('div');
      row.className = 'fw-result-row';
      row.innerHTML = `
        <span class="fw-result-label">${escapeHtml(opt)}</span>
        <div class="fw-bar-track">
          <div class="fw-bar-fill fw-color-${i % 5}" style="width: 0%"></div>
        </div>
        <span class="fw-result-pct">${pct}%</span>
      `;
      resultsDiv.appendChild(row);

      // Animate bar
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          row.querySelector('.fw-bar-fill').style.width = pct + '%';
        });
      });
    });

    // Footer
    const footer = document.createElement('div');
    footer.className = 'fw-footer';
    footer.innerHTML = `
      <span class="fw-vote-count">${total} forecast${total !== 1 ? 's' : ''}</span>
      <span class="fw-your-vote">Your forecast: ${escapeHtml(userVote)}</span>
      <button class="fw-change-btn">Change</button>
    `;

    footer.querySelector('.fw-change-btn').addEventListener('click', function () {
      // Remove old vote tally
      const votes = loadVotes();
      const oldVote = votes[q.id];
      if (oldVote) {
        removeTally(q.id, oldVote);
      }

      // Clear vote
      const allVotes = loadVotes();
      delete allVotes[q.id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allVotes));

      // Re-render
      const card = document.getElementById('fw-card-' + q.id);
      const body = card.querySelector('.fw-content');
      const label = card.querySelector('.fw-label');
      label.textContent = 'What do you think?';
      body.innerHTML = '';
      renderVoting(q, body);
    });

    container.appendChild(resultsDiv);
    container.appendChild(footer);
  }

  // ── Init ────────────────────────────────────────────────────────────
  function init(config) {
    // Inject styles
    if (!document.getElementById('fw-styles')) {
      const style = document.createElement('style');
      style.id = 'fw-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    const root = document.querySelector(config.container);
    if (!root) {
      console.error('[ForecastWidget] Container not found:', config.container);
      return;
    }

    root.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'fw-container';
    root.appendChild(wrapper);

    (config.questions || []).forEach(function (q) {
      renderQuestion(q, wrapper);
    });
  }

  // ── Public API ──────────────────────────────────────────────────────
  window.ForecastWidget = { init: init };
})();
