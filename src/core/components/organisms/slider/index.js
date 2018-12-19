import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

import { throttle } from '../../../helpers/helper-util';

import Swippable from '../../atoms/swippable';
import Radios from '../../molecules/radios';

import './style.scss';

class Slider extends Component {
  constructor(props) {
    super(props);
    const { children } = this.props;

    this.state = {
      index: 0,
      max: children.length - 1,
    };

    this.index = 0;

    this.swl = this.swl.bind(this);
    this.swr = this.swr.bind(this);
    this.goTo = this.goTo.bind(this);
    this.debouncedSet = throttle(this.debouncedSet.bind(this), 500);
  }

  swr() {
    const { max } = this.state;
    this.index = this.index < 1 ? max : this.index - 1;
    this.debouncedSet(this.index);
  }

  swl() {
    const { max } = this.state;
    this.index = this.index === max ? 0 : this.index + 1;
    this.debouncedSet(this.index);
  }

  goTo(e) {
    this.index = parseInt(e.target.id, 10);
    this.debouncedSet(this.index);
  }

  debouncedSet() {
    this.setState({ index: this.index });
  }

  render() {
    const { children } = this.props;
    const { index } = this.state;
    console.log(index);
    return (
      <Swippable swl={this.swl} swr={this.swr} className="app__slider">
        <Radios
          values={Object.keys(children)}
          selected={index.toString()}
          onChange={e => this.goTo(e)}
        />
        {React.Children.map(children, (child, i) => (
          <CSSTransition
            in={i === index}
            key={i}
            timeout={500}
            classNames="slow"
            unmountOnExit
          >
            {
              React.cloneElement(child, {
                key: i,
                style: { float: 'left' },
                onClick: this.onClick,
              })
            }
          </CSSTransition>
        ))}
      </Swippable>
    );
  }
}

Slider.defaultProps = {
};

Slider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
};

export default Slider;
