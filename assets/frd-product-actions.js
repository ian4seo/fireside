/* ============================================================
 * frd-product-actions.js
 * ------------------------------------------------------------
 * Vanilla JS behaviors for the Product Conversion Actions (PCA):
 *   1. Reposition the PCA CTA module into the product detail
 *      column, directly above the product description.
 *      (Core snippet snippets/product.liquid is untouched, so
 *      the block is rendered by the section as a sibling and
 *      then moved into place at runtime.)
 *   2. Persistent mobile action bar: revealed once the top of
 *      the product block scrolls out of view (IntersectionObserver).
 *   3. Body bottom-padding equal to the measured bar height so
 *      content is never obscured. Re-measures on resize.
 *   4. Product-context hand-off into the in-page Globo Quote
 *      form (#request-quote-section): when a user clicks any
 *      in-page "Request a Quote" CTA that targets the embedded
 *      form, a hidden input named "product_context" is injected.
 * ============================================================ */
(function () {
  'use strict';

  var MOBILE_BREAKPOINT = 768;

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function isMobile() {
    return window.matchMedia('(max-width: ' + MOBILE_BREAKPOINT + 'px)').matches;
  }

  /* -------------------------------------------------------- */
  /* 1. Mobile sticky bar: show after scrolling past the fold  */
  /* -------------------------------------------------------- */
  function initMobileBar() {
    var bar = document.querySelector('[data-pca-mobile-bar]');
    if (!bar) return;

    /* Observe the inline CTA module itself — the sticky bar should reveal
     * as soon as the user scrolls past those buttons. */
    var target = document.querySelector('[data-pca-module]');
    if (!target) return;

    /* Fallback: if IntersectionObserver is missing, reveal immediately on mobile. */
    if (typeof window.IntersectionObserver !== 'function') {
      if (isMobile()) showBar(bar);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!isMobile()) {
          hideBar(bar);
          return;
        }
        /* Show the bar only when the inline CTAs have scrolled ABOVE the
         * viewport (user has moved past them). If they haven't yet entered
         * the viewport (boundingClientRect.top > 0), keep the bar hidden so
         * it doesn't cover content when the user first lands on the page. */
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          showBar(bar);
        } else {
          hideBar(bar);
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 0
    });

    observer.observe(target);

    window.addEventListener('resize', function () {
      if (!isMobile()) hideBar(bar);
      updateBodyPadding(bar);
    });
  }

  function showBar(bar) {
    bar.classList.add('is-visible');
    bar.setAttribute('aria-hidden', 'false');
    updateBodyPadding(bar);
  }

  function hideBar(bar) {
    bar.classList.remove('is-visible');
    bar.setAttribute('aria-hidden', 'true');
    document.body.style.paddingBottom = '';
  }

  /* -------------------------------------------------------- */
  /* 2. Body padding = measured bar height                    */
  /* -------------------------------------------------------- */
  function updateBodyPadding(bar) {
    if (!bar || !bar.classList.contains('is-visible')) {
      document.body.style.paddingBottom = '';
      return;
    }
    var h = bar.getBoundingClientRect().height;
    document.body.style.paddingBottom = h + 'px';
  }

  /* -------------------------------------------------------- */
  /* 3. Product context hand-off to Globo quote form          */
  /* -------------------------------------------------------- */
  function injectProductContextIntoQuoteForm() {
    var module = document.querySelector('[data-pca-module]');
    if (!module) return;

    var context = module.getAttribute('data-pca-product-context') || '';
    var handle = module.getAttribute('data-pca-product-handle') || '';
    var sku = module.getAttribute('data-pca-product-sku') || '';
    var title = module.getAttribute('data-pca-product-title') || '';

    var quoteSection = document.getElementById('request-quote-section');
    if (!quoteSection) return;

    /* Wait briefly for Globo formbuilder to mount its <form> inside the
     * placeholder div, then inject our hidden fields. We also observe for
     * late insertion via MutationObserver as a safety net. */
    var injected = false;
    function tryInject() {
      if (injected) return;
      var form = quoteSection.querySelector('form');
      if (!form) return;
      appendHidden(form, 'product_context', context);
      appendHidden(form, 'product_handle', handle);
      appendHidden(form, 'product_sku', sku);
      appendHidden(form, 'product_title', title);
      injected = true;
    }

    tryInject();

    if (!injected && typeof window.MutationObserver === 'function') {
      var mo = new MutationObserver(function () {
        tryInject();
        if (injected) mo.disconnect();
      });
      mo.observe(quoteSection, { childList: true, subtree: true });
      /* Safety stop after 10s so we don't observe forever. */
      setTimeout(function () { mo.disconnect(); }, 10000);
    }
  }

  function appendHidden(form, name, value) {
    if (!form.querySelector('input[name="' + name + '"]')) {
      var input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
  }

  /* -------------------------------------------------------- */
  /* 4. Reposition PCA module above the product description,  */
  /*    and move the ZIP availability field + its status      */
  /*    messages to sit between the PCA module and the        */
  /*    description.                                          */
  /* -------------------------------------------------------- */
  function repositionModule() {
    var module = document.querySelector('[data-pca-module]');
    if (!module) return;

    var details = document.querySelector('.pca-active .product__details');
    if (!details) return;

    /* Prefer the description block; fall back to appending to details if it's
     * missing (e.g. if the merchant removes the description block). */
    var description = details.querySelector('.product-block--description');
    var anchor = (description && description.parentNode === details) ? description : null;

    if (anchor) {
      details.insertBefore(module, anchor);
    } else {
      details.appendChild(module);
    }

    module.classList.add('pca-module--inline');

    /* Move the ZIP availability cluster (input + status messages) to sit
     * directly below the PCA module but above the description. The legacy
     * duplicate CTAs (#trigger-request-quote, #appointment) are intentionally
     * NOT moved — they stay hidden by frd-product-actions.css. */
    var zipIds = [
      'product-check-availability',
      'yes-online',
      'yes-offline',
      'no',
      'show-globo-app'
    ];

    var zipAnchor = anchor || null;
    zipIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      /* Insert each element in order, just before the description (or append). */
      if (zipAnchor) {
        details.insertBefore(el, zipAnchor);
      } else {
        details.appendChild(el);
      }
    });
  }

  ready(function () {
    repositionModule();
    initMobileBar();
    injectProductContextIntoQuoteForm();
  });
})();
