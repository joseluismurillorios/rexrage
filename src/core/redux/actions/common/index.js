import {
  TOGGLE_NAV,
  TOGGLE_THEME,
} from './constants';

export const toggleNavBar = payload => ({
  type: TOGGLE_NAV,
  payload,
});

export const toggleTheme = payload => ({
  type: TOGGLE_THEME,
  payload,
});
