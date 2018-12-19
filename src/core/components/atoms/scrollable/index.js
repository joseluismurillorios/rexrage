import React, { Component } from 'react';
import PropTypes from 'prop-types';

import scrollHelper from '../../../helpers/helper-scrollbar';

class Scrollable extends Component {
  componentDidMount() {
    scrollHelper(this.scrollable, this.inner);
  }

  render() {
    const {
      children,
      className,
      id,
      setRef,
    } = this.props;
    return (
      <div
        id={id}
        className="scrollable"
        ref={(el) => {
          this.scrollable = el;
          setRef(el);
        }}
      >
        <div
          className={className}
          ref={(el) => { this.inner = el; }}
        >
          {children}
        </div>
      </div>
    );
  }
}

Scrollable.defaultProps = {
  className: '',
  id: '',
  setRef: () => {},
};

Scrollable.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.any),
  ]).isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  setRef: PropTypes.func,
};

export default Scrollable;
