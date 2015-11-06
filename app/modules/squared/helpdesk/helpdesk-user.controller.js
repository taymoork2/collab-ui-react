(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskUserController($stateParams) {
    var vm = this;
    vm.user = $stateParams.user;
  }

  angular
    .module('Squared')
    .controller('HelpdeskUserController', HelpdeskUserController);
}());
