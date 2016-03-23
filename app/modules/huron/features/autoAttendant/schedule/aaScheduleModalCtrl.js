(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('AAScheduleModalCtrl', AAScheduleModalCtrl);

  /* @ngInject */

  function AAScheduleModalCtrl($modal, $modalInstance, $translate, Notification, AACalendarService, AAModelService, AAUiModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, AAICalService, AACommonService) {
    /*jshint validthis: true */
    var vm = this;

    vm.calendar = null;

    vm.save = save;
    vm.isSavable = isSavable;
    vm.isHoursSavable = isHoursSavable;
    vm.isOpenHoursAfterCloseHours = isOpenHoursAfterCloseHours;
    vm.addRange = addRange;
    vm.deleteRange = deleteRange;
    vm.toggleSection = toggleSection;
    vm.removeHoliday = removeHoliday;
    vm.addHoliday = addHoliday;
    vm.isDeleted = false;
    vm.toggleHolidays = true;
    vm.toggleHours = false;
    vm.holidays = [];
    vm.oneAtATime = true;
    vm.isDisabled = isDisabled;
    vm.changeAllDay = changeAllDay;
    vm.openImportModal = openImportModal;
    vm.messages = {
      required: $translate.instant('common.invalidRequired'),
      compareTo: $translate.instant('autoAttendant.scheduleClosedTimeCheck')
    };

    vm.openhours = [];
    vm.getCalendar = getCalendar;

    function addRange() {
      vm.openhours.push(angular.copy(AAICalService.getDefaultRange()));
    }

    function deleteRange(index) {
      vm.openhours.splice(index, 1);
      vm.isDeleted = true;
      vm.hoursForm.$setDirty();
    }

    function changeAllDay(form) {
      if (!form.holidayStart.$viewValue || !form.holidayEnd.$viewValue) {
        form.holidayStart.$setPristine();
        form.holidayEnd.$setPristine();
      }
    }

    function addHoliday() {
      var canAdd = false;
      if (vm.holidays.length > 0) {
        canAdd = !vm.holidaysForm.$invalid;
      } else {
        canAdd = true;
      }
      if (canAdd) {
        vm.holidays.push({
          isOpen: true,
          allDay: true
        });
      } else {
        forceCheckHoliday();
      }
    }

    function forceCheckHoliday() {
      var index = _.findLastIndex(vm.holidays, {
        isOpen: true
      });
      if (vm.holidaysForm.$invalid && index !== -1) {
        index = 'holidayForm' + index;
        vm.holidaysForm[index].holidayName.$setDirty();
        vm.holidaysForm[index].holidayDate.$setDirty();
        vm.holidaysForm[index].holidayStart.$setDirty();
        vm.holidaysForm[index].holidayEnd.$setDirty();
      }
    }

    function removeHoliday(index) {
      vm.holidays.splice(index, 1);
      vm.holidaysForm.$setDirty();
    }

    function isDisabled() {
      return vm.holidaysForm.$invalid;
    }

    vm.openSection = function () {
      forceCheckHoliday();
    };

    function isOpenHoursAfterCloseHours(hours) {
      if (hours.starttime && hours.endtime) {
        if (hours.starttime <= hours.endtime) {
          return false;
        }
        return true;
      }
    }

    function isSavable() {
      if (isHoursSavable()) {
        return vm.holidaysForm.$valid;
      } else if (!vm.openhours.length) {
        return vm.holidaysForm.$valid;
      }
    }

    function isHoursSavable() {
      var flag = false;
      _.each(vm.openhours, function (hours) {
        flag = false; //Verify each OpenHour(time and days) is valid to enable save
        if (isOpenHoursAfterCloseHours(hours)) {
          return flag;
        }
        if (hours.starttime && hours.endtime) {
          _.each(hours.days, function (day) {
            if (day.active) {
              //Verify at least a day has been set for each open hours in the schedule.
              flag = true;
            }
          });
        }
        if (!flag) {
          // Disable save if any of the open hours schedule has none of the days selected.
          return flag;
        }
      });
      if (vm.isDeleted && !vm.openhours.length && vm.aaModel.aaRecord.scheduleId) {
        //when all open hours deleted, enable save
        //when all open hours deleted before the calendar is created, disable save
        flag = true;
      }
      return flag;
    }

    function toggleSection(section) {
      if (vm.isSavable()) {
        if (section === 'hours') {
          vm.toggleHolidays = true;
          vm.toggleHours = !vm.toggleHours;
        } else {
          vm.toggleHours = true;
          vm.toggleHolidays = !vm.toggleHolidays;
        }
      } else {
        forceCheckHoliday();
      }
    }

    function getCalendar() {
      vm.calendar = AAICalService.createCalendar();
      _.each(vm.openhours, function (hours) {
        AAICalService.addHoursRange('open', vm.calendar, hours);
      });
      _.each(vm.holidays, function (holiday) {
        AAICalService.addHoursRange('holiday', vm.calendar, holiday);
      });
      return vm.calendar.toString();
    }

    function save() {
      if (vm.isSavable()) {
        // create calendar
        // even on update we are just re-creating the calendar, otherwise the events accumulate
        vm.calendar = vm.getCalendar();

        // save calendar to CES
        var calName = vm.aaModel.aaRecord.callExperienceName;
        var savePromise;
        var notifyName = "Calendar for " + vm.aaModel.aaRecord.callExperienceName;

        vm.ui.isHolidays = (vm.holidays.length) ? true : false;
        vm.ui.isClosedHours = (vm.openhours.length) ? true : false;

        if (vm.aaModel.aaRecord.scheduleId) {
          if ((vm.openhours.length > 0) || (vm.holidays.length > 0)) {
            savePromise = updateSchedule(calName);
            notifyName = calName; // An update is updating only calendar, so notify indicates calender updated
          } else if (vm.isDeleted || !vm.holidays.length) {
            vm.isDeleted = true;
            savePromise = deleteSchedule();
          }
        } else {
          savePromise = createSchedule(calName);
        }

        savePromise.then(
          function (response) {
            if (angular.isUndefined(vm.aaModel.aaRecord.scheduleId) && !vm.isDeleted) {
              //To avoid notification when a CE update fails during calendar creation, 
              //and the newly created orphaned calendar is deleted.
              return;
            }
            Notification.success('autoAttendant.successUpdateCe', {
              name: notifyName
            });
            vm.isDeleted = false;
            vm.ui.isHolidays = (vm.holidays.length) ? true : false;
            vm.ui.isClosedHours = (vm.openhours.length) ? true : false;
            $modalInstance.close(response);
          },
          function (response) {
            // failure
            if (vm.isDeleted && !vm.openhours.length && !vm.holidays.length) {
              //Error deleting calendar or updating CE. Retain the scheduleId.
              vm.aaModel.aaRecord.scheduleId = vm.ui.ceInfo.scheduleId;
              vm.isDeleted = false;
              Notification.error('autoAttendant.errorDeleteCe', {
                name: calName,
                statusText: response.statusText,
                status: response.status
              });
            } else if (angular.isUndefined(vm.aaModel.aaRecord.scheduleId)) {
              //Calendar create failed
              Notification.error('autoAttendant.errorCreateCe', {
                name: calName,
                statusText: response.statusText,
                status: response.status
              });
            } else {
              Notification.error('autoAttendant.errorUpdateCe', {
                name: notifyName,
                statusText: response.statusText,
                status: response.status
              });
            }
          });
      }
    }

    function createSchedule(calName) {
      var ceName = vm.aaModel.aaRecord.callExperienceName;
      return AACalendarService.createCalendar(calName, vm.calendar).then(
        function (response) {
          // success
          var scheduleId = AutoAttendantCeInfoModelService.extractUUID(response.scheduleUrl);
          vm.aaModel.aaRecord.scheduleId = scheduleId;
          vm.ui.ceInfo.scheduleId = scheduleId;
          return updateCE(vm.aaModel.aaRecord.callExperienceName, true);
        });
    }

    function updateCE(ceName, isNew) {
      var ceUrl;
      AACommonService.saveUiModel(vm.ui, vm.aaModel.aaRecord);

      if (vm.aaModel.aaRecordUUID.length > 0) {
        _.each(vm.aaModel.aaRecords, function (aarecord) {
          if (AutoAttendantCeInfoModelService.extractUUID(aarecord.callExperienceURL) === vm.aaModel.aaRecordUUID) {
            ceUrl = aarecord.callExperienceURL;
            return ceUrl;
          }
        });
      }
      return AutoAttendantCeService.updateCe(ceUrl, vm.aaModel.aaRecord)
        .then(function (response) {
          vm.aaModel.aaRecord.scheduleId = vm.ui.ceInfo.scheduleId;
        }, function (response) {
          // failure in updating CE with schedue id, so clean up the possible orphaned schedule and the objects
          Notification.error('autoAttendant.errorUpdateCe', {
            name: ceName,
            statusText: response.statusText,
            status: response.status
          });
          vm.aaModel.aaRecord.scheduleId = undefined;
          if (isNew) {
            return AACalendarService.deleteCalendar(vm.ui.ceInfo.scheduleId);
          } else {
            return;
          }

        });
    }

    function deleteSchedule() {
      var id = vm.aaModel.aaRecord.scheduleId;
      var ceName = vm.aaModel.aaRecord.callExperienceName;
      vm.aaModel.aaRecord.scheduleId = undefined;
      AACommonService.saveUiModel(vm.ui, vm.aaModel.aaRecord);
      var ceUrl;
      if (vm.aaModel.aaRecordUUID.length > 0) {
        _.each(vm.aaModel.aaRecords, function (aarecord) {
          if (AutoAttendantCeInfoModelService.extractUUID(aarecord.callExperienceURL) === vm.aaModel.aaRecordUUID) {
            ceUrl = aarecord.callExperienceURL;
            return ceUrl;
          }
        });
      }
      return AutoAttendantCeService.updateCe(ceUrl, vm.aaModel.aaRecord)
        .then(function (response) {
          // success removing ScheduleId from CE, delete the calendar 
          return AACalendarService.deleteCalendar(vm.ui.ceInfo.scheduleId);
        });
    }

    function updateSchedule(calName) {

      return AACalendarService.updateCalendar(vm.aaModel.aaRecord.scheduleId, calName, vm.calendar)
        .then(function (response) {
          return updateCE(vm.aaModel.aaRecord.callExperienceName, false);
        });
    }

    function populateUiModel() {
      if (vm.aaModel.aaRecord.scheduleId) {
        AACalendarService.readCalendar(vm.aaModel.aaRecord.scheduleId).then(function (data) {
          var allHours = AAICalService.getHoursRanges(data);
          vm.openhours = allHours.hours;
          vm.holidays = allHours.holidays;
        });
      }
    }

    function openImportModal() {
      var importModal = $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/schedule/importSchedule.tpl.html',
        type: 'dialog',
        controller: 'AAScheduleImportCtrl',
        controllerAs: 'import'
      });
      importModal.result.then(function (allHours) {
        Notification.success('autoAttendant.successImport', {
          holidays: allHours.holidays.length,
          hours: allHours.hours.length
        });
        if (allHours) {
          allHours.hours.forEach(function (value) {
            vm.openhours.unshift(value);
          });
          allHours.holidays.forEach(function (value) {
            vm.holidays.unshift(value);
          });
          vm.holidaysForm.$setDirty();
        }
      });
    }

    function activate() {
      vm.aaModel = AAModelService.getAAModel();
      vm.ui = AAUiModelService.getUiModel();
      populateUiModel();
      vm.isDeleted = false;
    }

    activate();
  }
})();
