import React from 'react';
import PropTypes from 'prop-types';

import Radio from '../../atoms/radio';

import './style.scss';

const Radios = ({
  id,
  name,
  values,
  className,
  text,
  selected,
  onChange,
}) => (
  <div id={id} className={`app__radios ${className}`}>
    {text}
    {
      values.map(
        r => (
          <Radio
            id={r}
            key={r}
            name={name}
            onChange={onChange}
            checked={selected === r}
          />
        ),
      )
    }
  </div>
);

Radios.defaultProps = {
  id: '',
  className: '',
  text: '',
  selected: '',
  name: 'radios',
  values: ['r1', 'r2', 'r3'],
  onChange: () => {},
};

Radios.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  text: PropTypes.string,
  name: PropTypes.string,
  selected: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  values: PropTypes.arrayOf(PropTypes.any),
  onChange: PropTypes.func,
};

export default Radios;
