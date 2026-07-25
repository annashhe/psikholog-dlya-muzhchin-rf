(function () {
  var path = window.location.pathname || '';
  var qs = window.location.search || '';
  var hash = window.location.hash || '';
  if (path === '/index.html') {
    window.location.replace('/' + qs + hash);
    return;
  }
  if (/\/index\.html$/i.test(path)) {
    window.location.replace(path.replace(/\/index\.html$/i, '/') + qs + hash);
    return;
  }
  if (/\.html$/i.test(path)) {
    window.location.replace(path.replace(/\.html$/i, '/') + qs + hash);
  }
})();
