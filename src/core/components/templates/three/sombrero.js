/* eslint-disable max-len */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


import * as THREE from 'three';

import './style.scss';

class Terrain {
  constructor(scene) {
    this.uniforms = null;

    this.plane_mesh = null;

    this.plane_geometry = null;

    this.groundMaterial = null;

    this.clock = new THREE.Clock(true);

    this.options = {
      elevation: 0,
      noise_range: -4.4,
      sombrero_amplitude: -0.2,
      sombrero_frequency: 10.0,
      speed: 1.72,
      segments: 324,
      wireframe_color: '#e25cfe',
      perlin_passes: 2,
      wireframe: true,
      floor_visible: true,
    };

    this.scene = null;
    this.init = this.init.bind(this);
    this.buildPlanes = this.buildPlanes.bind(this);
    this.update = this.update.bind(this);
    this.scene = scene;
    this.init();
  }

  init() {
    this.uniforms = {
      time: {
        type: 'f',
        value: 0.0,
      },
      speed: {
        type: 'f',
        value: this.options.speed,
      },
      elevation: {
        type: 'f',
        value: this.options.elevation,
      },
      noise_range: {
        type: 'f',
        value: this.options.noise_range,
      },
      offset: {
        type: 'f',
        value: this.options.elevation,
      },
      perlin_passes: {
        type: 'f',
        value: this.options.perlin_passes,
      },
      sombrero_amplitude: {
        type: 'f',
        value: this.options.sombrero_amplitude,
      },
      sombrero_frequency: {
        type: 'f',
        value: this.options.sombrero_frequency,
      },
      line_color: {
        type: 'c',
        value: new THREE.Color(this.options.wireframe_color),
      },
    };
    this.buildPlanes(this.options.segments);
  }

  buildPlanes(segments) {
    this.plane_geometry = new THREE.PlaneBufferGeometry(20, 20, segments, segments);
    this.plane_material = new THREE.ShaderMaterial({
      vertexShader: document.getElementById('shader-vertex-terrain-perlinsombrero').textContent,
      fragmentShader: document.getElementById('shader-fragment-terrain').textContent,
      wireframe: this.options.wireframe,
      wireframeLinewidth: 1,
      transparent: true,
      uniforms: this.uniforms,
    });
    this.groundMaterial = new THREE.MeshPhongMaterial({
      ambient: 0xffffff,
      color: 0xffffff,
      specular: 0x050505,
    });
    this.groundMaterial.color.setHSL(0.095, 1, 0.75);
    this.materials = [this.groundMaterial, this.plane_material];
    this.plane_mesh = THREE.SceneUtils.createMultiMaterialObject(this.plane_geometry, this.materials);
    this.plane_mesh.rotation.x = -Math.PI / 2;
    this.plane_mesh.position.y = -0.5;
  }

  update(x) {
    this.uniforms.sombrero_amplitude.value = x;
    this.plane_material.uniforms.time.value = this.clock.getElapsedTime();
  }
}


class Sombrero extends Component {
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

    this.canvasGL = null;
    this.visuals = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.geometry = null;
    this.material = null;
    this.mesh = null;
    this.gui = null;
    this.terrain = null;
    this.composer = null;
    this.render_pass = null;
    this.fxaa_pass = null;
    this.posteffect = false;
    this.meteo = null;
    this.skybox = null;

    this.update = this.update.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.resize = this.resize.bind(this);
    this.onWindowResize = this.onWindowResize.bind(this);

    this.loop = this.loop.bind(this);
    this.stopLoop = this.stopLoop.bind(this);
    this.pauseLoop = this.pauseLoop.bind(this);

    this.w = window.innerWidth;
    this.h = window.innerHeight;
  }

  componentDidMount() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, this.w / this.h, 0.1, 100000);
    this.camera.position.z = 7;
    this.camera.position.y = 1;
    this.renderer = new THREE.WebGLRenderer({
      width: this.w,
      height: this.h,
      scale: 1,
      antialias: false,
    });
    this.renderer.setSize(this.w, this.h);
    this.visuals.appendChild(this.renderer.domElement);
    this.camera.lookAt(new THREE.Vector3());
    this.terrain = new Terrain(this.scene);
    this.scene.add(this.terrain.plane_mesh);
    window.addEventListener('resize', this.onWindowResize, false);
    // this.update();

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

  resize(stageWidth, stageHeight) {
    this.camera.aspect = stageWidth / stageHeight;
    this.camera.updateProjectionMatrix();
    return this.renderer.setSize(stageWidth, stageHeight);
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
      this.update(now);

      if (!this.now || now - this.now >= this.millis) {
        this.now = now;
        console.log('sombrero tick', this.bpm, this.millis);
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

  update(now) {
    const x = (Math.abs(Math.sin(((now - this.then) / (this.millis)) * Math.PI)));
    // console.log(x);
    // requestAnimationFrame(this.update);
    this.terrain.update(x);
    return this.renderScene();
  }

  renderScene() {
    return this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div ref={(el) => { this.visuals = el; }} />
    );
  }
}

Sombrero.propTypes = {
};

const mapStateToProps = state => ({
  common: state.common,
});

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Sombrero));
