(function () {
  var BUBBLE_ID = 'ultra-fast-widget-bubble-54722168';
  var KEY = 'aidDemoWidgetAutoOpened';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) { userTouched = true; }
  }, true);
  var tries = 0;
  var t = setInterval(function () {
    tries += 1;
    var b = document.getElementById(BUBBLE_ID);
    if (b && tries >= 7) {
      clearInterval(t);
      if (!userTouched) { b.click(); }
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }
    if (tries > 30) { clearInterval(t); }
  }, 1000);
})();

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---- SMS THREAD ---- */
  var bubbles = [
    {
      type: 'caller',
      label: 'Homeowner',
      text: 'Hi, I found what looks like termite damage in my basement this morning. Can someone come out today?'
    },
    {
      type: 'ai',
      label: 'Superior Pest AI',
      text: "I'm the after-hours assistant for Superior Pest Management. Termites need fast attention. Can I get your address in Kannapolis or Cabarrus County so we can get an inspector scheduled?"
    },
    {
      type: 'caller',
      label: 'Homeowner',
      text: '1204 Pine Tree Rd in Concord. The damage is in the floor joists near the back wall.'
    },
    {
      type: 'ai',
      label: 'Superior Pest AI',
      text: "Done. Saturday morning at 10 AM, a termite inspector will be at 1204 Pine Tree Rd. You'll get a confirmation text in a moment. Superior has been protecting Cabarrus County homes for 25 years — you called the right place."
    }
  ];

  var smsBody = document.getElementById('sms-body');
  var replayBtn = document.getElementById('replay-btn');
  var demoTimestamp = document.getElementById('demo-timestamp');
  var demoContainer = document.getElementById('demo-container');

  var timers = [];
  var demoRunning = false;
  var demoGeneration = 0;

  function clearTimers() {
    timers.forEach(function (t) { clearTimeout(t); });
    timers = [];
  }

  function renderBubblesStatic() {
    smsBody.innerHTML = '';
    bubbles.forEach(function (b) {
      var div = document.createElement('div');
      div.className = 'bubble ' + b.type + ' shown';
      var lbl = document.createElement('div');
      lbl.className = 'bubble-label';
      lbl.textContent = b.label;
      div.appendChild(lbl);
      div.appendChild(document.createTextNode(b.text));
      smsBody.appendChild(div);
    });
    if (replayBtn) replayBtn.style.display = 'none';
  }

  function playThread() {
    if (prefersReducedMotion.matches) { renderBubblesStatic(); return; }

    demoRunning = true;
    demoGeneration++;
    var gen = demoGeneration;

    clearTimers();
    smsBody.innerHTML = '';
    if (replayBtn) replayBtn.style.display = 'none';

    var delay = 600;
    var typingDelay = 900;

    bubbles.forEach(function (b, i) {
      // Show typing indicator before AI bubbles
      if (b.type === 'ai') {
        (function (d, g) {
          timers.push(setTimeout(function () {
            if (demoGeneration !== g) return;
            var ti = document.createElement('div');
            ti.className = 'typing-indicator';
            ti.id = 'typing-' + i;
            [1,2,3].forEach(function () {
              var dot = document.createElement('span');
              dot.className = 'typing-dot';
              ti.appendChild(dot);
            });
            smsBody.appendChild(ti);
            smsBody.scrollTop = smsBody.scrollHeight;
            requestAnimationFrame(function () {
              ti.classList.add('shown');
            });
          }, d));
        })(delay, gen);
        delay += typingDelay;
      }

      (function (bubble, d, g) {
        timers.push(setTimeout(function () {
          if (demoGeneration !== g) return;
          // Remove typing indicator if AI bubble
          if (bubble.type === 'ai') {
            var ti = document.getElementById('typing-' + i);
            if (ti) ti.remove();
          }
          var div = document.createElement('div');
          div.className = 'bubble ' + bubble.type;
          var lbl = document.createElement('div');
          lbl.className = 'bubble-label';
          lbl.textContent = bubble.label;
          div.appendChild(lbl);
          div.appendChild(document.createTextNode(bubble.text));
          smsBody.appendChild(div);
          smsBody.scrollTop = smsBody.scrollHeight;
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              div.classList.add('shown');
            });
          });
          if (i === bubbles.length - 1) {
            demoRunning = false;
            if (replayBtn) replayBtn.style.display = 'inline-flex';
          }
        }, d));
      })(b, delay, gen);

      delay += b.type === 'caller' ? 1200 : 400;
    });
  }

  function resetAndPlay() {
    clearTimers();
    demoRunning = false;
    playThread();
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', resetAndPlay);
  }

  // IntersectionObserver: re-arm on every scroll entry
  if ('IntersectionObserver' in window && demoContainer) {
    var demoIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          resetAndPlay();
        } else {
          clearTimers();
          demoGeneration++;
          demoRunning = false;
        }
      });
    }, { threshold: 0.3 });
    demoIO.observe(demoContainer);
  } else {
    if (prefersReducedMotion.matches) {
      renderBubblesStatic();
    } else {
      playThread();
    }
  }

  prefersReducedMotion.addEventListener('change', function () {
    if (prefersReducedMotion.matches) {
      clearTimers();
      demoGeneration++;
      renderBubblesStatic();
    } else {
      resetAndPlay();
    }
  });

  /* ---- STAT COUNTER ---- */
  var statNum = document.getElementById('stat-num');
  var statSection = document.querySelector('.math-section');
  var statReplayBtn = document.getElementById('stat-replay-btn');
  var countRunToken = 0;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function runCount() {
    if (prefersReducedMotion.matches) {
      if (statNum) statNum.textContent = '3,000';
      return;
    }
    countRunToken++;
    var token = countRunToken;
    var target = 3000;
    var duration = 1800;
    var start = null;
    function step(ts) {
      if (countRunToken !== token) return;
      if (!start) start = ts;
      var elapsed = ts - start;
      var progress = Math.min(elapsed / duration, 1);
      var val = Math.round(easeOutCubic(progress) * target);
      if (statNum) statNum.textContent = val.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (statReplayBtn) {
    statReplayBtn.addEventListener('click', runCount);
  }

  if ('IntersectionObserver' in window && statSection) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(); }
        else { countRunToken++; }
      });
    }, { threshold: 0.3 });
    statIO.observe(statSection);
  } else {
    runCount();
  }

  prefersReducedMotion.addEventListener('change', function () {
    if (prefersReducedMotion.matches && statNum) statNum.textContent = '3,000';
  });

  /* ---- SCROLL REVEAL ---- */
  if ('IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('.reveal');
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // one-time reveal is fine — disconnecting prevents re-hide
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ---- STICKY MOBILE CTA: hide when real CTA in view ---- */
  var mobileCta = document.getElementById('mobile-cta-bar');
  var ctaSection = document.getElementById('cta-section');
  if (mobileCta && ctaSection && 'IntersectionObserver' in window) {
    var ctaIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (mobileCta) {
          mobileCta.style.opacity = entry.isIntersecting ? '0' : '';
          mobileCta.style.pointerEvents = entry.isIntersecting ? 'none' : '';
          mobileCta.setAttribute('aria-hidden', entry.isIntersecting ? 'true' : 'false');
          // update tabindex on child link
          var link = mobileCta.querySelector('a');
          if (link) link.tabIndex = entry.isIntersecting ? -1 : 0;
          if (link) link.setAttribute('aria-hidden', entry.isIntersecting ? 'true' : 'false');
        }
      });
    }, { threshold: 0.1 });
    ctaIO.observe(ctaSection);
  }

})();