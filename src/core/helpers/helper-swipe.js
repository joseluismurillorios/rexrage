/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

export default (D) => {
  const ce = (e, n) => {
    let a = D.createEvent('CustomEvent');
    a.initCustomEvent(n, true, true, e.target);
    e.target.dispatchEvent(a);
    a = null;
    return 1;
  };

  const m = (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ? 'touch' : 'mouse');
  let nm = 1;
  let bd = 0;
  let sx;
  let sy;
  let ex;
  let ey;
  const M = Math;
  const MA = M.abs;
  const MM = M.max;
  let x;
  let y;
  let xr;
  let yr;

  const f = {
    touch: {
      touchstart(e) {
        const r = ce(e, (sx = e.touches[0].pageX, sy = e.touches[0].pageY, 'sfc'));
        return r;
      },
      touchmove(e) {
        nm = 0;
        ex = e.touches[0].pageX;
        ey = e.touches[0].pageY;
        return 1;
      },
      touchend(e) {
        const r = ce(e, nm ? 'fc' : (x = ex - sx, xr = MA(x), y = ey - sy, yr = MA(y), nm = 1, MM(xr, yr) > 40 ? xr > yr ? x < 0 ? 'swl' : 'swr' : y < 0 ? 'swu' : 'swd' : 'fc'));
        return r;
      },
      touchcancel() {
        nm = 0;
        return 1;
      },
    },
    mouse: {
      mousedown(e) {
        bd = 1;
        sx = e.x;
        sy = e.y;
        const r = ce(e, 'sfc');
        return e.button || r;
      },
      mousemove(e) {
        nm = 0;
        ex = e.x;
        ey = e.y;
        return !bd || 1;
      },
      mouseup(e) {
        bd = 0;
        const r = ce(e, nm ? 'fc' : (nm = 1, x = ex - sx, xr = MA(x), y = ey - sy, yr = MA(y), MM(xr, yr) > 40 ? xr > yr ? x < 0 ? 'swl' : 'swr' : y < 0 ? 'swu' : 'swd' : 'fc'));
        return e.button || r;
      },
    },
  };

  for (const a in f[m]) {
    D.addEventListener(a, f[m][a], false);
  }
};
