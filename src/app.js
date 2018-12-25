import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import store from './core/redux/store';
import Layout from './core/layout';
import Routes from './core/routes';

import helperSwipe from './core/helpers/helper-swipe';

import './core/assets/favicon.ico';
import './core/assets/images/icon-57-2x.png';
import './core/assets/images/icon-57.png';
import './core/assets/images/icon-60-2x.png';
import './core/assets/images/icon-60.png';
import './core/assets/images/icon-72-2x.png';
import './core/assets/images/icon-72.png';
import './core/assets/images/icon-76-2x.png';
import './core/assets/images/icon-76.png';
import './core/assets/images/favicon-16x16.png';
import './core/assets/images/favicon-32x32.png';
import './core/assets/images/favicon-96x96.png';
import './core/assets/images/android-icon-192x192.png';
import './core/assets/images/preview.png';
import './core/assets/images/apple_splash_1242.png';
import './core/assets/images/apple_splash_2048.png';
import './core/assets/images/apple_splash_640.png';
import './core/assets/images/apple_splash_750.png';

import './core/assets/scss/main.scss';

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  document.body.classList.add('isMobile');
}

if ('navigator' in window && window.navigator.standalone) {
  document.body.classList.add('isStandalone');
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
  console.log('Service worker registered');
}

// Add swipe capabillities
helperSwipe(document);

function runApp() {
  const Dom = (
    <Provider store={store}>
      <BrowserRouter>
        <Layout>
          <Routes />
        </Layout>
      </BrowserRouter>
    </Provider>
  );

  ReactDOM.render(
    Dom,
    document.getElementById('Root'),
  );
}

runApp();

// const App = () => <h1>Hello Worlds!</h1>;

// ReactDOM.render(
//   <App />,
//   document.getElementById('root'),
// );
