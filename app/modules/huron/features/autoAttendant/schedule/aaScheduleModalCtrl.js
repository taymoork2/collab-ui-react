(function () {
  'use strict';

  angular
    .module('Huron')
    .controller('AAScheduleModalCtrl', AAScheduleModalCtrl);

  /* @ngInject */

  function AAScheduleModalCtrl($modal, $modalInstance, $translate, AANotificationService, AACalendarService, AAModelService, AAUiModelService, AutoAttendantCeService, AutoAttendantCeInfoModelService, AAICalService, AACommonService) {
    /*jshint validthis: true */
    var vm = this;

    vm.calendar = null;

    vm.save = save;
    vm.isSavable = isSavable;
    vm.isOpenHoursAfterCloseHours = isOpenHoursAfterCloseHours;
    vm.forceStartBeforeEndCheck = forceStartBeforeEndCheck;
    vm.addRange = addRange;
    vm.deleteRange = deleteRange;
    vm.toggleSection = toggleSection;
    vm.removeHoliday = removeHoliday;
    vm.addHoliday = addHoliday;
    vm.isHolidaysSavable = isHolidaysSavable;
    vm.exactDateChanged = exactDateChanged;
    vm.forceCheckHoliday = forceCheckHoliday;
    vm.changeAllDay = changeAllDay;
    vm.openImportModal = openImportModal;
    vm.changeBehaviour = changeBehaviour;
    vm.isDeleted = false;
    vm.toggleHolidays = true;
    vm.toggleHours = false;
    vm.holidays = [];
    vm.holidayBehavior = false;
    vm.oneAtATime = true;
    vm.messages = {
      required: $translate.instant('common.invalidRequired'),
      compareTo: $translate.instant('autoAttendant.holidayScheduleEndTimeCheck')
    };
    vm.monthOptions = [];
    vm.dayOptions = [];
    vm.rankOptions = [];
    vm.monthPlaceholder = $translate.instant('autoAttendant.every');
    vm.rankPlaceholder = $translate.instant('autoAttendant.on');
    vm.dayPlaceholder = $translate.instant('autoAttendant.day');
    vm.openhours = [];

    function addRange() {
      var openhour = AAICalService.getDefaultRange();
      _.each(openhour.days, function (day) {
        day.label = moment.weekdays(day.index);
      });
      vm.openhours.push(angular.copy(openhour));
    }

    function deleteRange(index) {
      if (index < vm.openhours.length) {
        vm.openhours.splice(index, 1);
        vm.isDeleted = true;
        resetHolidayBehavior();
        vm.hoursForm.$setDirty();
      }
    }

    function resetHolidayBehavior() {
      if (vm.holidays.length === 0) {
        vm.holidayBehavior = false;
      }
    }

    function changeBehaviour() {
      vm.holidaysForm.$setDirty();
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
        var indexForm = 'holidayForm' + index;
        if (!isHolidaysSavable()) {
          vm.holidaysForm[indexForm].holidayName.$setDirty();
          vm.holidaysForm[indexForm].holidayDate.$setDirty();
          vm.holidaysForm[indexForm].holidayStart.$setDirty();
          vm.holidaysForm[indexForm].holidayEnd.$setDirty();
        }
        if (!vm.holidays[index].exactDate) {
          if (vm.holidays[index].month == '') {
            vm.holidaysForm[indexForm].month.$error.required = true;
          }
          if (vm.holidays[index].rank == '') {
            vm.holidaysForm[indexForm].rank.$error.required = true;
          }
          if (vm.holidays[index].day == '') {
            vm.holidaysForm[indexForm].day.$error.required = true;
          }
        }
      }
    }

    function removeHoliday(index) {
      vm.holidays.splice(index, 1);
      vm.isDeleted = true;
      resetHolidayBehavior();
      vm.holidaysForm.$setDirty();
    }

    function isOpenHoursAfterCloseHours(startTime, endTime) {
      if (startTime && endTime) {
        var startTime = moment(startTime);
        var endTime = moment(endTime);
        var start = moment({
          hour: startTime.hour(),
          minute: startTime.minute()
        });
        var end = moment({
          hour: endTime.hour(),
          minute: endTime.minute()
        });
        return start.isSame(end) || start.isAfter(end);
      }
    }

    function forceStartBeforeEndCheck() {
      var index = _.findLastIndex(vm.holidays, {
        isOpen: true
      });
      if (index >= 0) {
        var indexForm = 'holidayForm' + index;
        vm.holidaysForm[indexForm].holidayEnd.$error.compareTo = vm.isOpenHoursAfterCloseHours(vm.holidays[index].starttime, vm.holidays[index].endtime);
        vm.holidaysForm[indexForm].holidayEnd.$setDirty();
      }
    }

    function exactDateChanged(holiday) {
      // If exactDate unselected, auto select recurAnnually
      if (holiday.exactDate === false) {
        holiday.recurAnnually = true;
      } else {
        holiday.recurAnnually = false;
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
        if (!holiday.allDay && (holiday.starttime === undefined || holiday.endtime === undefined || isOpenHoursAfterCloseHours(holiday.starttime, holiday.endtime))) {
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
        if (isOpenHoursAfterCloseHours(hours.starttime, hours.endtime)) {
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
        var calName = vm.aaModel.aaRecord.callExperienceName;
        var savePromise;
        var notifyName = "Calendar for " + vm.aaModel.aaRecord.callExperienceName;

        vm.ui.isHolidays = (vm.holidays.length) ? true : false;
        vm.ui.isClosedHours = (vm.openhours.length) || (vm.holidayBehavior && vm.holidays.length) ? true : false;
        if (vm.holidayBehavior && vm.holidays.length > 0) {
          vm.ui.holidaysValue = 'closedHours';
        } else {
          vm.ui.holidaysValue = 'holidays';
        }

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
            AANotificationService.success('autoAttendant.successUpdateCe', {
              name: notifyName
            });
            vm.isDeleted = false;
            vm.ui.isHolidays = (vm.holidays.length) ? true : false;
            vm.ui.isClosedHours = (vm.openhours.length || (vm.holidayBehavior && vm.holidays.length)) ? true : false;
            $modalInstance.close(response);
          },
          function (response) {
            // failure
            if (vm.isDeleted && !vm.openhours.length && !vm.holidays.length) {
              //Error deleting calendar or updating CE. Retain the scheduleId.
              vm.aaModel.aaRecord.scheduleId = vm.ui.ceInfo.scheduleId;
              vm.isDeleted = false;
              AANotificationService.errorResponse(response, 'autoAttendant.errorDeleteCe', {
                name: calName,
                statusText: response.statusText,
                status: response.status
              });
            } else if (angular.isUndefined(vm.aaModel.aaRecord.scheduleId)) {
              //Calendar create failed
              AANotificationService.errorResponse(response, 'autoAttendant.errorCreateCe', {
                name: calName,
                statusText: response.statusText,
                status: response.status
              });
            } else {
              AANotificationService.errorResponse(response, 'autoAttendant.errorUpdateCe', {
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
          AANotificationService.errorResponse(response, 'autoAttendant.errorUpdateCe', {
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
          _.each(vm.openhours, function (openhour) {
            _.each(openhour.days, function (day) {
              day.label = moment.weekdays(day.index);
            });
          });
          vm.holidays = allHours.holidays;
          _.each(vm.holidays, function (holiday) {
            if (!holiday.exactDate) {
              holiday.month.label = moment.months(holiday.month.index);
              holiday.rank.labelTranslate = $translate.instant(holiday.rank.label);
              holiday.day.label = moment.weekdays(holiday.day.index);
            }
          });
        });
      }

      vm.monthOptions = [];
      _.times(12, function (i) {
        vm.monthOptions.push({
          index: i,
          number: i + 1,
          label: moment.months(i)
        });
      });
      vm.rankOptions = AAICalService.getRanks();
      _.each(vm.rankOptions, function (rank) {
        rank.labelTranslate = $translate.instant(rank.label);
      });
      vm.dayOptions = [];
      _.each(AAICalService.getTwoLetterDays(), function (value, index) {
        vm.dayOptions[(index - 1 + 7) % 7] = {
          index: index,
          abbr: value,
          label: moment.weekdays(index)
        };
      });

      vm.holidayBehavior = vm.ui.holidaysValue === 'closedHours' ? true : false;
    }

    function openImportModal() {
      var importModal = $modal.open({
        templateUrl: 'modules/huron/features/autoAttendant/schedule/importSchedule.tpl.html',
        type: 'dialog',
        controller: 'AAScheduleImportCtrl',
        controllerAs: 'import'
      });
      importModal.result.then(function (allHours) {
        if (allHours) {
          AANotificationService.success('autoAttendant.successImport', {
            holidays: allHours.holidays.length,
            hours: allHours.hours.length
          });
          allHours.hours.forEach(function (value) {
            _.each(value.days, function (day) {
              day.label = moment.weekdays(day.index);
            });
            vm.openhours.unshift(value);
          });
          allHours.holidays.forEach(function (value) {
            if (!value.exactDate) {
              value.month.label = moment.months(value.month.index);
              value.rank.labelTranslate = $translate.instant(value.rank.label);
              value.day.label = moment.weekdays(value.day.index);
            }
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
