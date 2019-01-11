/* eslint-disable no-param-reassign */
// import * as THREE from 'three';
import {
  Scene,
  PerspectiveCamera,
  Clock,
  Color,
  Fog,
  AmbientLight,
  CubeGeometry,
  DirectionalLight,
  MeshPhongMaterial,
  Mesh,
  PlaneGeometry,
  WebGLRenderer,
  BoxGeometry,
  Raycaster,
  MeshLambertMaterial,
  SkeletonHelper,
  AnimationMixer,
} from 'three';
import GLTFLoader from 'three-gltf-loader';
import OrbitControls from 'three-orbitcontrols';

import WEBGL from './helper-webgl';
import SimplexNoise from './helper-simplex';
import { debounce } from './helper-util';

// import bolanUrl from '../assets/models/bolan.glb';
// import assetsUrl from '../assets/models/assets.glb';

const bolanUrl = 'https://cdn.jsdelivr.net/gh/joseluismurillorios/rexrage/src/core/assets/models/bolan.glb';
const assetsUrl = 'https://cdn.jsdelivr.net/gh/joseluismurillorios/rexrage/src/core/assets/models/assets.glb';

export default (container) => {
  const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (WEBGL.isWebGLAvailable() === false) {
    document.body.appendChild(WEBGL.getWebGLErrorMessage());
  }

  const keyboard = {};
  let scene;
  let renderer;
  let camera;
  // let stats;
  let skeleton;
  let mixer;
  let clock;
  let controls;
  let assets = {};

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
  const side = 40;
  const offsetRate = 0.0004;

  const xZoom = 6;
  const yZoom = 6;
  const noiseStrength = 0.155;
  const simplex = new SimplexNoise();

  let paused = false;

  const gameAssets = {
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
  let actions;

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
    // setWeight( runAction, settings[ 'modify run weight' ] );

    actions.forEach((action) => {
      action.play();
    });
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // alert(`'resize': ${window.innerWidth}, ${window.innerHeight}`);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  function animate(frame) {
    frame = frame || 0;
    const offset = frame * offsetRate;

    requestAnimationFrame(animate);

    const delta = clock.getDelta();


    if (assets.loaded && !paused) {
      // console.log(Math.sin(frame / 1000) * 2);
      adjustVertices(offset);


      Object.keys(gameAssets).forEach((key) => {
        if (gameAssets[key].model.position.x < gameAssets[key].left) {
          gameAssets[key].model.position.x = Math.abs(gameAssets[key].left);
        }
        gameAssets[key].model.position.x -= 0.05;
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

      const originPoint = dinoCollision.position.clone();

      // console.log(originPoint);

      const dinoVertices = dinoCollision.geometry.vertices;

      let hits = false;

      for (let vertexIndex = 0; vertexIndex < dinoVertices.length; vertexIndex += 1) {
        const localVertex = dinoVertices[vertexIndex].clone();
        const globalVertex = localVertex.applyMatrix4(dinoCollision.matrix);
        const directionVector = globalVertex.sub(dinoCollision.position);

        const ray = new Raycaster(originPoint, directionVector.clone().normalize());
        const cResults = ray.intersectObjects(collidableMeshList);
        if (cResults.length > 0 && cResults[0].distance < directionVector.length()) {
          console.log('Hit');
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
    mixer.update(delta);

    if (!IS_MOBILE) {
      controls.update(delta);
    }

    renderer.render(scene, camera);
  }

  function setupScene() {
    camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100);

    if (IS_MOBILE) {
      camera.position.set(-2, 2, 15);
    } else {
      camera.position.set(0, 2, 8);
    }

    clock = new Clock();

    scene = new Scene();
    scene.background = new Color(0xbfe3dd);
    scene.fog = new Fog(0xbfe3dd, 10, 50);
  }

  function setupLights() {
    // let hemiLight = new HemisphereLight(0xffffff, 0x444444);
    // hemiLight.position.set(0, 20, 0);
    // scene.add(hemiLight);
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

    // let helper = new DirectionalLightHelper(dirLight, 5);
    // scene.add(helper);
  }

  function setupGround() {
    const ground = new MeshPhongMaterial({
      color: 0x826a40,
      flatShading: true,
      wireframe: false,
    });

    planeGeo = new PlaneGeometry(50, 40, side, side);
    // console.log(planeGeo.vertices);

    planeMesh = new Mesh(planeGeo, ground);
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.rotation.z = -Math.PI / 2;
    planeMesh.position.y = -0.2;
    planeMesh.position.z = -10;
    planeMesh.receiveShadow = true;
    scene.add(planeMesh);

    // let roadGeo = new PlaneGeometry(5, 50, 2, 2);
    const roadGeo = new BoxGeometry(5, 50, 1);
    const roadMesh = new Mesh(roadGeo, new MeshPhongMaterial({ color: 0x4f4027 }));
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.rotation.z = -Math.PI / 2;
    roadMesh.position.y = -0.5;
    roadMesh.receiveShadow = true;
    scene.add(roadMesh);
  }

  function setupRenderer() {
    renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
  }

  function setupOrbitControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.enablePan = false;
  }

  function setupModels() {
    const loader = new GLTFLoader();
    const wire = new MeshLambertMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      // wireframe: true,
    });
    loader.load(bolanUrl, (gltf) => {
      dino = gltf.scene;
      dino.rotation.y += Math.PI / 2;
      dino.position.x += -3;
      scene.add(dino);

      // Collision cube
      const cubeGeometry = new CubeGeometry(0.6, 1.5, 1, 1, 1, 1);
      dinoCollision = new Mesh(cubeGeometry, wire);
      dinoCollision.position.set(-2.8, 0.5, 0);
      scene.add(dinoCollision);

      dino.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = true;
        }
      });

      //
      skeleton = new SkeletonHelper(dino);
      skeleton.visible = false;
      scene.add(skeleton);

      //
      const { animations } = gltf;

      mixer = new AnimationMixer(dino);
      mixer.timeScale = 2;

      idleAction = mixer.clipAction(animations[0]);
      walkAction = mixer.clipAction(animations[1]);
      // runAction = mixer.clipAction( animations[ 0 ] );

      // actions = [ idleAction, walkAction, runAction ];
      actions = [idleAction, walkAction];
      if (!IS_MOBILE) {
        setupOrbitControls();
      }
      activateAllActions();
    });

    loader.load(assetsUrl, (gltf) => {
      assets = gltf.scene;
      console.log(assets);

      assets.traverse((object) => {
        if (object.isMesh) object.castShadow = true;
      });

      Object.keys(gameAssets).forEach((key) => {
        // console.log(key, gameAssets[key]);
        gameAssets[key].model = assets.getObjectByName(gameAssets[key].name);
        gameAssets[key].model.position.set(gameAssets[key].x, gameAssets[key].y, gameAssets[key].z);
        scene.add(gameAssets[key].model);
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
      enemiesCollision = new Mesh(cubeGeometry, wire);
      enemiesCollision.position.set(enemy.x, enemy.y + 0.5, enemy.z);
      enemiesCollision.scale.y = enemy.scale;
      enemiesCollision.position.y = enemy.scale / 2;
      collidableMeshList.push(enemiesCollision);
      scene.add(enemiesCollision);

      scene.add(gEnemies[enemiesIndex].model);

      assets.loaded = true;
      animate();
    });
  }

  function init() {
    setupScene();
    setupLights();
    setupGround();

    //
    setupRenderer();
    setupModels();
    adjustVertices(0);

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
  window.addEventListener('touchstart', () => {
    paused = false;
    if (canJump === true) { velocity.y += 5.2; }
    canJump = false;
  });
  window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  window.addEventListener('keyup', keyUp);
  window.addEventListener('click', () => { paused = !paused; });

  init();
};
