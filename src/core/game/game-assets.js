/* eslint-disable no-param-reassign */
import {
  MeshLambertMaterial,
  CubeGeometry,
  Mesh,
} from 'three';

import GLTFLoader from 'three-gltf-loader';

// import assetsUrl from '../assets/models/assets.glb';

const assetsUrl = 'https://cdn.jsdelivr.net/gh/joseluismurillorios/rexrage/src/core/assets/models/assets.glb';

export default (scene, enemiesIndex, gAssets, gEnemies) => new Promise((res) => {
  const loader = new GLTFLoader();
  const wire = new MeshLambertMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0,
    // wireframe: true,
  });
  loader.load(assetsUrl, (gltf) => {
    const assets = gltf.scene;

    assets.traverse((object) => {
      if (object.isMesh) object.castShadow = true;
    });

    Object.keys(gAssets).forEach((key) => {
      // console.log(key, gAssets[key]);
      gAssets[key].model = assets.getObjectByName(gAssets[key].name);
      gAssets[key].model.position.set(gAssets[key].x, gAssets[key].y, gAssets[key].z);
      scene.add(gAssets[key].model);
    });

    Object.keys(gEnemies).forEach((key) => {
      // console.log(key, gEnemies[key]);
      gEnemies[key].model = assets.getObjectByName(gEnemies[key].name);
      gEnemies[key].model.position.set(gEnemies[key].x, gEnemies[key].y, gEnemies[key].z);
    });

    scene.add(gEnemies[enemiesIndex].model);


    // Collision cube
    const enemy = gEnemies[enemiesIndex];
    const cubeGeometry = new CubeGeometry(0.3, 1, 1, 2, 2, 2);
    const enemiesCollision = new Mesh(cubeGeometry, wire);
    enemiesCollision.position.set(enemy.x, enemy.y + 0.5, enemy.z);
    enemiesCollision.scale.y = enemy.scale;
    enemiesCollision.position.y = enemy.scale / 2;
    scene.add(enemiesCollision);
    scene.add(gEnemies[enemiesIndex].model);

    assets.loaded = true;
    // console.log(assets);

    res({ ec: enemiesCollision });
  });
});
