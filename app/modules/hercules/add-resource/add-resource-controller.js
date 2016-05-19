(function () {
  'use strict';

  angular
    .module("Hercules")
    .controller("AddResourceController", AddResourceController);


  /* @ngInject */
  function AddResourceController($modalInstance, $window, $translate) {
    var vm = this;
    vm.newHostname = '';
    vm.placeholder = 'Select one or more Expressway clusters…';

    vm.selectedClusters = [];
    vm.expresswayOptions = [{
      'value': 'jeanfric-dummy.rd.cisco.com',
      'label': 'jeanfric-dummy.rd.cisco.com'
    }, {
      'value': 'anaess-dummy.rd.cisco.com',
      'label': 'anaess-dummy.rd.cisco.com'
    }];



    vm.goNext = function() {
      /* */
    }


  }
}());
