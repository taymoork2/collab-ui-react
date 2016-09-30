(function () {
  'use strict';

  angular
    .module('Status')
    .controller('ServiceManagementCtrl', ServiceManagementCtrl);

  /* @ngInject */
  function ServiceManagementCtrl(statusService) {
    var vm = this;
    vm.flag = 'good';
    statusService.getServices().then(function (data) {
      vm.services = data;
    });
  }

})();
