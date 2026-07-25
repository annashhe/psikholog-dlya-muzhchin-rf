/** Канонический адрес главной и сбор UTM для заявок */
window.PSI_SITE_HOME = 'https://психолог-для-мужчин.рф/';

(function() {
  function captureUtms() {
    try {
      var params = new URLSearchParams(window.location.search);
      var keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
      var utm = {};
      var has = false;
      keys.forEach(function(k) {
        var v = params.get(k);
        if (v) {
          utm[k] = v;
          has = true;
        }
      });
      if (has) {
        sessionStorage.setItem('psiUtms', JSON.stringify(utm));
      }
      if (window.location.search) {
        sessionStorage.setItem('psiLandingQuery', window.location.search);
      }
    } catch (e) {}
  }

  var path = window.location.pathname || '';
  if (/\/index\.html$/i.test(path)) {
    var dest =
      window.PSI_SITE_HOME.replace(/\/$/, '') +
      (window.location.search || '') +
      (window.location.hash || '');
    if (window.location.protocol.indexOf('http') === 0) {
      window.location.replace(dest);
      return;
    }
    history.replaceState(null, '', path.replace(/\/index\.html$/i, '/') || '/');
  }

  captureUtms();
})();

function getLeadTrackingPayload() {
  var pageUrl = window.PSI_SITE_HOME.replace(/\/$/, '');

  var utm = {};
  try {
    utm = JSON.parse(sessionStorage.getItem('psiUtms') || '{}');
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
