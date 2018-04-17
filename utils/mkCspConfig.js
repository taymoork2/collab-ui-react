/* eslint-env es6 */

'use strict';

const _ = require('lodash');

function mkCspConfig(customConfig) {
  const defaultConfig = {
    // valid URLs which can be loaded using script interfaces (Fetch, XMLHttpRequest, WebSocket, etc.)
    connectSrc: [],
    // serves as a fallback for the other CSP fetch directives. For each of the following directives that are absent, the user agent will look for the default-src directive and will use this value for it
    defaultSrc: [],
    // valid sources for fonts loaded using @font-face
    fontSrc: [],
    // valid sources for web workers and nested browsing contexts loaded using elements such as <frame> and <iframe>
    frameSrc: [],
    // valid sources of images and favicons
    imgSrc: [],
    // valid sources for loading media using the <audio> and <video> elements.
    mediaSrc: [],
    // valid sources for sources for JavaScript
    scriptSrc: [],
    // valid sources for sources for stylesheets
    styleSrc: [],
    // valid sources for Worker, SharedWorker, or ServiceWorker scripts.
    workerSrc: [],
  };

  return _.assignIn({}, defaultConfig, customConfig);
}

module.exports = mkCspConfig;

