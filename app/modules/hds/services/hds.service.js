(function () {
  'use strict';

  angular
    .module('HDS')
    .service('HDSService', HDSService);

  /* @ngInject */
  function HDSService($q) {

    var service = {
      getServiceStatus: getServiceStatus
    };

    return service;

    function getServiceStatus() {
      return $q(function (resolve) {
        resolve('2');
      });
    }

  }
}());
