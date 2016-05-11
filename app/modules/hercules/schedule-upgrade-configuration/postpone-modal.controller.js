(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('PostponeModalController', PostponeModalController);

  /* @ngInject */
  function PostponeModalController($modalInstance, ScheduleUpgradeService, Authinfo, data, nextUpdate, connectorType) {
    var vm = this;
    vm.data = data;
    vm.nextUpdate = nextUpdate;
    vm.postpone = postpone;
    vm.errorMessage = '';
    vm.state = 'idle'; // 'sending' | 'error';

    function postpone() {
      vm.state = 'sending';
      ScheduleUpgradeService.patch(Authinfo.getOrgId(), connectorType, {
          postponed: true
        })
        .then(function (data) {
          vm.state = 'idle';
          $modalInstance.close(data);
        }, function (error) {
          vm.errorMessage = error.message;
          vm.state = 'error';
        });
    }
  }
}());
