import React, { Component } from 'react';
import Game from '../../../helpers/helper-game';

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
