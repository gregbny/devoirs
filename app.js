/* Mes Devoirs — tables de multiplication & mots de la semaine */
(function () {
  'use strict';

  /* ---------- stockage ---------- */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem('devoirs.' + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem('devoirs.' + key, JSON.stringify(value)); } catch (e) {}
    }
  };

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- navigation ---------- */
  function show(name) {
    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) screens[i].classList.remove('active');
    $('screen-' + name).classList.add('active');
    if (name === 'home') refreshStarBank();
    if (name === 'tables') renderTableGrid();
    if (name === 'words') renderWordsHome();
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-go]');
    if (el) show(el.getAttribute('data-go'));
  });

  /* ---------- étoiles ---------- */
  function addStars(n) {
    store.set('stars', store.get('stars', 0) + n);
  }
  function refreshStarBank() {
    $('star-total').textContent = store.get('stars', 0);
  }

  /* ---------- sons ---------- */
  var audioCtx = null;
  function beep(freqs) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var t = audioCtx.currentTime;
      for (var i = 0; i < freqs.length; i++) {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freqs[i];
        gain.gain.setValueAtTime(0.18, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.25);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(t + i * 0.12); osc.stop(t + i * 0.12 + 0.3);
      }
    } catch (e) {}
  }
  function soundGood() { beep([523, 659, 784]); }
  function soundBad() { beep([220, 180]); }
  function soundWin() { beep([523, 659, 784, 1047, 1319]); }

  /* ---------- confetti ---------- */
  var confetti = (function () {
    var canvas = $('confetti-canvas');
    var ctx = canvas.getContext('2d');
    var parts = [];
    var running = false;
    var colors = ['#6c5ce7', '#00b894', '#fdcb6e', '#e17055', '#0984e3', '#e84393'];
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();
    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var alive = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.y += p.vy; p.x += p.vx; p.vy += 0.15; p.rot += p.vrot;
        if (p.y < canvas.height + 30) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (alive) { requestAnimationFrame(tick); } else { running = false; parts = []; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }
    return function burst(count) {
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * canvas.height * 0.4,
          vx: (Math.random() - 0.5) * 3,
          vy: 2 + Math.random() * 4,
          size: 8 + Math.random() * 10,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.3,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
      if (!running) { running = true; requestAnimationFrame(tick); }
    };
  })();

  /* ================================================================
     MULTIPLICATIONS
     ================================================================ */
  var QUIZ_LEN = 10;
  var quiz = { table: 0, index: 0, score: 0, a: 0, b: 0, typed: '', locked: false, lastKey: '' };

  function tableStars(t) {
    var best = store.get('tables', {})['t' + t] || 0;
    return best;
  }

  function starString(n) {
    var s = '';
    for (var i = 0; i < 3; i++) s += i < n ? '⭐' : '☆';
    return s;
  }

  function renderTableGrid() {
    var grid = $('table-grid');
    grid.innerHTML = '';
    for (var t = 2; t <= 10; t++) {
      var btn = document.createElement('button');
      btn.className = 'table-btn';
      btn.innerHTML = '<span class="num">× ' + t + '</span><span class="stars">' + starString(tableStars(t)) + '</span>';
      btn.setAttribute('data-table', t);
      grid.appendChild(btn);
    }
  }

  $('table-grid').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-table]');
    if (btn) startQuiz(parseInt(btn.getAttribute('data-table'), 10));
  });
  $('btn-mix').addEventListener('click', function () { startQuiz(0); });

  function startQuiz(table) {
    quiz.table = table;
    quiz.index = 0;
    quiz.score = 0;
    quiz.lastKey = '';
    nextQuestion();
    show('quiz');
  }

  function nextQuestion() {
    var a, b, key;
    do {
      a = quiz.table === 0 ? 2 + Math.floor(Math.random() * 9) : quiz.table;
      b = 1 + Math.floor(Math.random() * 10);
      key = a + 'x' + b;
    } while (key === quiz.lastKey);
    quiz.lastKey = key;
    quiz.a = a; quiz.b = b;
    quiz.typed = '';
    quiz.locked = false;
    $('quiz-question').textContent = a + ' × ' + b;
    $('quiz-answer').innerHTML = '&nbsp;';
    $('quiz-feedback').textContent = '';
    $('quiz-feedback').className = 'quiz-feedback';
    $('quiz-progress-fill').style.width = (quiz.index / QUIZ_LEN * 100) + '%';
    $('quiz-score').textContent = quiz.score;
  }

  $('keypad').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-key]');
    if (!btn || quiz.locked) return;
    var k = btn.getAttribute('data-key');
    if (k === 'back') {
      quiz.typed = quiz.typed.slice(0, -1);
    } else if (k === 'ok') {
      if (quiz.typed !== '') checkAnswer();
      return;
    } else if (quiz.typed.length < 3) {
      quiz.typed += k;
    }
    $('quiz-answer').innerHTML = quiz.typed === '' ? '&nbsp;' : quiz.typed;
  });

  function checkAnswer() {
    quiz.locked = true;
    var good = parseInt(quiz.typed, 10) === quiz.a * quiz.b;
    var fb = $('quiz-feedback');
    if (good) {
      quiz.score++;
      fb.textContent = ['Bravo !', 'Super !', 'Génial !', 'Champion !'][Math.floor(Math.random() * 4)] + ' 🎉';
      fb.className = 'quiz-feedback good';
      soundGood();
      confetti(25);
    } else {
      fb.textContent = quiz.a + ' × ' + quiz.b + ' = ' + (quiz.a * quiz.b) + ' 💪';
      fb.className = 'quiz-feedback bad';
      soundBad();
    }
    $('quiz-score').textContent = quiz.score;
    quiz.index++;
    setTimeout(function () {
      if (quiz.index >= QUIZ_LEN) endQuiz();
      else nextQuestion();
    }, good ? 900 : 1800);
  }

  function endQuiz() {
    lastActivity = 'quiz';
    var stars = quiz.score >= 10 ? 3 : quiz.score >= 8 ? 2 : quiz.score >= 5 ? 1 : 0;
    if (quiz.table !== 0) {
      var tables = store.get('tables', {});
      if (stars > (tables['t' + quiz.table] || 0)) {
        tables['t' + quiz.table] = stars;
        store.set('tables', tables);
      }
    }
    addStars(stars);
    $('result-emoji').textContent = stars === 3 ? '🏆' : stars === 2 ? '🥳' : stars === 1 ? '😊' : '💪';
    $('result-stars').textContent = starString(stars);
    $('result-text').textContent = quiz.score + ' / ' + QUIZ_LEN + (stars === 3 ? ' — Parfait !!' : stars >= 1 ? ' — Bien joué !' : ' — Tu vas y arriver, réessaie !');
    show('result');
    if (stars >= 2) { soundWin(); confetti(140); }
  }

  var lastActivity = 'quiz';
  $('btn-replay').addEventListener('click', function () {
    if (lastActivity === 'words') startWords(words.mode);
    else startQuiz(quiz.table);
  });

  /* ================================================================
     MOTS DE LA SEMAINE
     ================================================================ */
  var words = { list: [], index: 0, score: 0, mode: 'keyboard', hide: false };

  function getWordList() { return store.get('words', []); }

  function renderWordsHome() {
    var list = getWordList();
    $('words-empty').classList.toggle('hidden', list.length > 0);
    $('words-start').classList.toggle('hidden', list.length === 0);
    var ul = $('word-list');
    ul.innerHTML = '';
    for (var i = 0; i < list.length; i++) {
      var li = document.createElement('li');
      li.textContent = list[i];
      ul.appendChild(li);
    }
  }

  $('btn-words-keyboard').addEventListener('click', function () { startWords('keyboard'); });
  $('btn-words-pen').addEventListener('click', function () { startWords('pen'); });

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function startWords(mode) {
    words.list = shuffle(getWordList());
    words.index = 0;
    words.score = 0;
    words.mode = mode;
    words.hide = $('chk-hide-word').checked;
    $('word-keyboard-zone').classList.toggle('hidden', mode !== 'keyboard');
    $('word-pen-zone').classList.toggle('hidden', mode !== 'pen');
    $('word-judge-zone').classList.add('hidden');
    show('word-practice');
    if (mode === 'pen') setupCanvas();
    showWord();
  }

  function currentWord() { return words.list[words.index]; }

  function showWord() {
    var model = $('word-model');
    model.textContent = currentWord();
    model.classList.toggle('masked', words.hide);
    $('word-feedback').textContent = '';
    $('word-feedback').className = 'quiz-feedback';
    $('word-progress-fill').style.width = (words.index / words.list.length * 100) + '%';
    $('word-score').textContent = words.score;
    if (words.mode === 'keyboard') {
      $('word-input').value = '';
      $('word-input').focus();
    } else {
      clearCanvas();
      $('word-pen-zone').classList.remove('hidden');
      $('word-judge-zone').classList.add('hidden');
    }
    speakWord();
  }

  function speakWord() {
    try {
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(currentWord());
      u.lang = 'fr-FR';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  $('btn-speak').addEventListener('click', speakWord);

  /* bouton "voir le mot" : montre temporairement le mot masqué */
  (function () {
    var btn = $('btn-peek');
    var reveal = function () { $('word-model').classList.remove('masked'); };
    var mask = function () { if (words.hide) $('word-model').classList.add('masked'); };
    btn.addEventListener('pointerdown', reveal);
    btn.addEventListener('pointerup', mask);
    btn.addEventListener('pointerleave', mask);
  })();

  function normalize(s) {
    return s.trim().toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ');
  }

  function wordSuccess() {
    words.score++;
    addStars(1);
    $('word-feedback').textContent = 'Bravo ! ⭐';
    $('word-feedback').className = 'quiz-feedback good';
    soundGood();
    confetti(25);
    words.index++;
    setTimeout(function () {
      if (words.index >= words.list.length) endWords();
      else showWord();
    }, 1000);
  }

  function endWords() {
    lastActivity = 'words';
    $('result-emoji').textContent = '🌟';
    $('result-stars').textContent = '⭐⭐⭐';
    $('result-text').textContent = 'Tous tes mots sont écrits ! ' + words.score + ' étoile' + (words.score > 1 ? 's' : '') + ' gagnée' + (words.score > 1 ? 's' : '') + ' !';
    show('result');
    soundWin();
    confetti(140);
  }

  /* --- mode clavier --- */
  function checkTypedWord() {
    var typed = normalize($('word-input').value);
    if (typed === '') return;
    if (typed === normalize(currentWord())) {
      wordSuccess();
    } else {
      $('word-feedback').textContent = 'Presque ! Regarde bien et réessaie 🔍';
      $('word-feedback').className = 'quiz-feedback bad';
      $('word-model').classList.remove('masked');
      soundBad();
      setTimeout(function () {
        if (words.hide) $('word-model').classList.add('masked');
      }, 2500);
    }
  }
  $('btn-word-check').addEventListener('click', checkTypedWord);
  $('word-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') checkTypedWord();
  });

  /* --- mode stylet --- */
  var pen = { drawing: false, color: '#2d3436', ctx: null, canvas: null, hasInk: false };

  function setupCanvas() {
    var canvas = $('pen-canvas');
    pen.canvas = canvas;
    pen.ctx = canvas.getContext('2d');
    requestAnimationFrame(function () {
      var r = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      pen.ctx.scale(dpr, dpr);
      pen.ctx.lineCap = 'round';
      pen.ctx.lineJoin = 'round';
    });
  }

  function clearCanvas() {
    if (!pen.ctx) return;
    pen.ctx.clearRect(0, 0, pen.canvas.width, pen.canvas.height);
    pen.hasInk = false;
  }

  (function () {
    var canvas = $('pen-canvas');
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    canvas.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      pen.drawing = true;
      pen.hasInk = true;
      var p = pos(e);
      pen.ctx.beginPath();
      pen.ctx.moveTo(p.x, p.y);
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!pen.drawing) return;
      e.preventDefault();
      var p = pos(e);
      var pressure = (e.pointerType === 'pen' && e.pressure > 0) ? e.pressure : 0.5;
      pen.ctx.lineWidth = 2 + pressure * 7;
      pen.ctx.strokeStyle = pen.color;
      pen.ctx.lineTo(p.x, p.y);
      pen.ctx.stroke();
      pen.ctx.beginPath();
      pen.ctx.moveTo(p.x, p.y);
    });
    function up() { pen.drawing = false; }
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
  })();

  $('btn-pen-clear').addEventListener('click', clearCanvas);

  $('pen-colors').addEventListener('click', function (e) {
    var btn = e.target.closest('.pen-color');
    if (!btn) return;
    pen.color = btn.getAttribute('data-color');
    var all = document.querySelectorAll('.pen-color');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('sel');
    btn.classList.add('sel');
  });

  $('btn-pen-done').addEventListener('click', function () {
    if (!pen.hasInk) return;
    $('word-model').classList.remove('masked');
    $('word-pen-zone').classList.add('hidden');
    $('word-judge-zone').classList.remove('hidden');
  });

  $('btn-judge-yes').addEventListener('click', function () {
    $('word-judge-zone').classList.add('hidden');
    $('word-pen-zone').classList.remove('hidden');
    wordSuccess();
  });
  $('btn-judge-retry').addEventListener('click', function () {
    $('word-judge-zone').classList.add('hidden');
    $('word-pen-zone').classList.remove('hidden');
    if (words.hide) $('word-model').classList.add('masked');
    clearCanvas();
  });

  /* ================================================================
     COIN DES PARENTS
     ================================================================ */
  var gate = { answer: 0 };

  $('btn-parents').addEventListener('click', function () {
    var a = 3 + Math.floor(Math.random() * 7);
    var b = 3 + Math.floor(Math.random() * 7);
    gate.answer = a * b;
    $('gate-question').textContent = a + ' × ' + b + ' = ?';
    $('gate-input').value = '';
    $('parents-gate').classList.remove('hidden');
    $('parents-panel').classList.add('hidden');
    $('save-confirm').textContent = '';
    show('parents');
  });

  function tryGate() {
    if (parseInt($('gate-input').value, 10) === gate.answer) {
      $('parents-gate').classList.add('hidden');
      $('parents-panel').classList.remove('hidden');
      $('words-textarea').value = getWordList().join('\n');
    } else {
      $('gate-input').value = '';
    }
  }
  $('btn-gate-ok').addEventListener('click', tryGate);
  $('gate-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') tryGate();
  });

  $('btn-save-words').addEventListener('click', function () {
    var lines = $('words-textarea').value.split('\n');
    var list = [];
    for (var i = 0; i < lines.length; i++) {
      var w = lines[i].trim();
      if (w !== '') list.push(w);
    }
    store.set('words', list);
    $('save-confirm').textContent = '✅ ' + list.length + ' mot' + (list.length > 1 ? 's' : '') + ' enregistré' + (list.length > 1 ? 's' : '') + ' !';
  });

  /* ---------- service worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () {});
    });
  }

  refreshStarBank();
})();
