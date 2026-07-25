/**
 * Яндекс.Метрика + dataLayer: цели.
 * ID целей в Метрике: lead_callback, lead_booking, click_phone, click_telegram, click_max, click_whatsapp, click_blog_cta
 */
window.psiMetrikaGoal = function (goalId, params) {
  if (!goalId) return;
  try {
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      var payload = { event: goalId };
      if (params) {
        for (var k in params) {
          if (Object.prototype.hasOwnProperty.call(params, k)) payload[k] = params[k];
        }
      }
      window.dataLayer.push(payload);
    }
  } catch (e0) {}
  if (typeof ym !== 'function') return;
  try {
    ym(110969154, 'reachGoal', goalId, params || {});
  } catch (e) {}
};
