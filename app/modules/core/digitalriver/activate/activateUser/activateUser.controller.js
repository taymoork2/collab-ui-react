(function () {
  'use strict';

  angular
    .module('Core')
    .controller('ActivateUserController', ActivateUserController);

  /* @ngInject */
  function ActivateUserController($location, $state, $log, DigitalRiverService) {

    DigitalRiverService.activateUser($location.search().uuid)
      .then(function (result) {
        $state.go('activatedUserSuccessPage');
      })
      .catch(function (error) {
        $log.error(error);
        $state.go('activateUserErrorPage');
      });

  }
})();
