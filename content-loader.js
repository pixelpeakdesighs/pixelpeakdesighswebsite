  content-loader.js  —  tiny, dependency-free content injector
   -----------------------------------------------------------------------------
   Add this file to your repo (e.g. at the site root) and include it on any page
   you want to be editable:

       <script src="/content-loader.js" defer></script>

   Then tag the elements you want editable. The attribute value is a "key" that
   maps to content.json (dot-notation supported for grouping):

       <h1 data-cms="hero.title">Default headline</h1>
       <p  data-cms="hero.subtitle">Default subtitle text</p>
       <img data-cms-src="hero.image" src="placeholder.jpg" alt="">
       <a  data-cms-href="hero.ctaLink" href="#">Get started</a>
       <section data-cms-bg="hero.background"></section>
       <div data-cms-html="about.body">Default <em>rich</em> text</div>

   ...and a matching content.json in your repo:

       {
         "hero": {
           "title": "Welcome to my site",
           "subtitle": "Now editable without touching code",
           "image": "/images/hero.jpg",
           "ctaLink": "/signup",
           "background": "/images/bg.jpg"
         },
         "about": { "body": "<p>About us, in <strong>rich text</strong>.</p>" }
       }

   Keep real default text inside your HTML: if this script ever fails to load,
   the page still shows sensible content (progressive enhancement).

   Attributes supported:
     data-cms       -> sets element.textContent
     data-cms-html  -> sets element.innerHTML  (use only for your own content)
     data-cms-src   -> sets the src attribute   (images, etc.)
     data-cms-href  -> sets the href attribute  (links)
     data-cms-bg    -> sets style.backgroundImage
   ============================================================================ */
(function () {
  'use strict';

  // Path to your content file. Override with: <script src="content-loader.js" data-src="data/content.json">
  var SRC = (document.currentScript && document.currentScript.getAttribute('data-src')) || 'content.json';

  function getPath(obj, path) {
    return String(path).split('.').reduce(function (o, k) {
      return (o === null || o === undefined) ? undefined : o[k];
    }, obj);
  }

  function applyAll(selector, attr, fn) {
    var nodes = document.querySelectorAll('[' + selector + ']');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute(selector);
      var val = getPath(window.__SITE_CONTENT__, key);
      if (val !== undefined && val !== null) fn(el, val);
    }
  }

  function render() {
    applyAll('data-cms',      null, function (el, v) { el.textContent = v; });
    applyAll('data-cms-html', null, function (el, v) { el.innerHTML = v; });
    applyAll('data-cms-src',  null, function (el, v) { el.setAttribute('src', v); });
    applyAll('data-cms-href', null, function (el, v) { el.setAttribute('href', v); });
    applyAll('data-cms-bg',   null, function (el, v) { el.style.backgroundImage = "url('" + v + "')"; });
    document.dispatchEvent(new CustomEvent('cms:loaded', { detail: window.__SITE_CONTENT__ }));
  }

  fetch(SRC, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;            // missing/invalid file -> keep HTML defaults
      window.__SITE_CONTENT__ = data;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
      } else {
        render();
      }
    })
    .catch(function () { /* offline or file missing -> keep HTML defaults */ });
})();
