'use strict';

/* global window, navigator */

var supportedIE = 11;
var ieRegex = /msie/i;
var ieVersionRegex = /(?:msie |rv:)(\d+(\.\d+)?)/i;
var getVersion = function (userAgent) {
  var version = userAgent.match(ieVersionRegex);
  return (version && version.length > 1) ? version[1] : '';
};

var isSupported = function () {
  if (typeof navigator !== 'undefined' && ieRegex.test(navigator.userAgent) && getVersion(navigator.userAgent) < supportedIE) {
    return false;
  }
  return true;
};

if (!isSupported()) {
  window.location = 'unsupported.html';
}
