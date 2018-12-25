/* eslint-disable no-param-reassign */
import {
  MeshLambertMaterial,
  CubeGeometry,
  SkeletonHelper,
  Mesh,
} from 'three';

import GLTFLoader from 'three-gltf-loader';

// import bolanUrl from '../assets/models/bolan.glb';

const bolanUrl = 'https://cdn.jsdelivr.net/gh/joseluismurillorios/rexrage/src/core/assets/models/bolan.glb';

export default scene => new Promise((res) => {
  const loader = new GLTFLoader();
  const wire = new MeshLambertMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0,
    // wireframe: true,
  });
  loader.load(bolanUrl, (gltf) => {
    const dino = gltf.scene;
    dino.rotation.y += Math.PI / 2;
    dino.position.x += -3;
    scene.add(dino);

    // Collision cube
    const cubeGeometry = new CubeGeometry(0.6, 1.5, 1, 1, 1, 1);
    const dinoCollision = new Mesh(cubeGeometry, wire);
    dinoCollision.position.set(-2.8, 0.5, 0);
    scene.add(dinoCollision);

    dino.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
      }
    });

    dino.loaded = true;
    console.log(gltf);

    const skeleton = new SkeletonHelper(dino);
    skeleton.visible = false;
    scene.add(skeleton);

    res({ d: dino, dc: dinoCollision, gl: gltf });
  });
});
