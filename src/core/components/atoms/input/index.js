import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

const Input = ({
  id,
  type,
  className,
  value,
  onKeyDown,
  placeholder,
}) => (
  <input
    type={type}
    id={id}
    className={`app__input ${className}`}
    onKeyDown={onKeyDown}
    defaultValue={value}
    placeholder={placeholder}
  />
);

Input.defaultProps = {
  value: '',
  className: '',
  id: '',
  type: '',
  placeholder: '',
};

Input.propTypes = {
  value: PropTypes.string,
  onKeyDown: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
};

export default Input;
