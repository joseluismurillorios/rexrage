import React from 'react';
import PropTypes from 'prop-types';

const Clickable = ({
  id,
  className,
  children,
  onClick,
}) => (
  <button
    type="button"
    id={id}
    className={className}
    onClick={onClick}
  >
    {children}
  </button>
);

Clickable.defaultProps = {
  children: '',
  className: '',
  id: '',
};

Clickable.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.element),
  ]),
  onClick: PropTypes.func.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};
export default Clickable;
