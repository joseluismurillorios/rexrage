import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


import * as THREE from 'three';

import './style.scss';

const OrbitControls = require('three-orbit-controls')(THREE);

class Triangles extends Component {
  static fancyTriangle(size) {
    // Local Variables
    const theObject = new THREE.Object3D();

    const geometry = new THREE.Geometry();
    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.VertexColors,
      side: THREE.DoubleSide,
    });

    const color1 = new THREE.Color('#E3F22C');
    const color2 = new THREE.Color('#D53C78');
    const color3 = new THREE.Color('#5DEFFD');

    geometry.vertices.push(new THREE.Vector3(size, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, size, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));

    geometry.faces.push(new THREE.Face3(0, 1, 2));

    geometry.faces[0].vertexColors = [color1, color2, color3];

    const someMesh = new THREE.Mesh(geometry, material);

    let meshmaterial = new THREE.MeshBasicMaterial({
      color: '#D53C78', wireframe: true, transparent: true, opacity: 0.04,
    });
    if (Math.random() < 0.5) {
      meshmaterial = new THREE.MeshBasicMaterial({
        color: '#E3F22C', wireframe: true, transparent: true, opacity: 0.04,
      });
    }
    const boxgeometry = new THREE.BoxGeometry(size * 2, size * 2, size * 2);
    const boxMesh = new THREE.Mesh(boxgeometry, meshmaterial);


    theObject.add(boxMesh);


    theObject.add(someMesh);
    return theObject;
  }

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

    // Set scene and camera
    this.scene = null;
    this.aspectRatio = null;
    this.camera = null;

    // Set the DOM
    this.renderer = null;

    // Variables
    this.uTime = null;

    this.triangles = null;
    this.cantidad_triangles = null;
    this.group = null;

    this.onWindowResize = this.onWindowResize.bind(this);

    this.loop = this.loop.bind(this);
    this.stopLoop = this.stopLoop.bind(this);
    this.pauseLoop = this.pauseLoop.bind(this);
    this.soundAllowed = this.soundAllowed.bind(this);
  }

  componentDidMount() {
    // Set scene and camera
    this.scene = new THREE.Scene();
    this.aspectRatio = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(75, this.aspectRatio, 0.1, 1000);

    // Set the DOM
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.visuals.appendChild(this.renderer.domElement);
    this.renderer.setClearColor('#441A58');


    // Move the camera
    this.camera.position.z = 100;
    this.camera.position.y = 10;
    // Variables
    this.uTime = 0;

    this.triangles = [];
    this.cantidad_triangles = 100;
    this.group = new THREE.Group();

    this.group.position.y = 50;
    this.scene.add(this.group);


    for (let i = 0; i < this.cantidad_triangles; i += 1) {
      this.triangles.push(Triangles.fancyTriangle(Math.random() * 40));
      this.triangles[i].position.x = -50 + (Math.random() * 100);
      this.triangles[i].position.y = -50 + (Math.random() * 100);
      this.triangles[i].position.z = -20 + (Math.random() * 40);


      this.triangles[i].speedVelocityX = Math.random() * 0.02;
      this.triangles[i].speedVelocityY = Math.random() * 0.02;

      this.group.add(this.triangles[i]);
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.noPan = true;

    // this.axis = new THREE.AxisHelper(75);
    // this.scene.add(this.axis);

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
    if (this.analyser) {
      this.analyser.getByteFrequencyData(this.frequencyArray);
      z = this.frequencyArray[6] / 127;
    }
    const x = z || (Math.abs(Math.sin(((now) / this.millis) * Math.PI)) * 0.5) + 0.8;

    // const x = (Math.abs(Math.sin(((now) / this.millis) * Math.PI)) * 0.5) + 0.8;
    // console.log(x, z);
    this.uTime += 1;

    // Your code
    for (let i = 0; i < this.cantidad_triangles; i += 1) {
      this.triangles[i].rotation.x += this.triangles[i].speedVelocityX;
      this.triangles[i].rotation.y += this.triangles[i].speedVelocityY;


      this.triangles[i].position.y += 0.4;
      this.triangles[i].position.z = -20 + (Math.sin(((this.uTime * 0.01) + i) * 0.01) * 40);


      if (this.triangles[i].position.y > 2) {
        this.triangles[i].position.y = -200 + (Math.random() * 100);
      }

      this.triangles[i].scale.set(x, x, x);
    }

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

Triangles.propTypes = {
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Triangles));
