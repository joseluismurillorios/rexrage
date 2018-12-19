import React from 'react';
import PropTypes from 'prop-types';

const Brand = ({ icon }) => (<i className={`app__brand fab fa-${icon}`} />);

Brand.defaultProps = {
  icon: 'js',
};

Brand.propTypes = {
  icon: PropTypes.string,
};

export default Brand;
