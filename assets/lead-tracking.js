/** Канонический адрес главной и сбор UTM для заявок */
window.PSI_SITE_HOME = 'https://психолог-для-мужчин.рф/';

(function () {
  function captureUtms() {
    try {
      var params = new URLSearchParams(window.location.search);
      var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      var utm = {};
      var has = false;
      keys.forEach(function (k) {
        var v = params.get(k);
        if (v) {
          utm[k] = String(v).slice(0, 200);
          has = true;
        }
      });
      if (!has) return;
      // First-touch only: never overwrite after the landing hit.
      try {
        if (!sessionStorage.getItem('psiUtms')) {
          sessionStorage.setItem('psiUtms', JSON.stringify(utm));
        }
      } catch (e0) {}
      try {
        if (!localStorage.getItem('psiUtmsFirst')) {
          localStorage.setItem('psiUtmsFirst', JSON.stringify(utm));
        }
      } catch (e1) {}
      if (window.location.search) {
        try {
          if (!sessionStorage.getItem('psiLandingQuery')) {
            sessionStorage.setItem('psiLandingQuery', window.location.search);
          }
        } catch (e2) {}
      }
    } catch (e) {}
  }

  var path = window.location.pathname || '';
  var qs = window.location.search || '';
  var hash = window.location.hash || '';

  if (path === '/index.html') {
    var home = window.PSI_SITE_HOME.replace(/\/$/, '') + qs + hash;
    if (window.location.protocol.indexOf('http') === 0) {
      window.location.replace(home);
      return;
    }
    history.replaceState(null, '', '/' + qs + hash);
  } else if (/\/index\.html$/i.test(path)) {
    if (window.location.protocol.indexOf('http') === 0) {
      window.location.replace(path.replace(/\/index\.html$/i, '/') + qs + hash);
      return;
    }
    history.replaceState(null, '', path.replace(/\/index\.html$/i, '/') + qs + hash);
  } else if (/\.html$/i.test(path)) {
    var clean = path.replace(/\.html$/i, '/');
    if (window.location.protocol.indexOf('http') === 0) {
      window.location.replace(clean + qs + hash);
      return;
    }
  }

  captureUtms();
})();

function getLeadTrackingPayload() {
  var pageUrl = '';
  try {
    pageUrl = window.location.origin + (window.location.pathname || '/');
  } catch (e0) {
    pageUrl = window.PSI_SITE_HOME.replace(/\/$/, '');
  }

  var utm = {};
  try {
    utm = JSON.parse(
      localStorage.getItem('psiUtmsFirst') || sessionStorage.getItem('psiUtms') || '{}'
    );
  } catch (e2) {}

  return {
    pageUrl: pageUrl,
    utmSource: utm.utm_source || '',
    utmMedium: utm.utm_medium || '',
    utmCampaign: utm.utm_campaign || '',
    utmContent: utm.utm_content || '',
    utmTerm: utm.utm_term || '',
  };
}
