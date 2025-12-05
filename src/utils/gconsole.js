// gconsole.js - Styled console logging utility

const styles = {
  'index-page': 'color: white; font-style: bold; background-color: purple; padding: 3px',
  'ws-general': 'color: green; font-style: bold; background-color: darkblue; padding: 2px',
  'ws-closed': 'color: yellow; font-style: italic; background-color: darkred; padding: 2px',
  'ws-open': 'color: white; font-style: bold; background-color: green; padding: 2px',
  'ws-error': 'color: white; font-style: bold; background-color: red; padding: 2px',
  'ws-reconnect': 'color: black; font-style: bold; background-color: orange; padding: 2px',
  'success': 'color: white; background-color: green; padding: 2px',
  'error': 'color: white; background-color: red; padding: 2px',
  'warning': 'color: black; background-color: yellow; padding: 2px',
  'info': 'color: white; background-color: #2196F3; padding: 2px',
  'debug': 'color: white; background-color: #9E9E9E; padding: 2px',
};

export const gconsole = {
  /**
   * Styled console.log
   * @param {string} message - The message to log
   * @param {string} styleId - Optional style identifier (e.g., 'ws-closed')
   */
  log(message, styleId = null) {
    if (styleId && styles[styleId]) {
      console.log(`%c ${message}`, styles[styleId]);
    } else {
      console.log(message);
    }
  },

  /**
   * Styled console.warn
   * @param {string} message - The message to log
   * @param {string} styleId - Optional style identifier
   */
  warn(message, styleId = null) {
    if (styleId && styles[styleId]) {
      console.warn(`%c ${message}`, styles[styleId]);
    } else {
      console.warn(message);
    }
  },

  /**
   * Styled console.error
   * @param {string} message - The message to log
   * @param {string} styleId - Optional style identifier
   */
  error(message, styleId = null) {
    if (styleId && styles[styleId]) {
      console.error(`%c ${message}`, styles[styleId]);
    } else {
      console.error(message);
    }
  },

  /**
   * Styled console.info
   * @param {string} message - The message to log
   * @param {string} styleId - Optional style identifier
   */
  info(message, styleId = null) {
    if (styleId && styles[styleId]) {
      console.info(`%c ${message}`, styles[styleId]);
    } else {
      console.info(message);
    }
  },

  /**
   * Add a custom style at runtime
   * @param {string} id - The style identifier
   * @param {string} css - The CSS style string
   */
  addStyle(id, css) {
    styles[id] = css;
  },

  /**
   * Get all available style IDs
   * @returns {Array<string>} Array of style identifiers
   */
  getAvailableStyles() {
    return Object.keys(styles);
  },
};

export default gconsole;
