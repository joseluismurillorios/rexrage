/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


import * as THREE from 'three';

import './style.scss';

const OrbitControls = require('three-orbit-controls')(THREE);


class Blob extends Component {
  static convertRange(val, xMax, xMin) {
    const yMax = 127;
    const yMin = 0;

    const percent = (val - yMin) / (yMax - yMin);
    return ((percent * (xMax - xMin)) + xMin);
  }

  static reverseNumber(num, min, max) {
    return (max + min) - num;
  }

  constructor(props) {
    super(props);
    this.styles = ['solid', 'wireframe', 'pointcloud'];
    this.geometries = ['sphere', 'cylinder', 'cube', 'torus', 'icosahedron', 'tetrahedron', 'octahedron'];

    this.bpm = 120;
    this.millis = (60 / this.bpm) * 1000;
    this.now = 0;
    this.isRunning = true;
    this.then = 0;
    this.window = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      oX: window.innerWidth / 2,
      oY: window.innerHeight / 2,
    };

    this.settings = {};
    this.settings.style = this.styles[1];
    this.settings.geometry = this.geometries[0];
    this.settings.speed = 0.05;
    this.settings.waves = 8;
    this.settings.damping = 0.95;
    this.settings.dotSize = 1;
    this.settings.factorX = 1;
    this.settings.factorY = 1;
    this.settings.factorZ = 1;
    this.settings.fuzzyness = 0.4;

    this.sphereSettings = {};
    this.sphereSettings.radius = 100;
    this.sphereSettings.segmentsW = 128;
    this.sphereSettings.segmentsH = 128;

    this.cylinderSettings = {};
    this.cylinderSettings.radiusTop = 100;
    this.cylinderSettings.radiusBottom = 100;
    this.cylinderSettings.height = 200;
    this.cylinderSettings.segmentsW = 128;
    this.cylinderSettings.segmentsH = 128;
    this.cylinderSettings.openEnded = true;

    this.cubeSettings = {};
    this.cubeSettings.width = 100;
    this.cubeSettings.height = 100;
    this.cubeSettings.depth = 100;
    this.cubeSettings.segmentsW = 128;
    this.cubeSettings.segmentsH = 128;
    this.cubeSettings.segmentsD = 128;

    this.torusSettings = {};
    this.torusSettings.radius = 100;
    this.torusSettings.diameter = 100;
    this.torusSettings.segmentsW = 256;
    this.torusSettings.segmentsH = 256;
    this.torusSettings.arc = Math.PI * 2;

    this.tetrahedronSettings = {};
    this.tetrahedronSettings.radius = 100;
    this.tetrahedronSettings.detail = 4;

    this.icosahedronSettings = {};
    this.icosahedronSettings.radius = 100;
    this.icosahedronSettings.detail = 4;

    this.octahedronSettings = {};
    this.octahedronSettings.radius = 100;
    this.octahedronSettings.detail = 4;

    this.animationTime = 0;

    this.createScene = this.createScene.bind(this);
    this.createControls = this.createControls.bind(this);
    this.createParticleSystem = this.createParticleSystem.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);
    this.loop = this.loop.bind(this);
    this.stopLoop = this.stopLoop.bind(this);
    this.pauseLoop = this.pauseLoop.bind(this);
    this.update = this.update.bind(this);
    this.draw = this.draw.bind(this);

    // this.ip = document.getElementById('app').getAttribute('data-server');
    // this.port = document.getElementById('app').getAttribute('data-port');
  }

  componentDidMount() {
    // World();
    this.createScene();
    this.createControls();
    this.createParticleSystem();
    this.visuals.addEventListener('click', (e) => {
      console.log('click', e);
      this.reset = true;

      const geometry = new THREE.BoxGeometry(2, 2, 2);

      const material = new THREE.MeshBasicMaterial({
        color: 0x0FFFF0,
        wireframe: true,
        wireframeLinewidth: 2,
      });
      const mtmp = new THREE.Mesh(geometry, material);
      mtmp.position.set((e.pageX - this.window.oX) / 2, (this.window.oY - e.pageY) / 2, 0);
      // meshes.push(mtmp);

      this.scene.add(mtmp);
    }, false);

    // createGUI();

    window.addEventListener('resize', this.onWindowResize, false);

    this.loop();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.stopLoop();
  }

  onWindowResize() {
    this.window = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      oX: window.innerWidth / 2,
      oY: window.innerHeight / 2,
    };
    this.camera.aspect = this.window.innerWidth / this.window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.window.innerWidth, this.window.innerHeight);
  }

  update() {
    this.shaderUniforms.time.value = this.animationTime;
    this.animationTime += this.settings.speed;
    // console.log('this.animationTime', this.animationTime);
    this.controls.update();
  }

  draw() {
    this.renderer.render(this.scene, this.camera);
    const timer = Date.now() * 0.0010;

    this.camera.position.x += Math.sin(timer) * -2;
    this.camera.position.y += Math.cos(timer) * -5;
    this.camera.position.z += Math.sin(timer) * 2;
    this.camera.lookAt(this.scene.position);
  }

  loop(now) {
    // if not paused, do epic things!
    if (this.reset) {
      console.log('reset');
      this.then = now;
      this.reset = false;
    }
    // console.log((this.then));
    if (this.isRunning) {
      // Set up next iteration of the loop
      this.frameId = window.requestAnimationFrame(this.loop);
      this.update();
      this.draw();

      const x = ((now - this.then) / (this.millis)) * Math.PI;
      this.shaderUniforms.damping.value = (Math.sin(x) * 0.1) + 0.1;
      this.shaderUniforms.damping.needsUpdate = true;
      this.shaderUniforms.modifiers.value.w = Math.abs(Math.sin(x) * 1.5);
      this.shaderUniforms.modifiers.needsUpdate = true;

      if (!this.now || now - this.now >= this.millis) {
        this.now = now;
        console.log('blob tick', this.bpm, this.millis);
      }
    }
  }

  pauseLoop() {
    // toggle the value of isRunning
    this.isRunning = !this.isRunning;

    // call animate() if working
    if (this.isRunning) {
      this.loop();
    }
  }

  stopLoop() {
    if (this.frameId) {
      window.cancelAnimationFrame(this.frameId);
    }
    // Note: no need to worry if the loop has already been cancelled
    // cancelAnimationFrame() won't throw an error
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 600;
    this.camera.lookAt(this.scene.position);

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);

    this.visuals.appendChild(this.renderer.domElement);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.noPan = true;
  }

  createParticleSystem() {
    if (this.particleSystem) {
      this.geometry.dispose();
      this.material.dispose();
      this.scene.remove(this.particleSystem);
    }

    this.animationTime = 0;

    this.shaderAttributes = {
      index: {
        type: 'f',
        value: [],
      },
      random: {
        type: 'f',
        value: [],
      },
    };

    this.shaderUniforms = {
      delta: {
        type: 'f',
        value: 0,
      },
      time: {
        type: 'f',
        value: 0,
      },
      damping: {
        type: 'f',
        value: 1 - this.settings.damping,
      },
      dotSize: {
        type: 'f',
        value: this.settings.dotSize,
      },
      modifiers: {
        type: 'v4',
        value: new THREE.Vector4(
          this.settings.factorX,
          this.settings.factorY,
          this.settings.factorZ,
          this.settings.fuzzyness,
        ),
      },
      resolution: {
        type: 'v2',
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
    };

    this.material = new THREE.ShaderMaterial({
      attributes: this.shaderAttributes,
      uniforms: this.shaderUniforms,
      vertexShader: document.getElementById('vertexShader').textContent,
      fragmentShader: document.getElementById('fragmentShader').textContent,
      wireframe: (this.settings.style === 'wireframe'),
    });

    switch (this.settings.geometry) {
      case 'sphere': {
        this.geometry = new THREE.SphereGeometry(
          this.sphereSettings.radius,
          this.sphereSettings.segmentsW,
          this.sphereSettings.segmentsH,
        );
        break;
      }
      case 'cylinder': {
        this.geometry = new THREE.CylinderGeometry(
          this.cylinderSettings.radiusTop,
          this.cylinderSettings.radiusBottom,
          this.cylinderSettings.height,
          this.cylinderSettings.segmentsW,
          this.cylinderSettings.segmentsH,
          this.cylinderSettings.openEnded,
        );
        break;
      }
      case 'cube': {
        this.geometry = new THREE.CubeGeometry(
          this.cubeSettings.width,
          this.cubeSettings.height,
          this.cubeSettings.depth,
          this.cubeSettings.segmentsW,
          this.cubeSettings.segmentsH,
          this.cubeSettings.segmentsD,
        );
        break;
      }
      case 'torus': {
        this.geometry = new THREE.TorusGeometry(
          this.torusSettings.radius,
          this.torusSettings.diameter,
          this.torusSettings.segmentsW,
          this.torusSettings.segmentsH,
          this.torusSettings.arc,
        );
        break;
      }
      case 'icosahedron': {
        this.geometry = new THREE.IcosahedronGeometry(
          this.icosahedronSettings.radius,
          this.icosahedronSettings.detail,
        );
        break;
      }
      case 'tetrahedron': {
        this.geometry = new THREE.TetrahedronGeometry(
          this.tetrahedronSettings.radius,
          this.tetrahedronSettings.detail,
        );
        break;
      }
      case 'octahedron': {
        this.geometry = new THREE.OctahedronGeometry(
          this.octahedronSettings.radius,
          this.octahedronSettings.detail,
        );
        break;
      }
      default: {
        break;
      }
    }

    const newDelta = (Math.PI * this.settings.waves) / this.geometry.vertices.length;

    this.shaderUniforms.delta.value = newDelta;

    for (let i = 0; i < this.geometry.vertices.length; i += 1) {
      this.shaderAttributes.index.value[i] = i;
      this.shaderAttributes.random.value[i] = 0.5 + (Math.random() * 1);
    }

    switch (this.settings.style) {
      case 'solid':
      case 'wireframe': {
        this.particleSystem = new THREE.Mesh(this.geometry, this.material);
        break;
      }
      case 'pointcloud': {
        this.particleSystem = new THREE.PointCloud(this.geometry, this.material);
        break;
      }
      default: {
        break;
      }
    }

    this.scene.add(this.particleSystem);
  }

  render() {
    return (
      <div ref={(el) => { this.visuals = el; }} />
    );
  }
}

Blob.propTypes = {
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Blob));
