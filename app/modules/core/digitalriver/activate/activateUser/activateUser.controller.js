(function () {
  'use strict';

  angular
    .module('Core')
    .controller('activateUserController', activateUserController);

  /* @ngInject */
  function activateUserController($location, $window, $log, DigitalRiverService) {

    var vm = this;

    DigitalRiverService.activateUser('123')
      .then(function (result) {
          if (_.get(result, 'data.success', false) === true) {
            $window.location.href = "/#/activated-user-landing-page";
          } else {
            $log.error(result);
            $window.location.href = "/#/activate-user-error-page";
          }
        },
        function (result, status) {
          $log.error(result);
          $log.error(status);
          $window.location.href = "/#/activate-user-error-page";
        });

  }
})();
