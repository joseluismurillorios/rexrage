import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

const Button = ({
  id,
  className,
  children,
  onClick,
}) => (
  <button
    type="button"
    id={id}
    className={`app__button ${className}`}
    onClick={(e) => {
      e.currentTarget.focus();
      onClick(e);
    }}
  >
    {children}
  </button>
);

Button.defaultProps = {
  className: '',
  id: '',
};

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  onClick: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default Button;
