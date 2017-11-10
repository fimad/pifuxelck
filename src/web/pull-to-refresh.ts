
// Prevents pull to refresh.
export default function() {
  let maybePreventPullToRefresh = false;
  let lastTouchY = 0;
  const touchstartHandler = (e: TouchEvent) => {
    lastTouchY = e.touches[0].clientY;
    // Pull-to-refresh will only trigger if the scroll begins when the
    // document's Y offset is zero.
    maybePreventPullToRefresh = window.pageYOffset == 0;
  };

  const touchmoveHandler = (e: TouchEvent) => {
    var touchY = e.touches[0].clientY;
    var touchYDelta = touchY - lastTouchY;
    lastTouchY = touchY;

    // It is necessary to prevent default on any move event where the user is
    // swiping downwards.
    if (maybePreventPullToRefresh) {
      if (touchYDelta > 0) {
        e.preventDefault();
        return;
      }
    }
  };

  (document.addEventListener as any)('touchstart', touchstartHandler, {passive: false });
  (document.addEventListener as any)('touchmove', touchmoveHandler, {passive: false });
}
