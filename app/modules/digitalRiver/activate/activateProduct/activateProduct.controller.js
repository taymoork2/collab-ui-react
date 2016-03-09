(function () {
  'use strict';

  angular
    .module('Core')
    .controller('ActivateProductController', ActivateProductController);

  /* @ngInject */
  function ActivateProductController($location, $state, $log, DigitalRiverService) {

    DigitalRiverService.activateProduct($location.search().oid)
      .then(function () {
        $state.go('activateProduct.successPage');
      })
      .catch(function (error) {
        $log.error(error);
        $state.go('activateProduct.errorPage');
      });

  }
})();
