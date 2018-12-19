import React from 'react';
import PropTypes from 'prop-types';

import Brand from '../../atoms/brand';

import './style.scss';

const Social = ({ icons }) => (
  <div className="app__social">
    {
      icons.map(icon => (
        <Brand key={icon} icon={icon} />
      ))
    }
  </div>
);

Social.defaultProps = {
  icons: ['js'],
};

Social.propTypes = {
  icons: PropTypes.arrayOf(PropTypes.any),
};

export default Social;
