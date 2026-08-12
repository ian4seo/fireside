/* Load non-essential third-party widgets after the critical mobile render. */
(function () {
  var loaded = false;
  var scheduled = false;
  var interactionEvents = ['pointerdown', 'keydown', 'touchstart'];

  function loadDeferredScripts() {
    if (loaded) return;
    loaded = true;

    document.querySelectorAll('script[data-performance-src]').forEach(function (placeholder) {
      var script = document.createElement('script');

      Array.prototype.forEach.call(placeholder.attributes, function (attribute) {
        if (attribute.name !== 'data-performance-src') {
          script.setAttribute(attribute.name, attribute.value);
        }
      });

      script.src = placeholder.getAttribute('data-performance-src');
      script.async = true;
      placeholder.replaceWith(script);
    });

    interactionEvents.forEach(function (eventName) {
      window.removeEventListener(eventName, scheduleDeferredScripts, true);
    });
  }

  function scheduleDeferredScripts() {
    if (loaded || scheduled) return;
    scheduled = true;
    interactionEvents.forEach(function (eventName) {
      window.removeEventListener(eventName, scheduleDeferredScripts, true);
    });
    window.setTimeout(loadDeferredScripts, 1500);
  }

  interactionEvents.forEach(function (eventName) {
    window.addEventListener(eventName, scheduleDeferredScripts, { capture: true, passive: true, once: true });
  });

  window.addEventListener('load', function () {
    window.setTimeout(function () {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadDeferredScripts, { timeout: 2000 });
      } else {
        loadDeferredScripts();
      }
    }, 12000);
  }, { once: true });
})();

/* Lazy-load decorative backgrounds without the legacy lazySizes bgset plugin. */
(function () {
  var backgrounds = document.querySelectorAll('[data-performance-bg], [data-performance-bg-large]');

  function loadBackground(element) {
    var source = element.getAttribute('data-performance-bg');
    var largeSource = element.getAttribute('data-performance-bg-large');

    if (largeSource && window.matchMedia('(min-width: 768px)').matches) {
      source = largeSource;
    }

    if (source) {
      element.style.backgroundImage = 'url("' + source.replace(/"/g, '%22') + '")';
    }

    element.removeAttribute('data-performance-bg');
    element.removeAttribute('data-performance-bg-large');
  }

  if (!('IntersectionObserver' in window)) {
    backgrounds.forEach(loadBackground);
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      loadBackground(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '300px 0px' });

  backgrounds.forEach(function (element) {
    observer.observe(element);
  });
})();
