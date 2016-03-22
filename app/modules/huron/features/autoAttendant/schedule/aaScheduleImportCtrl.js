(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAScheduleImportCtrl', AAScheduleImportCtrl);

  /* @ngInject */
  function AAScheduleImportCtrl($modalInstance, AutoAttendantCeInfoModelService, AutoAttendantCeService, AACalendarService, AAICalService, AAModelService, $translate) {

    var vm = this;
    vm.selectPlaceholder = 'Select Auto Attendant';
    vm.options = [];
    vm.continueImport = continueImport;

    function continueImport() {
      AutoAttendantCeService.readCe(vm.selected.value).then(function (data) {
        if (data.scheduleId) {
          AACalendarService.readCalendar(data.scheduleId).then(function (calendar) {
            var allHours = AAICalService.getHoursRanges(calendar);
            $modalInstance.close(allHours);
          });
        } else {
          $modalInstance.close(undefined);
        }

      });
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      vm.aaModel.aaRecords.forEach(function (value) {
        var obj = {};
        obj.label = value.callExperienceName;
        obj.value = value.callExperienceURL;
        vm.options.push(obj);
      });
    }

    activate();
  }
})();
