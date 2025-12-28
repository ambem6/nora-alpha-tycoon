import { createGlobalStyle } from 'styled-components';
import { THEME } from '../config/theme';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    font-family: ${THEME.typography.fontFamily};
    background-color: ${THEME.colors.background};
    color: ${THEME.colors.text.main};
    overflow: hidden;
    height: 100vh;
    width: 100vw;
  }

  #root { height: 100%; width: 100%; }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: ${THEME.colors.surface}; }
  ::-webkit-scrollbar-thumb { background: ${THEME.colors.border}; border-radius: 4px; }

  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none; margin: 0;
  }`;
