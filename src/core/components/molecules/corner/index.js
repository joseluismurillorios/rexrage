import React from 'react';
import PropTypes from 'prop-types';

import Clickable from '../../atoms/clickable';

import './style.scss';

const Corner = ({ onClick, opened }) => (
  <Clickable
    className="app__corner"
    onClick={onClick}
  >
    <div className={`burger ${opened ? 'opened' : ''}`}>
      <div className="white-bar" />
      <div className="white-bar" />
      <div className="white-bar" />
      <div className="white-bar" />
    </div>
  </Clickable>
);

Corner.defaultProps = {
  onClick: () => {},
  opened: true,
};


Corner.propTypes = {
  onClick: PropTypes.func,
  opened: PropTypes.bool,
};

export default Corner;
