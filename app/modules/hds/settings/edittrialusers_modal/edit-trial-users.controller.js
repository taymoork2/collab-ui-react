(function () {
  'use strict';

  angular
    .module('HDS')
    .controller('EditTrialUsersController', EditTrialUsersController);

  /* @ngInject */
  function EditTrialUsersController() {
    var vm = this;
    vm.hasTrialUsers = false;
  }

})();
