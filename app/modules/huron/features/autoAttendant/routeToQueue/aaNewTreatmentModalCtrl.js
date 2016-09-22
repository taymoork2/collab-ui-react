(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AANewTreatmentModalCtrl', AANewTreatmentModalCtrl);

  /* @ngInject */
  function AANewTreatmentModalCtrl($translate, $modalInstance) {
    var vm = this;

    vm.cancel = cancel;
    vm.selected = '';
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
    vm.selectPlaceholder = $translate.instant('autoAttendant.selectPlaceHolder');
    vm.destinationOptions = [{
      label: $translate.instant('autoAttendant.destinations.Disconnect')
    }, {
      label: $translate.instant('autoAttendant.destinations.HuntGroup')
    }, {
      label: $translate.instant('autoAttendant.destinations.Queue')
    }, {
      label: $translate.instant('autoAttendant.destinations.User')
    }, {
      label: $translate.instant('autoAttendant.destinations.Voicemail')
    }, {
      label: $translate.instant('autoAttendant.destinations.ExternalPhone')
    }, {
      label: $translate.instant('autoAttendant.destinations.AutoAttendant')
    }];
    vm.destination = vm.destinationOptions[0];

    function cancel() {
      $modalInstance.close();
    }

    function activate() {
      vm.minutes = [];
      _.times(60, function (i) {
        vm.minutes.push({
          index: i,
          label: i + 1
        });
      });
      vm.minute = vm.minutes[15];
    }
    activate();
  }
})();

