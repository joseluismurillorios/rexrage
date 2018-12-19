import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { throttle } from '../helpers/helper-util';
import reducers from './reducers';
import { setCache, getCache } from './localStorage';

const REDUX_STATE = 'state';

const persistedState = (getCache(REDUX_STATE) || {});

const store = createStore(
  reducers,
  persistedState,
  applyMiddleware(thunk),
);

store.subscribe(throttle(() => {
  const state = store.getState();
  setCache(REDUX_STATE, state);
}), 2000);

export default store;
