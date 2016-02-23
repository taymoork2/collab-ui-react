(function () {
  'use strict';

  angular
    .module('Core')
    .controller('ActivateProductController', ActivateProductController);

  /* @ngInject */
  function ActivateProductController($location, $state, $log, DigitalRiverService) {

    DigitalRiverService.activateProduct($location.search().oid)
      .then(function () {
        $state.go('activatedProductSuccessPage');
      })
      .catch(function (error) {
        $log.error(error);
        $state.go('activateProductErrorPage');
      });

  }
})();
