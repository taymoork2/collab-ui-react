(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('ActivateUserController', ActivateUserController);

  /* @ngInject */
  function ActivateUserController($location, $state, $log, DigitalRiverService) {

    DigitalRiverService.activateUser($location.search().uuid)
      .then(function () {
        $state.go('activateUser.successPage');
      })
      .catch(function (error) {
        $log.error(error);
        $state.go('activateUser.errorPage');
      });

  }
})();
