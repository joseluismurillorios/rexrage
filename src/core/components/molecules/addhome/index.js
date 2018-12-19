import React from 'react';
import PropTypes from 'prop-types';

import Clickable from '../../atoms/clickable';
// import share from '../../../assets/svg/share.svg';
// import home from '../../../assets/svg/home.svg';

import SVGHome from './svgHome';
import SVGShare from './svgShare';

import './style.scss';

const AddHome = ({ id, onClick }) => (
  <Clickable id={id} onClick={onClick} className="addhome">
    <div className="addhome__close-icon">&times;</div>
    <h4>Install Web App</h4>
    <p>
      Tap
      <SVGShare />
      and then
      <SVGHome />
      for offline mode!
    </p>
  </Clickable>
);

AddHome.defaultProps = {
  id: '',
};

AddHome.propTypes = {
  onClick: PropTypes.func.isRequired,
  id: PropTypes.string,
};

export default AddHome;
