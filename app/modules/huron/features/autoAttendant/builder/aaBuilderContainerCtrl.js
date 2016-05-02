(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderContainerCtrl', AABuilderContainerCtrl);

  /* @ngInject */
  function AABuilderContainerCtrl($scope, $stateParams, $modal, AutoAttendantCeInfoModelService,
    AutoAttendantCeMenuModelService, AutoAttendantCeService, AAUiModelService, AAModelService, Config) {

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
        setUpStyle();
      });
    }
    /////////////////////

    function getScheduleTitle() {
      if (!vm.ui.isClosedHours && !vm.ui.isHolidays) {
        return "autoAttendant.scheduleAllDay";
      }

      return "autoAttendant.schedule";
    }

    function setUpStyle() {
      if(vm.ui.isClosedHours && vm.ui.isHolidays && vm.ui.holidaysValue !== 'closedHours') {
        vm.laneStyle = 'aa-3-lanes';
        vm.lanesWrapperStyle = 'aa-3-lanes-wrapper';
        vm.generalStyle = 'aa-general-3-lanes';
        vm.holidaysLane = true;
        vm.closedLane = true;
      } else if (vm.ui.isClosedHours) {
        vm.laneStyle = 'aa-2-lanes';
        vm.lanesWrapperStyle = 'aa-2-lanes-wrapper';
        vm.generalStyle = 'aa-general-2-lanes';
        vm.holidaysLane = false;
        vm.closedLane = true;
      } else if (vm.ui.isHolidays) {
        vm.laneStyle = 'aa-2-lanes';
        vm.lanesWrapperStyle = 'aa-2-lanes-wrapper';
        vm.generalStyle = 'aa-general-2-lanes';
        vm.holidaysLane = true;
        vm.closedLane = false;
      } else {
        vm.laneStyle = 'aa-1-lane';
        vm.lanesWrapperStyle = 'aa-1-lane-wrapper';
        vm.generalStyle = 'aa-general-1-lane';
        vm.holidaysLane = false;
        vm.closedLane = false;
      }
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = AAUiModelService.getUiModel();
      setUpStyle();
    }

    activate();
  }
})();
