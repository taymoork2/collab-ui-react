'use strict';

angular.module('WebExRestApi').service('WebExRestApiService', [
  '$log',
  function (
    $log
  ) {
    this.dummy = function () {
      var result = null;

      return result;
    }; // dummy()
  } //end top level service function
]);
