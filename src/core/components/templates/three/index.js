/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


// import socket from '../../helpers/helper-socket';
// import { setInfo } from '../../redux/actions/common';

import Sombrero from './sombrero';
import Blob from './blob';
import XP from './xp';
import Triangle from './triangles';
import Orbit from './orbit';

import './style.scss';
// import img from './logo-club.png';

class Three extends Component {
  constructor(props) {
    super(props);

    this.components = [<Sombrero />, <Blob />, <XP />, <Triangle />, <Orbit />];
    this.labels = [
      // <img src={img} alt="" />,
      // <h1>Club de Empresarios BC</h1>,
      // <h1>De la Calle al Club</h1>,
      // <h1>DJ Jose Murillo</h1>,
      <h1>24/Se7en</h1>,
      <h1>BeSounder</h1>,
    ];

    this.state = {
      index: Math.floor(Math.random() * this.components.length),
      labelIndex: Math.floor(Math.random() * this.labels.length),
    };

    this.bpm = 120;

    // this.ip = document.getElementById('app').getAttribute('data-server');
    // this.port = document.getElementById('app').getAttribute('data-port');

    this.tick = this.tick.bind(this);
    this.randomize = this.randomize.bind(this);
  }

  componentDidMount() {
    // this.label.innerHTML = `${this.ip}:${this.port} BPM ${this.bpm.toFixed(2)}`;

    this.visual.addEventListener('animationiteration', this.tick);

    // socket.on('bpm', (msg) => {
    //   this.bpm = msg;
    //   this.label.innerHTML = `${this.ip}:${this.port} BPM ${this.bpm.toFixed(2)}`;
    // });
  }

  componentWillUnmount() {
    this.visual.removeEventListener('animationiteration', this.tick);
  }

  tick() {
    this.setState({ index: Math.floor(Math.random() * this.components.length) });
    setTimeout(() => {
      const labelIndex = Math.floor(Math.random() * this.labels.length);
      console.log('rand', labelIndex);
      this.setState({ labelIndex });
    }, 10000);
  }

  randomize(index) {
    return this.components[index];
  }


  render() {
    const { index, visible, labelIndex } = this.state;
    return (
      <div id="Three" className="app__three" onClick={() => { this.setState({ visible: !visible }); }}>
        <div className="app__banner">
          {this.labels[labelIndex]}
        </div>
        <div className="app__visual" ref={(el) => { this.visual = el; }}>
          {
            this.randomize(index)
          }
        </div>
        <span className="app__info" ref={(el) => { this.label = el; }} />
      </div>
    );
  }
}

Three.propTypes = {
};

const mapStateToProps = () => ({
});

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Three));
