/**
 * Яндекс.Метрика: reachGoal для счётчика 110969154.
 * Создайте в Метрике цели-JavaScript-события с ТАКИМИ ID:
 *   lead_callback, lead_booking, click_phone, click_telegram, click_max
 */
window.psiMetrikaGoal = function (goalId, params) {
  if (!goalId || typeof ym !== 'function') return;
  try {
    ym(110969154, 'reachGoal', goalId, params || {});
  } catch (e) {}
};
