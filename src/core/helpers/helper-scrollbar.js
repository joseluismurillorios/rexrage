/* eslint-disable no-param-reassign */

export default (elem, inner) => {
  let goUp = true;
  let end = null;
  let interval = null;

  function handle(delta) {
    const animationInterval = 15;
    const scrollSpeed = 15;

    if (end == null) {
      end = elem.scrollTop;
    }
    end -= 20 * delta;
    goUp = delta > 0;

    if (interval == null) {
      interval = setInterval(() => {
        const { scrollTop } = elem;
        const step = Math.round((end - scrollTop) / scrollSpeed);
        const innerRect = inner.getBoundingClientRect();

        if ((scrollTop <= 0)
          || (scrollTop >= innerRect.height - elem.clientHeight)
          || (goUp && step > -1)
          || (!goUp && step < 1)) {
          clearInterval(interval);
          interval = null;
          end = null;
        }
        elem.scrollTop = scrollTop + step;
      }, animationInterval);
    }
  }

  function wheel(event) {
    let delta = 0;
    if (event.wheelDelta) delta = event.wheelDelta / 120;
    else if (event.detail) delta = -event.detail / 3;
    handle(delta);
    if (event.preventDefault) event.preventDefault();
    event.returnValue = false;
  }

  if (elem.addEventListener) {
    elem.addEventListener('DOMMouseScroll', wheel, false);
  }
  elem.onmousewheel = wheel;
  document.onmousewheel = wheel;
};
