(function () {
  'use strict';

  angular
    .module('Core')
    .controller('activateUserController', activateUserController);

  /* @ngInject */
  function activateUserController($location, DigitalRiverService) {

    var vm = this;

    var userId = $location.search().userId;

    DigitalRiverService.activateUser(userId)
      .then(function (result) {

      }, function (result, status) {

      });

  }
})();
