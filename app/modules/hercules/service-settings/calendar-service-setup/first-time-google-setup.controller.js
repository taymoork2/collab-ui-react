(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('FirstTimeGoogleSetupController', FirstTimeGoogleSetupController);

  /* @ngInject */
  function FirstTimeGoogleSetupController($modalInstance) {
    var vm = this;

    vm.cancel = function () {
      $modalInstance.dismiss();
    };

    vm.proceed = function () {
      $modalInstance.close();
    };

  }

}());
