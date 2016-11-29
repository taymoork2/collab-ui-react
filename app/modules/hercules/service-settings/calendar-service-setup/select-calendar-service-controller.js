(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('SelectCalendarServiceController', SelectCalendarServiceController);

  /* @ngInject */
  function SelectCalendarServiceController($modalInstance) {
    var vm = this;
    vm.selected = undefined;

    vm.proceed = function () {
      $modalInstance.close(vm.selected);
    };

  }

}());
