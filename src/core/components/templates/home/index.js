import React, { Component } from 'react';
import Game from '../../../game';

class Home extends Component {
  componentDidMount() {
    Game(this.container);
  }

  render() {
    return (
      <div ref={(el) => { this.container = el; }} />
    );
  }
}

export default Home;
