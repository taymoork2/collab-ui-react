'use strict';

angular
  .module('Core')
  .service('WindowLocation', WindowLocation);

/* @ngInject */
function WindowLocation($window) {
  return {
    set: function(url) {
      $window.location.href = url;
    }
  };
}
