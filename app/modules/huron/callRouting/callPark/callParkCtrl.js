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
        vm.showInformation = vm.callParks.length === 0;
        var totalLength = 0;
        for (var i = 0; i < vm.callParks.length; i++) {
          if (angular.isDefined(vm.callParks[i].data) && angular.isArray(vm.callParks[i].data)) {
            totalLength += vm.callParks[i].data.length;
          }
        }
        $rootScope.$broadcast('callrouting-update', {
          state: 'callpark',
          count: totalLength
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
