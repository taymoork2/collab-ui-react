/* eslint-env es6 */

'use strict';

const _ = require('lodash');

function mkCspConfig(customConfig) {
  const defaultConfig = {
    defaultSrc: [],
    // valid sources for web workers and nested browsing contexts loaded using elements such as <frame> and <iframe>
    frameSrc: [],
    // valid sources for the <object>, <embed>, and <applet> elements
    objectSrc: [],
    // valid URLs which can be loaded using script interfaces (Fetch, XMLHttpRequest, WebSocket, etc.)
    connectSrc: [],
    // valid sources for fonts loaded using @font-face
    fontSrc: [],
    // valid sources of images and favicons
    imgSrc: [],
    // valid sources for sources for JavaScript
    scriptSrc: [],
    // valid sources for sources for stylesheets
    styleSrc: [],
  };

  return _.assignIn({}, defaultConfig, customConfig);
}

module.exports = mkCspConfig;

