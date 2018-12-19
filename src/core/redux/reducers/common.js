import {
  TOGGLE_NAV,
} from '../actions/common/constants';

const defaultState = {
  theme: true,
  navbar: false,
};

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case TOGGLE_NAV: {
      console.log('eee');
      return {
        ...state,
        navbar: !state.navbar,
      };
    }

    default: {
      return state;
    }
  }
};

export default reducer;
