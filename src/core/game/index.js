/* eslint-disable no-param-reassign */

import {
  Raycaster,
  AnimationMixer,
  Clock,
} from 'three';

import OrbitControls from 'three-orbitcontrols';

import WEBGL from './webgl';
import SimplexNoise from './simplex';
import { debounce } from './util';

import setupScene from './game-scene';
import setupGround from './game-ground';
import setupLights from './game-lights';
import setupRex from './game-rex';
import setupAssets from './game-assets';

export default (container) => {
  const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (WEBGL.isWebGLAvailable() === false) {
    document.body.appendChild(WEBGL.getWebGLErrorMessage());
  }

  const keyboard = {};
  let scene = {};
  let renderer;
  let camera = {};
  // let stats;
  let mixer;
  let clock;
  let controls;

  const velocity = { x: 0, y: 0, z: 0 };
  let prevTime = performance.now();
  let canJump = true;

  let dino;
  let dinoCollision;
  const collidableMeshList = [];
  let enemiesIndex = Math.floor((Math.random() * 4));
  let enemiesCollision;

  let planeGeo;
  let planeMesh;
  const offsetRate = 0.0004;

  const xZoom = 6;
  const yZoom = 6;
  const noiseStrength = 0.155;
  const simplex = new SimplexNoise();

  let paused = true;

  const gAssets = {
    tree1: {
      name: 'tree1', x: -7, y: -0.28, z: -6, model: null, left: -12,
    },
    tree2: {
      name: 'tree2', x: 3, y: -0.28, z: -17, model: null, left: -18,
    },
    tree3: {
      name: 'tree3', x: 11, y: -0.28, z: -13, model: null, left: -16,
    },
    nopal1: {
      name: 'nopal1', x: -2, y: -0.28, z: -6, model: null, left: -13,
    },
    nopal2: {
      name: 'nopal2', x: 4, y: -0.28, z: -4.5, model: null, left: -10,
    },
    nopal3: {
      name: 'nopal3', x: 16, y: -0.28, z: 5, model: null, left: -6,
    },
    cacti1: {
      name: 'cacti1', x: -8, y: -0.28, z: -8, model: null, left: -16,
    },
    cacti2: {
      name: 'cacti2', x: -1, y: -0.28, z: 4, model: null, left: -12,
    },
    cacti3: {
      name: 'cacti3', x: 8, y: -0.28, z: 6, model: null, left: -14,
    },
    cacti4: {
      name: 'cacti4', x: 12, y: -0.28, z: -10, model: null, left: -18,
    },
    rock1: {
      name: 'rock1', x: 4, y: -0.28, z: -5, model: null, left: -15,
    },
    rock2: {
      name: 'rock2', x: 16, y: -0.28, z: -11, model: null, left: -18,
    },
    rock3: {
      name: 'rock3', x: 10, y: -0.28, z: 5, model: null, left: -11,
    },
    rock4: {
      name: 'rock4', x: 8, y: -0.28, z: -7, model: null, left: -13,
    },
    rock5: {
      name: 'rock5', x: -11, y: -0.28, z: -13, model: null, left: -18,
    },
    plant1: {
      name: 'plant1', x: 0, y: -0.28, z: 7, model: null, left: -9,
    },
    plant2: {
      name: 'plant2', x: -6, y: -0.28, z: -4, model: null, left: -10,
    },
    plant3: {
      name: 'plant3', x: 7, y: -0.28, z: -9, model: null, left: -14,
    },
    bird1: {
      name: 'bird1', x: 7, y: 0, z: -2, model: null, left: -18,
    },
    bird2: {
      name: 'bird2', x: -4, y: 0, z: 2, model: null, left: -13,
    },
    skull: {
      name: 'skull', x: 6, y: 0, z: 1.5, model: null, left: -17,
    },
  };

  const gEnemies = {
    0: {
      name: 'saguaro1', x: 6, y: 0, z: 0, model: null, left: -7, scale: 1.1,
    },
    1: {
      name: 'saguaro2', x: 6, y: 0, z: 0, model: null, left: -7, scale: 1,
    },
    2: {
      name: 'saguaro3', x: 6, y: 0, z: 0, model: null, left: -7, scale: 0.8,
    },
    3: {
      name: 'saguaro4', x: 6, y: 0, z: 0, model: null, left: -7, scale: 0.5,
    },
  };

  let idleAction;
  let walkAction;

  function adjustVertices(offset) {
    for (let i = 0; i < planeMesh.geometry.vertices.length; i += 1) {
      const vertex = planeMesh.geometry.vertices[i];
      const x = vertex.x / xZoom;
      const y = vertex.y / yZoom;
      const noise = simplex.noise2D(x, y + offset) * noiseStrength;
      vertex.z = noise;
    }
    planeGeo.verticesNeedUpdate = true;
    planeGeo.computeVertexNormals();
  }

  function setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
  }

  function activateAllActions() {
    setWeight(idleAction, 0.0);
    setWeight(walkAction, 1.0);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // alert(`'resize': ${window.innerWidth}, ${window.innerHeight}`);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  function moveAssets() {
    Object.keys(gAssets).forEach((key) => {
      if (gAssets[key].model.position.x < gAssets[key].left) {
        gAssets[key].model.position.x = Math.abs(gAssets[key].left);
      }
      gAssets[key].model.position.x -= 0.05;
    });

    if (gEnemies[enemiesIndex].model.position.x < gEnemies[enemiesIndex].left) {
      gEnemies[enemiesIndex].model.position.x = Math.abs(gEnemies[enemiesIndex].left);

      scene.remove(gEnemies[enemiesIndex].model);
      enemiesIndex = Math.floor((Math.random() * 4));
      gEnemies[enemiesIndex].model.position.x = Math.abs(gEnemies[enemiesIndex].left);

      enemiesCollision.scale.y = gEnemies[enemiesIndex].scale;
      enemiesCollision.position.y = 0;
      enemiesCollision.position.y = gEnemies[enemiesIndex].scale / 2;

      scene.add(gEnemies[enemiesIndex].model);
    }
    gEnemies[enemiesIndex].model.position.x -= 0.05;
    enemiesCollision.position.x = gEnemies[enemiesIndex].model.position.x;
  }

  function checkCollisions() {
    const originPoint = dinoCollision.position.clone();

    const dinoVertices = dinoCollision.geometry.vertices;

    let hits = false;


    for (let vertexIndex = 0; vertexIndex < dinoVertices.length; vertexIndex += 1) {
      const localVertex = dinoVertices[vertexIndex].clone();
      const globalVertex = localVertex.applyMatrix4(dinoCollision.matrix);
      const directionVector = globalVertex.sub(dinoCollision.position);

      const ray = new Raycaster(originPoint, directionVector.clone().normalize());
      const cResults = ray.intersectObjects(collidableMeshList);
      if (cResults.length > 0 && cResults[0].distance < directionVector.length()) {
        // console.log('Hit');
        hits = true;
      }
    }
    if (hits) {
      enemiesCollision.material.opacity = 0.1;
      dinoCollision.material.opacity = 0.1;
    } else {
      enemiesCollision.material.opacity = 0;
      dinoCollision.material.opacity = 0;
    }
  }

  function animate(frame) {
    frame = frame || 0;
    const offset = frame * offsetRate;

    requestAnimationFrame(animate);

    const delta = clock.getDelta();


    if (dino.loaded && !paused) {
      // console.log(Math.sin(frame / 1000) * 2);
      adjustVertices(offset);
      moveAssets();

      const time = performance.now();
      const del = (time - prevTime) / 600;
      velocity.y -= 6.0 * del; // 100.0 = mass

      dino.position.y += velocity.y * del;
      dinoCollision.position.y = dino.position.y + 0.5;
      mixer.timeScale = 0.5;

      if (dino.position.y <= 0) {
        velocity.y = 0;
        dino.position.y = 0;
        dinoCollision.position.y = dino.position.y + 0.5;

        mixer.timeScale = 2;
        canJump = true;
      }

      prevTime = time;
      checkCollisions();
    }


    mixer.update(delta);

    if (!IS_MOBILE) {
      controls.update(delta);
    }

    renderer.render(scene, camera);
  }

  function setupOrbitControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.enablePan = false;
  }

  function onLoopFinished() {
    if (paused) {
      walkAction.stop();
    }
  }

  function init() {
    // setupScene();
    clock = new Clock();
    setupScene().then(({ s, c, r }) => {
      console.log('scene loaded');
      scene = s;
      camera = c;
      renderer = r;
      container.appendChild(renderer.domElement);


      setupGround(scene).then(({ g, m }) => {
        console.log('ground loaded');
        planeGeo = g;
        planeMesh = m;
        adjustVertices(0);

        setupLights(scene).then(() => {
          console.log('lights loaded');
          setupRex(scene).then(({ d, dc, gl }) => {
            console.log('rex loaded');
            dino = d;
            dinoCollision = dc;
            const { animations } = gl;

            mixer = new AnimationMixer(dino);
            mixer.timeScale = 2;


            idleAction = mixer.clipAction(animations[0]);
            walkAction = mixer.clipAction(animations[1]);

            walkAction.play();
            mixer.addEventListener('loop', onLoopFinished);

            if (!IS_MOBILE) {
              setupOrbitControls();
            }
            activateAllActions();

            setupAssets(scene, enemiesIndex, gAssets, gEnemies).then(({ ec }) => {
              console.log('assets loaded');
              enemiesCollision = ec;
              collidableMeshList.push(enemiesCollision);
              animate();
            });
          });
        });
      });
    });

    // stats = new Stats();
    // container.appendChild(stats.dom);
    const debouncedResize = debounce(() => {
      onWindowResize();
    }, 250);

    window.addEventListener('resize', debouncedResize, false);
  }

  function keyDown(event) {
    keyboard[event.keyCode] = true;
    switch (event.keyCode) {
      case 32: {
        if (canJump === true) { velocity.y += 5.2; }
        canJump = false;
        break;
      }
      default:
        break;
    }
  }

  function keyUp(event) {
    keyboard[event.keyCode] = false;
  }


  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  window.addEventListener('touchstart', () => {
    paused = false;
    if (canJump === true) { velocity.y += 5.2; }
    canJump = false;
  });
  window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  window.addEventListener('click', () => {
    paused = !paused;
    if (!paused) {
      walkAction.play();
    }
  });

  init();
};
