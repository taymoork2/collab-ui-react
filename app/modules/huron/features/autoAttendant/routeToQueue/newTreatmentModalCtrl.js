(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('NewTreatmentModalCtrl', NewTreatmentModalCtrl);

  /* @ngInject */
  function NewTreatmentModalCtrl($scope, $translate, $modalInstance) {
    var vm = $scope;

    vm.cancel = cancel;
    vm.destination = '';
    vm.minute = '15';
    vm.selectPlaceholder = $translate.instant('autoAttendant.destinations.Disconnect');
    vm.inputPlaceHolder = $translate.instant('autoAttendant.inputPlaceHolder');
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


    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function activate() {
      vm.minutes = [];
      _.times(60, function (i) {
        vm.minutes.push({
          index: i,
          number: i,
          label: i + 1
        });
      });
    }
    activate();
  }
})();

