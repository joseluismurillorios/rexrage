import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';

import Templates from '../../templates';
import Corner from '../../molecules/corner';
import Social from '../../molecules/social';

import './style.scss';

const NavBar = ({ opened, toggleNavBar }) => (
  <div className={`app__navbar ${opened ? 'opened' : ''}`}>
    <Corner
      onClick={toggleNavBar}
      opened={opened}
    />
    <CSSTransition
      in={opened}
      timeout={200}
      classNames="fast"
      unmountOnExit
    >
      <div className="app__navigation full">
        {
          Templates.map(page => (
            <NavLink
              key={page.url}
              exact
              to={page.url}
              activeClassName="active"
              onClick={toggleNavBar}
            >
              {page.name}
            </NavLink>
          ))
        }
        <Social icons={['codepen', 'behance', 'github']} />
      </div>
    </CSSTransition>
  </div>
);

NavBar.defaultProps = {
  toggleNavBar: () => {},
  opened: false,
};


NavBar.propTypes = {
  toggleNavBar: PropTypes.func,
  opened: PropTypes.bool,
};

export default NavBar;
