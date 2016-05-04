(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderContainerCtrl', AABuilderContainerCtrl);

  /* @ngInject */
  function AABuilderContainerCtrl($scope, $modal, AAUiModelService, AAModelService, AAValidationService, Config) {

    var vm = this;
    vm.aaModel = {};
    vm.ui = {};

    vm.getScheduleTitle = getScheduleTitle;
    vm.openScheduleModal = openScheduleModal;
    vm.isScheduleAvailable = isScheduleAvailable;

    function isScheduleAvailable() {
      return (Config.isDev() || Config.isIntegration());
    }

    function openScheduleModal() {
      if (!AAValidationService.isPhoneMenuValidationSuccess(vm.ui)) {
        return;
      }

      var modalInstance = $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/schedule/aaScheduleModal.tpl.html',
        controller: 'AAScheduleModalCtrl',
        controllerAs: 'aaScheduleModalCtrl',
        size: 'lg'
      });

      modalInstance.result.then(function (result) {
        // Put anything needed after the modal is finished here
        vm.aaModel = AAModelService.getAAModel();
        vm.ui = AAUiModelService.getUiModel();
        $scope.$broadcast('ScheduleChanged');
      });
    }
    /////////////////////

    function getScheduleTitle() {
      if (!vm.ui.isClosedHours && !vm.ui.isHolidays) {
        return "autoAttendant.scheduleAllDay";
      }

      return "autoAttendant.schedule";
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = AAUiModelService.getUiModel();
    }

    activate();
  }
})();
