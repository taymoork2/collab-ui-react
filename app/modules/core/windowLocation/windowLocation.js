(function () {
  'use strict';

  module.exports = angular
    .module('core.windowlocation', [])
    .service('WindowLocation', WindowLocation)
    .name;

  /* @ngInject */
  function WindowLocation($window) {
    return {
      set: function (url) {
        $window.location.href = url;
      }
    };
  }
})();
