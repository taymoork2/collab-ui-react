(function () {
  'use strict';

  module.exports = WindowLocation;

  /* @ngInject */
  function WindowLocation($window) {
    return {
      set: function (url) {
        $window.location.href = url;
      }
    };
  }
})();
