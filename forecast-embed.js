/**
 * Interactive Forecast Widget
 * Inspired by Good Judgement Open
 *
 * Features:
 * - Probability sliders for binary questions
 * - Crowd forecast aggregation
 * - Forecast history tracking over time (SVG chart)
 * - Rationales for each forecast
 * - Brier score calculation (basic)
 *
 * Usage:
 *   ForecastWidget.init({ container: '#my-div', questions: [...] });
 */

(function () {
  'use strict';

  var SK = 'fw_votes';
  var TK = 'fw_tallies';
  var HK = 'fw_history';
  var RK = 'fw_rationales';
  var PK = 'fw_probs';

  // ── Styles ──
  var CSS = '\
.fw-wrap { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 720px; margin: 0 auto; }\
.fw-card { background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 24px; overflow: hidden; border: 1px solid #e8e8e8; transition: box-shadow 0.2s ease; }\
.fw-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.12); }\
.fw-hdr { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 20px 24px; }\
.fw-dl { display: inline-block; background: rgba(255,255,255,0.15); color: #a8d8ea; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 4px; margin-bottom: 10px; }\
.fw-q { color: #fff; font-size: 17px; font-weight: 600; line-height: 1.45; margin: 0; }\
.fw-bd { padding: 20px 24px; }\
.fw-ctx { font-size: 13px; color: #6b7280; line-height: 1.55; margin-bottom: 18px; padding: 12px 14px; background: #f9fafb; border-radius: 8px; border-left: 3px solid #3b82f6; }\
.fw-lbl { font-size: 12px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }\
.fw-opts { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }\
.fw-opt { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer; font-size: 14px; font-weight: 500; color: #374151; }\
.fw-opt:hover { border-color: #3b82f6; background: #eff6ff; }\
.fw-opt.sel { border-color: #3b82f6; background: #eff6ff; color: #1d4ed8; }\
.fw-dot { width: 20px; height: 20px; border: 2px solid #d1d5db; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\
.fw-opt.sel .fw-dot { border-color: #3b82f6; background: #3b82f6; }\
.fw-opt.sel .fw-dot::after { content: ""; display: block; width: 8px; height: 8px; background: #fff; border-radius: 50%; }\
.fw-slider-wrap { margin-bottom: 16px; }\
.fw-slider-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }\
.fw-slider-label { font-size: 13px; font-weight: 500; color: #374151; width: 120px; flex-shrink: 0; }\
.fw-slider { flex: 1; height: 6px; -webkit-appearance: none; appearance: none; background: #e5e7eb; border-radius: 3px; outline: none; }\
.fw-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }\
.fw-slider-pct { font-size: 14px; font-weight: 700; color: #1f2937; width: 44px; text-align: right; }\
.fw-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; letter-spacing: 0.3px; }\
.fw-btn:hover { background: linear-gradient(135deg, #2563eb, #1d4ed8); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.35); }\
.fw-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }\
.fw-rat-box { margin-bottom: 16px; }\
.fw-rat-input { width: 100%; min-height: 60px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; resize: vertical; color: #374151; box-sizing: border-box; }\
.fw-rat-input::placeholder { color: #9ca3af; }\
.fw-rat-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }\
.fw-res { display: flex; flex-direction: column; gap: 10px; }\
.fw-row { display: flex; align-items: center; gap: 12px; }\
.fw-rl { width: 140px; font-size: 13px; font-weight: 500; color: #374151; flex-shrink: 0; text-align: right; }\
.fw-trk { flex: 1; height: 28px; background: #f3f4f6; border-radius: 6px; overflow: hidden; }\
.fw-bar { height: 100%; border-radius: 6px; transition: width 0.8s cubic-bezier(0.25,0.46,0.45,0.94); min-width: 2px; }\
.fw-c0 { background: linear-gradient(90deg, #3b82f6, #60a5fa); }\
.fw-c1 { background: linear-gradient(90deg, #ef4444, #f87171); }\
.fw-c2 { background: linear-gradient(90deg, #f59e0b, #fbbf24); }\
.fw-c3 { background: linear-gradient(90deg, #10b981, #34d399); }\
.fw-c4 { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }\
.fw-pct { width: 48px; font-size: 14px; font-weight: 700; color: #1f2937; text-align: right; flex-shrink: 0; }\
.fw-crowd { display: flex; align-items: center; gap: 16px; padding: 14px 16px; background: linear-gradient(135deg, #eff6ff, #f0fdf4); border-radius: 10px; margin-bottom: 16px; border: 1px solid #dbeafe; }\
.fw-crowd-val { font-size: 28px; font-weight: 800; color: #1d4ed8; }\
.fw-crowd-info { font-size: 12px; color: #6b7280; line-height: 1.4; }\
.fw-crowd-info strong { color: #374151; }\
.fw-history { margin-bottom: 16px; }\
.fw-history-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }\
.fw-chart { width: 100%; height: 80px; background: #f9fafb; border-radius: 8px; border: 1px solid #f3f4f6; overflow: hidden; }\
.fw-rats { margin-top: 16px; border-top: 1px solid #f3f4f6; padding-top: 14px; }\
.fw-rats-title { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }\
.fw-rat-item { padding: 10px 12px; background: #f9fafb; border-radius: 8px; margin-bottom: 8px; font-size: 13px; color: #374151; line-height: 1.5; border-left: 3px solid #3b82f6; }\
.fw-rat-meta { font-size: 11px; color: #9ca3af; margin-top: 4px; }\
.fw-brier { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #fef3c7; border-radius: 6px; font-size: 11px; font-weight: 600; color: #92400e; }\
.fw-ft { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 14px; border-top: 1px solid #f3f4f6; flex-wrap: wrap; gap: 8px; }\
.fw-vc { font-size: 12px; color: #9ca3af; }\
.fw-yv { font-size: 12px; color: #3b82f6; font-weight: 600; }\
.fw-ch { font-size: 12px; color: #6b7280; background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 12px; cursor: pointer; }\
.fw-ch:hover { color: #3b82f6; border-color: #3b82f6; background: #eff6ff; }\
.fw-tabs { display: flex; gap: 0; margin-bottom: 16px; border-bottom: 2px solid #f3f4f6; }\
.fw-tab { padding: 8px 16px; font-size: 12px; font-weight: 600; color: #9ca3af; cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; margin-bottom: -2px; }\
.fw-tab:hover { color: #6b7280; }\
.fw-tab.active { color: #3b82f6; border-bottom-color: #3b82f6; }\
.fw-panel { display: none; }\
.fw-panel.active { display: block; }\
@media (max-width: 600px) {\
  .fw-hdr { padding: 16px 18px; }\
  .fw-bd { padding: 16px 18px; }\
  .fw-q { font-size: 15px; }\
  .fw-rl { width: 100px; font-size: 12px; }\
  .fw-slider-label { width: 80px; font-size: 12px; }\
  .fw-crowd-val { font-size: 22px; }\
}\
';

  // ── Storage helpers ──
  function getJ(k) { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch(e) { return {}; } }
  function setJ(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  function getVotes() { return getJ(SK); }
  function setVote(id, val) { var v = getVotes(); v[id] = val; setJ(SK, v); }
  function clearVote(id) { var v = getVotes(); delete v[id]; setJ(SK, v); }

  function getTallies() { return getJ(TK); }
  function addTally(id, opt) { var t = getTallies(); if (!t[id]) t[id] = {}; t[id][opt] = (t[id][opt] || 0) + 1; setJ(TK, t); return t[id]; }
  function rmTally(id, opt) { var t = getTallies(); if (t[id] && t[id][opt]) t[id][opt] = Math.max(0, t[id][opt] - 1); setJ(TK, t); return t[id] || {}; }
  function totalVotes(tl) { var s = 0; for (var k in tl) s += tl[k]; return s; }

  function getProbs() { return getJ(PK); }
  function setProb(id, probObj) { var p = getProbs(); p[id] = probObj; setJ(PK, p); }
  function clearProb(id) { var p = getProbs(); delete p[id]; setJ(PK, p); }

  function getHistory() { return getJ(HK); }
  function addHistory(id, probObj) {
    var h = getHistory();
    if (!h[id]) h[id] = [];
    h[id].push({ t: Date.now(), p: probObj });
    if (h[id].length > 50) h[id] = h[id].slice(-50);
    setJ(HK, h);
  }

  function getRationales() { return getJ(RK); }
  function addRationale(id, text, vote) {
    var r = getRationales();
    if (!r[id]) r[id] = [];
    r[id].push({ text: text, vote: vote, t: Date.now() });
    if (r[id].length > 20) r[id] = r[id].slice(-20);
    setJ(RK, r);
  }

  function calcBrier(probHistory, outcome) {
    if (!probHistory || !probHistory.length || outcome === undefined) return null;
    var last = probHistory[probHistory.length - 1].p;
    if (!last) return null;
    var score = 0;
    var n = 0;
    for (var opt in last) {
      var f = last[opt] / 100;
      var o = (opt === outcome) ? 1 : 0;
      score += (f - o) * (f - o);
      n++;
    }
    return n > 0 ? (score / n).toFixed(3) : null;
  }

  // ── SVG chart ──
  function drawChart(container, history, options) {
    if (!history || history.length < 2) {
      container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:12px;">History will appear after multiple forecasts</div>';
      return;
    }
    var w = container.offsetWidth || 300;
    var h = 80;
    var pad = 8;
    var pw = w - pad * 2;
    var ph = h - pad * 2;
    var firstOpt = options[0];
    var points = [];

    for (var i = 0; i < history.length; i++) {
      var x = pad + (i / (history.length - 1)) * pw;
      var val = (history[i].p && history[i].p[firstOpt] !== undefined) ? history[i].p[firstOpt] : 50;
      var y = pad + ph - (val / 100) * ph;
      points.push(x.toFixed(1) + ',' + y.toFixed(1));
    }

    var svg = '<svg width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg">';
    for (var g = 25; g <= 75; g += 25) {
      var gy = pad + ph - (g / 100) * ph;
      svg += '<line x1="' + pad + '" y1="' + gy + '" x2="' + (w - pad) + '" y2="' + gy + '" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,4"/>';
      svg += '<text x="' + (w - pad - 2) + '" y="' + (gy - 3) + '" font-size="9" fill="#9ca3af" text-anchor="end">' + g + '%</text>';
    }
    svg += '<polyline points="' + points.join(' ') + '" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    for (var d = 0; d < points.length; d++) {
      svg += '<circle cx="' + points[d].split(',')[0] + '" cy="' + points[d].split(',')[1] + '" r="3" fill="#3b82f6"/>';
    }
    svg += '</svg>';
    container.innerHTML = svg;
  }

  // ── Render card ──
  function renderCard(q, root) {
    var votes = getVotes();
    var probs = getProbs();
    var voted = votes[q.id] !== undefined || probs[q.id] !== undefined;

    var card = document.createElement('div');
    card.className = 'fw-card';
    card.id = 'fw-c-' + q.id;

    var html = '<div class="fw-hdr">';
    html += '<div class="fw-dl">' + esc(q.deadline) + '</div>';
    html += '<p class="fw-q">' + esc(q.question) + '</p>';
    html += '</div><div class="fw-bd">';
    if (q.context) html += '<div class="fw-ctx">' + esc(q.context) + '</div>';
    html += '<div class="fw-lbl">' + (voted ? 'Community Forecast' : 'What do you think?') + '</div>';
    html += '<div class="fw-content"></div></div>';
    card.innerHTML = html;

    var ct = card.querySelector('.fw-content');
    if (voted) {
      showResults(q, ct);
    } else {
      showVoting(q, ct);
    }
    root.appendChild(card);
  }

  // ── Voting view ──
  function showVoting(q, ct) {
    ct.innerHTML = '';
    if (q.options.length === 2) {
      showSliderVoting(q, ct);
    } else {
      showOptionVoting(q, ct);
    }
  }

  function showSliderVoting(q, ct) {
    var wrap = document.createElement('div');
    wrap.className = 'fw-slider-wrap';
    var val = 50;

    var row = document.createElement('div');
    row.className = 'fw-slider-row';
    row.innerHTML = '<span class="fw-slider-label">' + esc(q.options[0]) + '</span>' +
      '<input type="range" class="fw-slider" min="1" max="99" value="50">' +
      '<span class="fw-slider-pct">50%</span>';
    wrap.appendChild(row);

    var row2 = document.createElement('div');
    row2.className = 'fw-slider-row';
    row2.innerHTML = '<span class="fw-slider-label">' + esc(q.options[1]) + '</span>' +
      '<div style="flex:1"></div><span class="fw-slider-pct">50%</span>';
    wrap.appendChild(row2);

    var slider = wrap.querySelector('.fw-slider');
    var pct1 = row.querySelector('.fw-slider-pct');
    var pct2 = row2.querySelector('.fw-slider-pct');

    slider.addEventListener('input', function() {
      val = parseInt(this.value);
      pct1.textContent = val + '%';
      pct2.textContent = (100 - val) + '%';
    });

    var ratBox = document.createElement('div');
    ratBox.className = 'fw-rat-box';
    ratBox.innerHTML = '<textarea class="fw-rat-input" placeholder="Share your reasoning (optional)..." maxlength="500"></textarea>';

    var btn = document.createElement('button');
    btn.className = 'fw-btn';
    btn.textContent = 'Submit My Forecast';
    btn.addEventListener('click', function() {
      var probObj = {};
      probObj[q.options[0]] = val;
      probObj[q.options[1]] = 100 - val;
      setProb(q.id, probObj);
      addHistory(q.id, probObj);
      var pick = val >= 50 ? q.options[0] : q.options[1];
      setVote(q.id, pick);
      addTally(q.id, pick);
      var ratText = ratBox.querySelector('.fw-rat-input').value.trim();
      if (ratText) addRationale(q.id, ratText, pick);
      refreshCard(q);
    });

    ct.appendChild(wrap);
    ct.appendChild(ratBox);
    ct.appendChild(btn);
  }

  function showOptionVoting(q, ct) {
    var sel = null;
    var od = document.createElement('div');
    od.className = 'fw-opts';

    for (var i = 0; i < q.options.length; i++) {
      (function(opt) {
        var b = document.createElement('button');
        b.className = 'fw-opt';
        b.innerHTML = '<span>' + esc(opt) + '</span><span class="fw-dot"></span>';
        b.addEventListener('click', function() {
          var all = od.querySelectorAll('.fw-opt');
          for (var j = 0; j < all.length; j++) all[j].classList.remove('sel');
          b.classList.add('sel');
          sel = opt;
          btn.disabled = false;
        });
        od.appendChild(b);
      })(q.options[i]);
    }

    var ratBox = document.createElement('div');
    ratBox.className = 'fw-rat-box';
    ratBox.innerHTML = '<textarea class="fw-rat-input" placeholder="Share your reasoning (optional)..." maxlength="500"></textarea>';

    var btn = document.createElement('button');
    btn.className = 'fw-btn';
    btn.textContent = 'Submit My Forecast';
    btn.disabled = true;
    btn.addEventListener('click', function() {
      if (!sel) return;
      setVote(q.id, sel);
      addTally(q.id, sel);
      var probObj = {};
      var base = Math.floor(100 / q.options.length);
      for (var k = 0; k < q.options.length; k++) {
        probObj[q.options[k]] = base;
      }
      probObj[sel] = 100 - base * (q.options.length - 1);
      setProb(q.id, probObj);
      addHistory(q.id, probObj);
      var ratText = ratBox.querySelector('.fw-rat-input').value.trim();
      if (ratText) addRationale(q.id, ratText, sel);
      refreshCard(q);
    });

    ct.appendChild(od);
    ct.appendChild(ratBox);
    ct.appendChild(btn);
  }

  // ── Results view ──
  function showResults(q, ct) {
    ct.innerHTML = '';

    var tallies = getTallies();
    var tally = tallies[q.id] || {};
    var tot = totalVotes(tally);
    var probs = getProbs();
    var myProb = probs[q.id];
    var votes = getVotes();
    var myVote = votes[q.id];
    var history = getHistory();
    var hist = history[q.id] || [];
    var rats = getRationales();
    var ratList = rats[q.id] || [];

    // Tabs
    var tabs = document.createElement('div');
    tabs.className = 'fw-tabs';
    tabs.innerHTML = '<button class="fw-tab active" data-tab="forecast">Forecast</button>' +
      '<button class="fw-tab" data-tab="history">History</button>' +
      '<button class="fw-tab" data-tab="rationales">Rationales (' + ratList.length + ')</button>';

    var panels = document.createElement('div');

    // Forecast panel
    var pForecast = document.createElement('div');
    pForecast.className = 'fw-panel active';
    pForecast.setAttribute('data-panel', 'forecast');

    if (myProb && q.options.length === 2) {
      var crowdVal = myProb[q.options[0]] || 50;
      var crowdDiv = document.createElement('div');
      crowdDiv.className = 'fw-crowd';
      crowdDiv.innerHTML = '<span class="fw-crowd-val">' + crowdVal + '%</span>' +
        '<span class="fw-crowd-info"><strong>Crowd Forecast: ' + esc(q.options[0]) + '</strong><br>' + tot + ' forecaster' + (tot !== 1 ? 's' : '') + '</span>';
      pForecast.appendChild(crowdDiv);
    }

    var res = document.createElement('div');
    res.className = 'fw-res';
    for (var i = 0; i < q.options.length; i++) {
      var opt = q.options[i];
      var cnt = tally[opt] || 0;
      var pct = tot > 0 ? Math.round(cnt / tot * 100) : 0;
      if (myProb && myProb[opt] !== undefined) pct = myProb[opt];

      var row = document.createElement('div');
      row.className = 'fw-row';
      row.innerHTML = '<span class="fw-rl">' + esc(opt) + '</span>' +
        '<div class="fw-trk"><div class="fw-bar fw-c' + (i % 5) + '" style="width:0%"></div></div>' +
        '<span class="fw-pct">' + pct + '%</span>';
      res.appendChild(row);

      (function(r, p) {
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            r.querySelector('.fw-bar').style.width = p + '%';
          });
        });
      })(row, pct);
    }
    pForecast.appendChild(res);

    if (q.outcome) {
      var brier = calcBrier(hist, q.outcome);
      if (brier !== null) {
        var bs = document.createElement('div');
        bs.style.marginTop = '12px';
        bs.innerHTML = '<span class="fw-brier">Brier Score: ' + brier + '</span>';
        pForecast.appendChild(bs);
      }
    }

    // History panel
    var pHistory = document.createElement('div');
    pHistory.className = 'fw-panel';
    pHistory.setAttribute('data-panel', 'history');

    var chartTitle = document.createElement('div');
    chartTitle.className = 'fw-history-title';
    chartTitle.textContent = 'Forecast over time \u2014 ' + q.options[0];
    pHistory.appendChild(chartTitle);

    var chartBox = document.createElement('div');
    chartBox.className = 'fw-chart';
    pHistory.appendChild(chartBox);

    // Rationales panel
    var pRats = document.createElement('div');
    pRats.className = 'fw-panel';
    pRats.setAttribute('data-panel', 'rationales');

    if (ratList.length === 0) {
      pRats.innerHTML = '<div style="color:#9ca3af;font-size:13px;padding:12px 0;">No rationales shared yet. Be the first to explain your reasoning!</div>';
    } else {
      for (var r = ratList.length - 1; r >= 0; r--) {
        var item = ratList[r];
        var rd = document.createElement('div');
        rd.className = 'fw-rat-item';
        var dateStr = new Date(item.t).toLocaleDateString();
        rd.innerHTML = esc(item.text) + '<div class="fw-rat-meta">Forecast: ' + esc(item.vote) + ' &middot; ' + dateStr + '</div>';
        pRats.appendChild(rd);
      }
    }

    panels.appendChild(pForecast);
    panels.appendChild(pHistory);
    panels.appendChild(pRats);

    // Tab switching
    var tabBtns = tabs.querySelectorAll('.fw-tab');
    for (var t = 0; t < tabBtns.length; t++) {
      (function(btn) {
        btn.addEventListener('click', function() {
          for (var x = 0; x < tabBtns.length; x++) tabBtns[x].classList.remove('active');
          btn.classList.add('active');
          var allPanels = panels.querySelectorAll('.fw-panel');
          for (var x = 0; x < allPanels.length; x++) allPanels[x].classList.remove('active');
          var target = panels.querySelector('[data-panel="' + btn.getAttribute('data-tab') + '"]');
          if (target) target.classList.add('active');
          if (btn.getAttribute('data-tab') === 'history') {
            drawChart(chartBox, hist, q.options);
          }
        });
      })(tabBtns[t]);
    }

    // Footer
    var ft = document.createElement('div');
    ft.className = 'fw-ft';
    ft.innerHTML = '<span class="fw-vc">' + tot + ' forecast' + (tot !== 1 ? 's' : '') + '</span>' +
      '<span class="fw-yv">Your forecast: ' + esc(myVote || '\u2014') + '</span>' +
      '<button class="fw-ch">Change</button>';
    ft.querySelector('.fw-ch').addEventListener('click', function() {
      var old = getVotes()[q.id];
      if (old) rmTally(q.id, old);
      clearVote(q.id);
      clearProb(q.id);
      refreshCard(q);
    });

    ct.appendChild(tabs);
    ct.appendChild(panels);
    ct.appendChild(ft);
  }

  function refreshCard(q) {
    var card = document.getElementById('fw-c-' + q.id);
    if (!card) return;
    var votes = getVotes();
    var probs = getProbs();
    var voted = votes[q.id] !== undefined || probs[q.id] !== undefined;
    card.querySelector('.fw-lbl').textContent = voted ? 'Community Forecast' : 'What do you think?';
    var ct = card.querySelector('.fw-content');
    ct.innerHTML = '';
    if (voted) {
      showResults(q, ct);
    } else {
      showVoting(q, ct);
    }
  }

  // ── Init ──
  function init(config) {
    if (!document.getElementById('fw-styles')) {
      var style = document.createElement('style');
      style.id = 'fw-styles';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    var root = document.querySelector(config.container);
    if (!root) {
      console.error('[ForecastWidget] Container not found:', config.container);
      return;
    }

    root.innerHTML = '';
    var wrapper = document.createElement('div');
    wrapper.className = 'fw-wrap';
    root.appendChild(wrapper);

    var questions = config.questions || [];
    for (var i = 0; i < questions.length; i++) {
      renderCard(questions[i], wrapper);
    }
  }

  window.ForecastWidget = { init: init };
})();
