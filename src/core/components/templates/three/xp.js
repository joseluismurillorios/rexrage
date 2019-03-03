import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


import * as THREE from 'three';

import './style.scss';

class XP extends Component {
  constructor(props) {
    super(props);

    this.bpm = 120;
    this.millis = (60 / this.bpm) * 1000;
    this.now = 0;
    this.isRunning = true;
    this.then = 0;

    this.w = window.innerWidth;
    this.h = window.innerHeight;

    this.window = {
      w: window.innerWidth,
      h: window.innerHeight,
      oX: window.innerWidth / 2,
      oY: window.innerHeight / 2,
    };

    // Shaders
    this.vertShader = null;
    this.fragShader = null;
    // Renderer
    this.renderer = null;
    // Camera
    this.camera = null;
    // Scene
    this.scene = null;
    // Create + init position mesh
    this.ammount = null;
    this.material = null;
    this.geometry = null;
    this.planet = null;
    // Render
    this.start = null;


    this.onWindowResize = this.onWindowResize.bind(this);

    this.loop = this.loop.bind(this);
    this.stopLoop = this.stopLoop.bind(this);
    this.pauseLoop = this.pauseLoop.bind(this);
    this.soundAllowed = this.soundAllowed.bind(this);
  }

  componentDidMount() {
    // Shaders
    this.vertShader = document.querySelector('#vertexshaderXP').innerHTML;
    this.fragShader = document.querySelector('#fragmentshaderXP').innerHTML;
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.visuals, antialiasing: true });
    this.renderer.setClearColor(0x111111);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // Camera
    this.camera = new THREE.PerspectiveCamera(55, this.w / this.h, 0.1, 5000);
    this.camera.position.z = 400;
    // Scene
    this.scene = new THREE.Scene();
    // Create + init position mesh
    this.ammount = 1;
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { type: 'f', value: 0 },
      },
      vertexShader: this.vertShader,
      fragmentShader: this.fragShader,
    });
    this.geometry = new THREE.SphereGeometry(30, 30, 100);
    this.planet = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.planet);
    this.planet.position.x = 0;
    this.planet.position.y = 0;
    this.planet.position.z = 0;
    this.planet.modifier = Math.random();
    this.planet.material.transparent = true;
    this.planet.material.opacity = Math.random();

    window.addEventListener('resize', this.onWindowResize, false);
    navigator.getUserMedia({ audio: true }, this.soundAllowed, (error) => {
      console.log(error);
    });

    // socket.on('visuals', (msg) => {
    //   if (msg.controller === 1) {
    //     console.log('cue', msg.value);
    //     this.reset = msg.value === 127;
    //   }
    // });

    // socket.on('bpm', (msg) => {
    //   this.bpm = msg;
    //   this.millis = (60 / this.bpm) * 1000;
    // });

    this.loop();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize, false);
    this.stopLoop();
  }

  onWindowResize() {
    this.window = {
      w: window.innerWidth,
      h: window.innerHeight,
      oX: window.innerWidth / 2,
      oY: window.innerHeight / 2,
    };
    this.camera.aspect = this.window.w / this.window.h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.window.w, this.window.h);
  }

  soundAllowed(stream) {
    window.persistAudioStream = stream;
    this.audioContent = new AudioContext();
    this.audioStream = this.audioContent.createMediaStreamSource(stream);
    this.analyser = this.audioContent.createAnalyser();
    this.audioStream.connect(this.analyser);
    this.analyser.fftSize = 1024;
    this.frequencyArray = new Uint8Array(this.analyser.frequencyBinCount);
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
        // console.log('sombrero tick', this.bpm, this.millis);
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
    let z = false;
    // let w = false;
    if (this.analyser) {
      // this.analyser.getByteFrequencyData(this.frequencyArray);
      this.analyser.getByteFrequencyData(this.frequencyArray);
      z = this.frequencyArray[6] / 127;
      // w = this.frequencyArray[100] / 127;
    }
    // console.log(now, this.millis);
    const x = z || Math.abs(Math.sin((now / this.millis) * Math.PI));
    const y = z || Math.abs(Math.sin(now * 0.005));

    // const x = Math.abs(Math.sin((now / this.millis) * Math.PI));
    // const y = x || Math.abs(Math.sin(now * 0.005));
    // console.log(z, y);
    this.material.uniforms.time.value = (x * 0.00005) * (y * 1000);
    this.scene.rotation.y += 0.015;

    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 100;

    this.renderer.render(this.scene, this.camera);
  }

  renderScene() {
    return this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <canvas ref={(el) => { this.visuals = el; }} />
    );
  }
}

XP.propTypes = {
};

const mapStateToProps = state => ({
  common: state.common,
});

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(XP));
