(function () {
  'use strict';

  angular
    .module('uc.callpark')
    .controller('CallParkCtrl', CallParkCtrl);

  /* @ngInject */
  function CallParkCtrl($rootScope, CallPark, $modal) {
    var vm = this;
    vm.callParks = [];
    vm.showInformation = true;
    vm.listCallParks = listCallParks;
    vm.addCallPark = addCallPark;
    vm.deleteCallPark = deleteCallPark;
    vm.toggleInformation = toggleInformation;

    listCallParks();

    function listCallParks() {
      CallPark.list().then(function (callParks) {
        vm.callParks = callParks;
        vm.showInformation = vm.callParks.length === 0 ? true : false;
        $rootScope.$broadcast('callrouting-update', {
          state: 'callpark',
          count: vm.callParks.length
        });
      });
    }

    function addCallPark() {
      $modal.open({
        templateUrl: 'modules/huron/callRouting/callPark/callParkDetail.tpl.html',
        controller: 'CallParkDetailCtrl',
        controllerAs: 'cpd'
      }).result.finally(listCallParks);
    }

    function deleteCallPark(callPark) {
      $modal.open({
        templateUrl: 'modules/huron/callRouting/callPark/confirmation-dialog.tpl.html'
      }).result.then(function () {
        CallPark.remove(callPark)
          .finally(listCallParks);
      });
    }

    function toggleInformation() {
      vm.showInformation = !vm.showInformation;
    }
  }
})();
