(function () {
  'use strict';

  angular.module('Hercules')
    .controller('AddFusionResourceController', AddFusionResourceController);

  /* @ngInject */
  function AddFusionResourceController() {
    var vm = this;

    vm.steps = ['loading', 'type-selector', 'hostname', 'services-selector', 'success'];
    vm.currentStep = 'loading'; // 'type-selector' | 'hostname' | 'services-selector' | 'success' | 'error'

    vm.availableResourceTypes = [];
    vm.selectedResourceType = null;
    vm.availableServices = [];
    vm.selectedServices = {
      call: false,
      calendar: false
    };
    vm.canGoNext = canGoNext;
    vm.goNext = goNext;

    function populateAvailableResourceTypes() {
      //
    }

    function populateAvailableServices() {
      //
    }

    function canGoNext() {
      vm.count++;
    }

    function goNext() {
      vm.loading = true;
    }
  }
})();
