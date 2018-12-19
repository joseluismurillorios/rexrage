import React from 'react';
import PropTypes from 'prop-types';

import Input from '../../atoms/input';
import './style.scss';

const Field = ({
  id,
  type,
  value,
  onKeyDown,
  text,
  placeholder,
}) => (
  <label htmlFor={id} className="app__field">
    <span className="app__label">{text}</span>
    <Input
      type={type}
      id={id}
      onKeyDown={onKeyDown}
      defaultValue={value}
      placeholder={placeholder}
    />
  </label>
);

Field.defaultProps = {
  value: '',
  id: '',
  type: 'text',
  text: 'Text',
  placeholder: 'type something',
};

Field.propTypes = {
  value: PropTypes.string,
  onKeyDown: PropTypes.func.isRequired,
  id: PropTypes.string,
  type: PropTypes.string,
  text: PropTypes.string,
  placeholder: PropTypes.string,
};

export default Field;
