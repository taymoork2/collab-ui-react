(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('AAScheduleModalCtrl', AAScheduleModalCtrl);

  /* @ngInject */
  function AAScheduleModalCtrl($modalInstance, $translate, Notification, AACalendarService, AAModelService, AAUiModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, AAICalService) {
    /*jshint validthis: true */
    var vm = this;

    vm.calendar = null;

    vm.save = save;
    vm.isSavable = isSavable;
    vm.isOpenHoursAfterCloseHours = isOpenHoursAfterCloseHours;
    vm.addRange = addRange;
    vm.deleteRange = deleteRange;
    vm.toggleSection = toggleSection;
    vm.removeHoliday = removeHoliday;
    vm.addHoliday = addHoliday;
    vm.isHolidaysSavable = isHolidaysSavable;
    vm.forceCheckHoliday = forceCheckHoliday;
    vm.changeAllDay = changeAllDay;
    vm.isDeleted = false;
    vm.toggleHolidays = true;
    vm.toggleHours = false;
    vm.holidays = [];
    vm.oneAtATime = true;
    vm.messages = {
      required: $translate.instant('common.invalidRequired'),
      compareTo: $translate.instant('autoAttendant.scheduleClosedTimeCheck')
    };
    vm.monthOptions = AAICalService.getMonths();
    vm.monthPlaceholder = $translate.instant('autoAttendant.every');
    vm.rankOptions = AAICalService.getRanks();
    vm.rankPlaceholder = $translate.instant('autoAttendant.on');
    vm.dayOptions = AAICalService.getDays();
    vm.dayPlaceholder = $translate.instant('autoAttendant.day');
    vm.openhours = [];

    function addRange() {
      vm.openhours.push(angular.copy(AAICalService.getDefaultRange()));
    }

    function deleteRange(index) {
      if (index < vm.openhours.length) {
        vm.openhours.splice(index, 1);
        vm.isDeleted = true;
        vm.hoursForm.$setDirty();
      }
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
        canAdd = isHolidaysSavable();
      } else {
        canAdd = true;
      }
      if (canAdd) {
        vm.holidays.push({
          isOpen: true,
          allDay: true,
          exactDate: true,
          recurAnnually: false,
          month: '',
          rank: '',
          day: '',
          monthError: false,
          rankError: false,
          dayError: false
        });
      } else {
        vm.forceCheckHoliday();
      }
    }

    function forceCheckHoliday() {
      var index = _.findLastIndex(vm.holidays, {
        isOpen: true
      });
      if (index >= 0) {
        if (!isHolidaysSavable()) {
          vm.holidaysForm['holidayForm' + index].holidayName.$setDirty();
          vm.holidaysForm['holidayForm' + index].holidayDate.$setDirty();
          vm.holidaysForm['holidayForm' + index].holidayStart.$setDirty();
          vm.holidaysForm['holidayForm' + index].holidayEnd.$setDirty();
        }
        if (!vm.holidays[index].exactDate) {
          if (vm.holidays[index].month == '') {
            vm.holidaysForm['holidayForm' + index].month.$error.required = true;
          }
          if (vm.holidays[index].rank == '') {
            vm.holidaysForm['holidayForm' + index].rank.$error.required = true;
          }
          if (vm.holidays[index].day == '') {
            vm.holidaysForm['holidayForm' + index].day.$error.required = true;
          }
        }
      }
    }

    function removeHoliday(index) {
      vm.holidays.splice(index, 1);
      vm.isDeleted = true;
      vm.holidaysForm.$setDirty();
    }

    function isOpenHoursAfterCloseHours(hours) {
      if (hours.starttime && hours.endtime) {
        return hours.starttime > hours.endtime;
      }
    }

    function isSavable() {
      return (vm.openhours.length == 0 || isHoursSavable()) && (vm.holidays.length == 0 || isHolidaysSavable());
    }

    function isHolidaysSavable() {
      var flag = false;
      _.each(vm.holidays, function (holiday) {
        flag = false;
        if (holiday.name === undefined || holiday.name == '') {
          return flag;
        }
        if (holiday.exactDate) {
          if (holiday.date === undefined || holiday.date == '') {
            return flag;
          }
        } else {
          if (holiday.month === undefined || holiday.month == '') {
            return flag;
          }
          if (holiday.rank === undefined || holiday.rank == '') {
            return flag;
          }
          if (holiday.day === undefined || holiday.day == '') {
            return flag;
          }
        }
        if (!holiday.allDay && (holiday.starttime === undefined || holiday.endtime === undefined)) {
          return flag;
        }
        flag = true;
      });
      return flag;
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
        vm.forceCheckHoliday();
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
        vm.calendar = getCalendar();
        // save calendar to CES
        var calName = "Calendar for " + vm.aaModel.aaRecord.callExperienceName;
        var savePromise;
        var notifyName = vm.aaModel.aaRecord.callExperienceName;
        if (vm.aaModel.aaRecord.scheduleId) {
          if ((vm.openhours.length > 0) || (vm.holidays.length > 0)) {
            savePromise = AACalendarService.updateCalendar(vm.aaModel.aaRecord.scheduleId, calName, vm.calendar);
            notifyName = calName; // An update is updating only calendar, so notify indicates calender updated
          } else if (vm.isDeleted) {
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
            $modalInstance.close(response);
          },
          function (response) {
            // failure
            if (vm.isDeleted && !vm.openhours.length) {
              //Error deleting calendar or updating CE. Retain the scheduleId.
              vm.aaModel.aaRecord.scheduleId = vm.ui.ceInfo.scheduleId;
              vm.ui.isClosedHours = true;
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
          return updateCE(vm.aaModel.aaRecord.callExperienceName);
        });
    }

    function updateCE(ceName) {
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
          vm.ui.isClosedHours = true;
          vm.aaModel.aaRecord.scheduleId = vm.ui.ceInfo.scheduleId;
        }, function (response) {
          // failure in updating CE with schedue id, so clean up the possible orphaned schedule and theobjects
          Notification.error('autoAttendant.errorUpdateCe', {
            name: ceName,
            statusText: response.statusText,
            status: response.status
          });
          vm.ui.isClosedHours = false;
          vm.aaModel.aaRecord.scheduleId = undefined;
          return AACalendarService.deleteCalendar(vm.ui.ceInfo.scheduleId);
        });
    }

    function deleteSchedule() {
      var id = vm.aaModel.aaRecord.scheduleId;
      var ceName = vm.aaModel.aaRecord.callExperienceName;
      vm.aaModel.aaRecord.scheduleId = undefined;
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
          vm.ui.isClosedHours = false;
          return AACalendarService.deleteCalendar(vm.ui.ceInfo.scheduleId);
        });
    }

    function populateUiModel() {
      if (vm.aaModel.aaRecord.scheduleId) {
        AACalendarService.readCalendar(vm.aaModel.aaRecord.scheduleId).then(function (data) {
          var allHours = AAICalService.getHoursRanges(data);
          vm.openhours = allHours.hours;
          vm.holidays = allHours.holidays;
          _.each(vm.holidays, function (holiday) {
            if (!holiday.exactDate) {
              holiday.month.labelTranslate = $translate.instant(holiday.month.label);
              holiday.rank.labelTranslate = $translate.instant(holiday.rank.label);
              holiday.day.labelTranslate = $translate.instant(holiday.day.label);
            }
          });
        });
      }
      _.each(vm.monthOptions, function (month) {
        month.labelTranslate = $translate.instant(month.label);
      });
      _.each(vm.rankOptions, function (rank) {
        rank.labelTranslate = $translate.instant(rank.label);
      });
      _.each(vm.dayOptions, function (day) {
        day.labelTranslate = $translate.instant(day.label);
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
