/* eslint-disable no-param-reassign */
import {
  AmbientLight,
  DirectionalLight,
} from 'three';

export default scene => new Promise((res) => {
  const ambientLight = new AmbientLight(0x444444);
  scene.add(ambientLight);


  const dirLight = new DirectionalLight(0xffffff);

  // Set the direction of the light
  dirLight.position.set(2, 10, 15);

  // Allow shadow casting
  dirLight.castShadow = true;

  // define the visible area of the projected shadow
  dirLight.shadow.camera.left = -20;
  dirLight.shadow.camera.right = 20;
  dirLight.shadow.camera.top = 20;
  dirLight.shadow.camera.bottom = -20;
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 2000;

  // define the resolution of the shadow; the higher the better,
  // but also the more expensive and less performant
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  scene.add(dirLight);

  res(true);
});
