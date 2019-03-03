/* eslint-disable max-len */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


import * as THREE from 'three';

import './style.scss';

const OrbitControls = require('three-orbit-controls')(THREE);

class Orbit extends Component {
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

    this.renderer = null;
    this.camera = null;
    this.scene = null;
    // Create the materials
    this.normalMaterial = null;
    this.coloredMaterial = null;

    // Create points lights
    this.pointLight = null;
    this.light = null;

    // Centered Sun
    this.Geo = null;
    this.Sun = null;


    this.onWindowResize = this.onWindowResize.bind(this);

    this.loop = this.loop.bind(this);
    this.stopLoop = this.stopLoop.bind(this);
    this.pauseLoop = this.pauseLoop.bind(this);
    this.soundAllowed = this.soundAllowed.bind(this);
  }

  componentDidMount() {
    // create a WebGL renderer, camera
    // and a scene
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.camera = new THREE.PerspectiveCamera(70, this.w / this.h, 0.1, 10000);
    this.scene = new THREE.Scene();

    // add the camera to the scene
    this.scene.add(this.camera);

    // start the renderer
    this.renderer.setSize(this.w, this.h);

    // attach the render-supplied DOM element
    this.visuals.append(this.renderer.domElement);

    this.camera.position.z = 200;


    // Create the materials
    this.normalMaterial = new THREE.MeshNormalMaterial({});
    this.coloredMaterial = new THREE.MeshLambertMaterial({ color: 0xAAD3FF });

    // Create points lights
    this.pointLight = new THREE.HemisphereLight(0x00FF00, 0x0000FF, 0.5);
    this.pointLight.position.x = 100;
    this.pointLight.position.y = 100;
    this.pointLight.position.z = 130;
    this.light = new THREE.PointLight(0xFFD300, 12, 100);
    this.light.position.set(50, 50, 50);
    this.scene.add(this.light);
    this.scene.add(this.pointLight);


    // Centered Sun
    this.Geo = new THREE.SphereGeometry(10, 15, 25);
    this.Sun = new THREE.Mesh(this.Geo, this.normalMaterial);

    // Particules use
    function Particule() {
      this.geo = new THREE.SphereGeometry(
        Math.floor((Math.random() * 5) + 1), // Size
        Math.floor((Math.random() * 6) + 1),
        Math.floor((Math.random() * 5) + 1),
      );
      this.ptl = new THREE.Mesh(this.geo, new THREE.MeshNormalMaterial({}));
      this.ptl.position.y = -10 + Math.floor((Math.random() * 20) + 1);
      this.speed = Math.floor((Math.random() * 50) + 5) / 100;
      this.dia = Math.floor((Math.random() * 200) + 1);
    }


    this.numParts = 2000;
    this.tabParts = [];
    for (let i = 0; i < this.numParts; i += 1) {
      this.tabParts.push(new Particule());
      this.scene.add(this.tabParts[i].ptl);
    }

    this.scene.add(this.Sun);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.noPan = true;

    // Update 58
    this.inc = 0;

    window.addEventListener('resize', this.onWindowResize, false);
    navigator.getUserMedia({ audio: true }, this.soundAllowed, (error) => {
      console.log(error);
    });

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
    let z = false;
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyArray);
      z = this.frequencyArray[6] / 127;
    }
    // const x = z || (Math.abs(Math.sin(((now) / this.millis) * Math.PI)) * 0.5) + 0.8;

    const x = z || Math.abs(Math.sin((now / this.millis) * Math.PI));
    this.camera.lookAt(this.Sun.position);
    this.camera.position.y = 60;
    this.inc += 0.025;
    this.Sun.rotation.y = -this.inc;
    for (let i = 0; i < this.numParts; i += 1) {
      // console.log(tabParts[i]);
      this.tabParts[i].ptl.position.x = (this.Sun.position.x - (70 + this.tabParts[i].dia))
        * Math.cos((this.tabParts[i].speed * this.inc) + (i / 100));
      this.tabParts[i].ptl.position.z = (this.Sun.position.z - (70 + this.tabParts[i].dia))
        * Math.sin((this.tabParts[i].speed * this.inc) + (i / 100));
      this.tabParts[i].ptl.position.y = this.Sun.position.y + (this.tabParts[i].dia * Math.tan(this.tabParts[i].speed * this.inc));
      this.tabParts[i].ptl.rotation.z = this.tabParts[i].speed * this.inc * 8;
      this.tabParts[i].ptl.rotation.y = this.tabParts[i].speed * this.inc * 9;
      this.tabParts[i].ptl.rotation.x = this.tabParts[i].speed * this.inc;

      // console.log(x);
      this.tabParts[i].ptl.scale.set(x, x, x);
    }
    this.Sun.scale.set(x * 2, x * 2, x * 2);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
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

Orbit.propTypes = {
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Orbit));
