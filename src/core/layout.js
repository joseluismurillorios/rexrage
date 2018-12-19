import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import AddHome from './components/molecules/addhome';


const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuOpened: false,
      showInstallMessage: (isIos() && !isInStandaloneMode()),
    };

    this.isStandalone = window.navigator.standalone || !!(window.cordova);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  componentDidMount() {
    if (this.isStandalone) {
      document.body.classList.add('isStandalone');
    }
  }

  toggleMenu() {
    const { menuOpened } = this.state;
    this.setState({ menuOpened });
  }

  render() {
    const { children } = this.props;
    const { showInstallMessage } = this.state;
    return (
      <div id="Layout" className="app__layout fill">
        {
          this.isStandalone && (
            <div className="app__statusbar" />
          )
        }
        {children}
        {
          showInstallMessage && (
            <AddHome id="addhome" onClick={() => this.setState({ showInstallMessage: false })} />
          )
        }
      </div>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.any),
  ]).isRequired,
};

const mapStateToProps = state => ({
  common: state.common,
});

const mapDispatchToProps = {
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Layout));
