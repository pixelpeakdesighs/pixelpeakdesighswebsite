(function () {
  'use strict';

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
    applyAll('data-cms', function (el, v) { el.textContent = v; });
    applyAll('data-cms-html', function (el, v) { el.innerHTML = v; });
    applyAll('data-cms-src', function (el, v) { el.setAttribute('src', v); });
    applyAll('data-cms-href', function (el, v) { el.setAttribute('href', v); });
    applyAll('data-cms-bg', function (el, v) { el.style.backgroundImage = "url('" + v + "')"; });
  }

  fetch(SRC, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      window.__SITE_CONTENT__ = data;
      render();
    })
    .catch(function () {});
})();
