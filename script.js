/* AID teaser bubble + auto-open schedule (v3, 2026-07-22):
   teaser at 10s next to the closed launcher, auto-open never before 20s.
   Pages with the data-aid-widget-boost snippet keep that snippet's own 20s
   opener; this block only auto-opens on pages without it. Clicking the
   teaser or the launcher opens the chat immediately. */
(function () {
  var WID = '54722168';
  var BUBBLE_ID = 'ultra-fast-widget-bubble-' + WID;
  var OPEN_KEY = 'aidWidgetAutoOpened';
  var LEGACY_KEY = 'aidDemoWidgetAutoOpened';
  var TEASER_KEY = 'aidTeaserShown';
  var TEASER_AT = 10; /* seconds, the old auto-open moment */
  var OPEN_AT = 20;   /* seconds, minimum auto-open delay */
  var hasBoost = !!document.querySelector('script[data-aid-widget-boost]');
  function bubble() { return document.getElementById(BUBBLE_ID); }
  function isOpen() {
    var c = document.getElementById('ultra-fast-widget-container-' + WID);
    return !!(c && getComputedStyle(c).display !== 'none');
  }
  function alreadyOpened() {
    try { return !!(sessionStorage.getItem(OPEN_KEY) || sessionStorage.getItem(LEGACY_KEY)); } catch (e) { return false; }
  }
  var teaser = null;
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) {
      userTouched = true;
      hideTeaser();
    }
  }, true);
  function hideTeaser() {
    if (!teaser) return;
    var t = teaser;
    teaser = null;
    t.style.opacity = '0';
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 450);
  }
  function openChat() {
    hideTeaser();
    var b = bubble();
    if (b && !isOpen()) b.click();
  }
  function showTeaser() {
    if (teaser || userTouched || isOpen() || alreadyOpened()) return;
    try {
      if (sessionStorage.getItem(TEASER_KEY)) return;
      sessionStorage.setItem(TEASER_KEY, '1');
    } catch (e) {}
    var d = document.createElement('div');
    d.setAttribute('data-aid-teaser', '');
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.style.cssText = 'position:fixed;right:20px;bottom:98px;z-index:999998;max-width:250px;background:#141419;color:#F4F4F5;padding:13px 32px 13px 16px;border-radius:16px;border:1px solid rgba(201,168,76,.45);box-shadow:0 12px 28px rgba(0,0,0,.5);font:500 14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;cursor:pointer;opacity:0;transform:translateY(10px);transition:opacity .5s ease,transform .5s ease;';
    var txt = document.createElement('p');
    txt.style.cssText = 'margin:0;';
    txt.textContent = "Give your customers AN OFFER they can't refuse! 🎙️";
    var x = document.createElement('button');
    x.type = 'button';
    x.setAttribute('aria-label', 'Dismiss');
    x.textContent = '×';
    x.style.cssText = 'position:absolute;top:2px;right:6px;background:transparent;border:none;color:rgba(244,244,245,.55);font-size:18px;line-height:1;cursor:pointer;padding:2px 4px;';
    x.addEventListener('click', function (e) { e.stopPropagation(); hideTeaser(); });
    var arrow = document.createElement('span');
    arrow.style.cssText = 'position:absolute;bottom:-7px;right:26px;width:12px;height:12px;background:#141419;border-right:1px solid rgba(201,168,76,.45);border-bottom:1px solid rgba(201,168,76,.45);transform:rotate(45deg);';
    d.appendChild(txt);
    d.appendChild(x);
    d.appendChild(arrow);
    d.addEventListener('click', function (e) { if (e.target === x) return; e.stopPropagation(); openChat(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openChat(); } });
    document.body.appendChild(d);
    teaser = d;
    requestAnimationFrame(function () { d.style.opacity = '1'; d.style.transform = 'translateY(0)'; });
  }
  var ticks = 0;
  var timer = setInterval(function () {
    ticks += 1;
    if (isOpen()) {
      hideTeaser();
      if (hasBoost || ticks >= OPEN_AT) clearInterval(timer);
      return;
    }
    var b = bubble();
    if (b && ticks >= TEASER_AT) showTeaser();
    if (!hasBoost && b && ticks >= OPEN_AT) {
      clearInterval(timer);
      hideTeaser();
      var guard = alreadyOpened();
      try { sessionStorage.setItem(LEGACY_KEY, '1'); } catch (e) {}
      if (!guard && !userTouched && !isOpen()) b.click();
    }
    if (ticks > 60) clearInterval(timer);
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
// ── 7/16 sequencer contract override (patched 2026-07-21) ──
// play at ~15% visible; re-arm ONLY after full viewport exit; replay hard-resets.
;(function(){
  // Locate the SMS thread element (try common IDs in priority order)
  var threadIds = ['thread','thread-mobile','thread-desktop','sms-thread','sms-thread-desktop','demo-thread'];
  var threadEl = null;
  for (var _i = 0; _i < threadIds.length; _i++){
    threadEl = document.getElementById(threadIds[_i]);
    if (threadEl) break;
  }
  if (!threadEl) return; // no thread found — bail

  // Locate replay buttons (use the FIRST one if multiple)
  var replayBtns = Array.prototype.slice.call(document.querySelectorAll('[id*="replay"],[data-replay]'));

  function hardReset(){
    // Simulate a replay button click to let the existing implementation reset+play.
    // If no replay button exists, try firing a custom event the sequencer may listen for.
    if (replayBtns.length > 0){ replayBtns[0].click(); }
  }

  var _armed = true;
  function _autoplay(){
    if (!_armed) return;
    _armed = false;
    hardReset();
  }

  // playIO: fires when >= 15% of the thread is visible
  var playIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting && e.intersectionRatio >= 0.15){ _autoplay(); }
    });
  }, { threshold: 0.18 });
  playIO.observe(threadEl);

  // rearmIO: fires when thread fully exits the viewport (threshold:0 + !isIntersecting)
  var rearmIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting){ _armed = true; }
    });
  }, { threshold: 0 });
  rearmIO.observe(threadEl);

  // Check already-visible case at init time
  var _rect = threadEl.getBoundingClientRect();
  var _vh = window.innerHeight || document.documentElement.clientHeight;
  var _vis = Math.min(_rect.bottom, _vh) - Math.max(_rect.top, 0);
  if (_rect.height > 0 && _vis / _rect.height >= 0.15){ _autoplay(); }
})();
