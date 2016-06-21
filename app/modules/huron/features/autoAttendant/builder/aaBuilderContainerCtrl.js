(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderContainerCtrl', AABuilderContainerCtrl);

  /* @ngInject */
  function AABuilderContainerCtrl($scope, $modal, AAUiModelService, AAModelService, AAValidationService, AAScrollBar) {

    var vm = this;
    vm.aaModel = {};
    vm.ui = {};

    vm.getScheduleTitle = getScheduleTitle;
    vm.openScheduleModal = openScheduleModal;

    function openScheduleModal(sectionToToggle) {
      if (!AAValidationService.isRouteToValidationSuccess(vm.ui)) {
        return;
      }

      var modalInstance = $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/schedule/aaScheduleModal.tpl.html',
        controller: 'AAScheduleModalCtrl',
        controllerAs: 'aaScheduleModalCtrl',
        size: 'lg',
        resolve: {
          sectionToToggle: function () {
            return sectionToToggle;
          }
        },
        modalClass: 'aa-schedule'
      });

      modalInstance.result.then(function (result) {
        // Put anything needed after the modal is finished here
        vm.aaModel = AAModelService.getAAModel();
        vm.ui = AAUiModelService.getUiModel();
        $scope.$broadcast('ScheduleChanged');
        setUpStyle();
        AAScrollBar.resizeBuilderScrollBar(AAScrollBar.delay.SHORT); // delay for transitions to finish
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
      if (vm.ui.isClosedHours && vm.ui.isHolidays && vm.ui.holidaysValue !== 'closedHours') {
        vm.generalStyle = '';
        vm.holidaysLane = true;
        vm.closedLane = true;
        vm.threeLanes = true;
      } else if (vm.ui.isClosedHours) {
        vm.generalStyle = 'aa-general-2-lanes';
        vm.holidaysLane = false;
        vm.closedLane = true;
        vm.threeLanes = false;
      } else if (vm.ui.isHolidays) {
        vm.generalStyle = 'aa-general-2-lanes';
        vm.holidaysLane = true;
        vm.closedLane = false;
        vm.threeLanes = false;
      } else {
        vm.generalStyle = '';
        vm.holidaysLane = false;
        vm.closedLane = false;
        vm.threeLanes = false;
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
