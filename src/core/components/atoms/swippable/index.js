import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Swippable extends Component {
  componentDidMount() {
    const {
      sfc,
      fc,
      swl,
      swr,
      swu,
      swd,
    } = this.props;
    this.swippable.addEventListener('sfc', sfc, false);
    this.swippable.addEventListener('fc', fc, false);
    this.swippable.addEventListener('swl', swl, false);
    this.swippable.addEventListener('swr', swr, false);
    this.swippable.addEventListener('swu', swu, false);
    this.swippable.addEventListener('swd', swd, false);
  }

  render() {
    const { children, className, id } = this.props;
    return (
      <div
        id={id}
        className={`swippable ${className}`}
        ref={(el) => { this.swippable = el; }}
      >
        {children}
      </div>
    );
  }
}

Swippable.defaultProps = {
  className: '',
  id: '',
  sfc: () => {},
  fc: () => {},
  swl: () => {},
  swr: () => {},
  swu: () => {},
  swd: () => {},
};

Swippable.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.any),
  ]).isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  sfc: PropTypes.func,
  fc: PropTypes.func,
  swl: PropTypes.func,
  swr: PropTypes.func,
  swu: PropTypes.func,
  swd: PropTypes.func,
};

export default Swippable;
