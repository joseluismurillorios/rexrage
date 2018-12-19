import React from 'react';
import PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { toggleNavBar } from './redux/actions/common';

import Templates from './components/templates';

const Routes = ({ history }) => {
  const { location } = history;
  const currentKey = location.pathname.split('/')[1] || '/';
  const timeout = { enter: 1000, exit: 1000 };
  return (
    <section id="Router" className="app__router fill">
      <TransitionGroup id="Transition" className="app__group fill">
        <CSSTransition key={currentKey} timeout={timeout} classNames="fade" appear>
          <Switch location={location}>
            {
              Templates.map(obj => (
                <Route key={obj.url} path={obj.url} exact component={obj.component} />
              ))
            }
            <Route path="*" component={Templates[0].component} />
          </Switch>
        </CSSTransition>
      </TransitionGroup>
    </section>
  );
};

Routes.propTypes = {
  history: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.any),
  ]).isRequired,
};


const mapStateToProps = state => ({
  location: state.location,
  common: state.common,
});

const mapDispatchToProps = {
  navbarToggle: toggleNavBar,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Routes));
