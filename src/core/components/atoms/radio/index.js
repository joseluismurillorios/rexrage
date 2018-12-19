import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

const Radio = ({
  id,
  className,
  checked,
  text,
  name,
  onChange,
}) => (
  <label htmlFor={id} className={`app__radio ${className} ${checked ? 'checked' : ''}`}>
    <input type="radio" name={name} id={id} className="hidden" checked={checked} onChange={onChange} />
    <span className="app__radio-label" />
    {text}
  </label>
);

Radio.defaultProps = {
  className: '',
  text: '',
  name: 'radios',
  checked: false,
  onChange: () => {},
};

Radio.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
  text: PropTypes.string,
  name: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};

export default Radio;
