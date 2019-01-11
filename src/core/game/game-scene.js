/* eslint-disable no-param-reassign */
import {
  Scene,
  PerspectiveCamera,
  // Clock,
  Color,
  Fog,
  WebGLRenderer,
} from 'three';

export default () => new Promise((res) => {
  const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);

  if (IS_MOBILE) {
    camera.position.set(-2, 2, 15);
  } else {
    camera.position.set(0, 2, 8);
  }

  const scene = new Scene();
  scene.background = new Color(0xbfe3dd);
  scene.fog = new Fog(0xbfe3dd, 10, 50);

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;
  renderer.shadowMap.enabled = true;

  res({ s: scene, c: camera, r: renderer });
});
