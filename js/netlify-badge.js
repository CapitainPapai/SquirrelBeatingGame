/* ============================================================
   Убираем плашку «Powered by Netlify» (бесплатный тариф Netlify).

   Важно: в коде игры её нет — Netlify сам вставляет свой «HUD»-скрипт,
   который монтирует iframe с id="nl-badge-frame" в правом нижнем углу.
   На телефоне эта плашка перекрывает нижнюю панель вкладок.

   Официальный способ (бесплатный, без редеплоя):
     Netlify → Project configuration → General → Powered by Netlify badge → Off.

   Этот файл — страховка на случай, если переключатель ещё недоступен
   (Netlify раскатывает бейдж постепенно) или проект переехал на другой аккаунт.
   Удалить страховку: убрать один <script src="./js/netlify-badge.js"></script>
   из index.html и блок в css/style.css.
   ============================================================ */
(function () {
  'use strict';

  var SELECTOR = [
    '#nl-badge-frame',
    '#nl-badge',
    '[id^="nl-badge"]',
    '[class*="nl-badge"]',
    'iframe[src*=".netlify/scripts/hud"]',
    'iframe[src*="netlify-badge"]',
    'netlify-badge',
    '[data-netlify-badge]'
  ].join(',');

  function scrub(root) {
    if (!root || root.nodeType !== 1) return;
    try {
      if (root.matches && root.matches(SELECTOR)) {
        root.remove();
        return;
      }
      var found = root.querySelectorAll ? root.querySelectorAll(SELECTOR) : null;
      if (found && found.length) {
        for (var i = 0; i < found.length; i++) found[i].remove();
      }
      // На случай, если бейдж спрятан внутри shadow root
      if (root.shadowRoot) {
        var inner = root.shadowRoot.querySelectorAll(SELECTOR);
        for (var j = 0; j < inner.length; j++) inner[j].remove();
        if (root.shadowRoot.querySelector('iframe, #nl-badge-frame, .nl-badge')) {
          // хост-элемент с чужой тенью: удаляем только если он похож на бейдж
          var hostText = (root.getAttribute('id') || '') + ' ' + (root.getAttribute('class') || '');
          if (/nl-badge|netlify/i.test(hostText)) root.remove();
        }
      }
    } catch (e) {
      /* ничего не ломаем, если разметка нестандартная */
    }
  }

  scrub(document.body || document.documentElement);

  var observer = null;
  if (window.MutationObserver) {
    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var added = mutations[i].addedNodes;
        for (var k = 0; k < added.length; k++) scrub(added[k]);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    // через 2 минуты перестаём следить, чтобы не тратить ресурсы впустую
    setTimeout(function () {
      if (observer) { observer.disconnect(); observer = null; }
      scrub(document.body);
    }, 120000);
  }

  window.addEventListener('load', function () { scrub(document.body); });
})();
