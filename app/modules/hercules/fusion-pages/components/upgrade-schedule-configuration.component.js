(function () {
  'use strict';

  angular.module('Hercules')
    .component('upgradeScheduleConfiguration', {
      bindings: {
        clusterId: '<'
      },
      controller: UpgradeScheduleConfigurationCtrl,
      templateUrl: 'modules/hercules/fusion-pages/components/upgrade-schedule-configuration.html'
    });

  /* @ngInject */
  function UpgradeScheduleConfigurationCtrl($rootScope, $scope, $q, $translate, $window, $modal, Authinfo, FusionClusterService, Notification, TimezoneService) {
    var vm = this;
    var KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.postpone = postpone;

    ////////

    function $onInit() {
      vm.syncing = false;
      vm.formData = {}; // data formatted for the form
      vm.formOptions = {
        day: getDayOptions(),
        time: getTimeOptions(),
        timeZone: getTimeZoneOptions()
      };
      vm.upgradeSchedule = {};
      vm.errorMessage = '';
    }

    function $onChanges(changes) {
      if (changes.clusterId) {
        if (changes.clusterId.currentValue &&
          changes.clusterId.previousValue !== changes.clusterId.currentValue) {
          updateUI();
        }
        vm.clusterId = changes.clusterId.currentValue;
      }
    }

    $scope.$watch(function () {
      return vm.formData;
    }, function saveNewData(newValue, oldValue) {
      if (_.isEmpty(oldValue) || newValue === oldValue) {
        return;
      }
      updateUpgradeScheduleAndUI(newValue);
    }, true);

    function updateUI() {
      vm.syncing = true;
      return FusionClusterService.get(vm.clusterId)
        .then(function (cluster) {
          return cluster.upgradeSchedule;
        })
        .then(function (upgradeSchedule) {
          vm.formData = convertDataForUI(upgradeSchedule);
          vm.upgradeSchedule = upgradeSchedule;
          vm.nextUpdateOffset = moment.tz(upgradeSchedule.nextUpgradeWindow.startTime, upgradeSchedule.scheduleTimeZone).format('Z');
          vm.formOptions.day = getDayOptions();
        })
        .catch(function (error) {
          Notification.error(error.message || error.statusText);
        })
        .finally(function () {
          vm.syncing = false;
        });
    }

    function convertDataForUI(data) {
      var scheduleDay = {};
      if (data.scheduleDays.length === 7) {
        scheduleDay = {
          label: $translate.instant('weekDays.daily'),
          value: 'everyDay'
        };
      } else {
        scheduleDay = {
          label: labelForDay(data.scheduleDays[0]),
          value: data.scheduleDays[0]
        };
      }

      return {
        scheduleTime: {
          label: labelForTime(data.scheduleTime),
          value: data.scheduleTime
        },
        scheduleDay: scheduleDay,
        scheduleTimeZone: {
          label: labelForTimeZone(data.scheduleTimeZone),
          value: data.scheduleTimeZone
        }
      };
    }

    function updateUpgradeScheduleAndUI(data) {
      vm.syncing = true;
      var scheduleDays;
      if (data.scheduleDay.value === 'everyDay') {
        scheduleDays = KEYS;
      } else {
        scheduleDays = [data.scheduleDay.value];
      }
      return FusionClusterService.setUpgradeSchedule(vm.clusterId, {
        scheduleTime: data.scheduleTime.value,
        scheduleTimeZone: data.scheduleTimeZone.value,
        scheduleDays: scheduleDays,
      })
        .then(function deleteMoratoria() {
          var promises = vm.upgradeSchedule.moratoria.map(function (moratorium) {
            return FusionClusterService.deleteMoratoria(vm.clusterId, moratorium.id);
          });
          return $q.all(promises);
        })
        .then(updateUI)
        .catch(function (error) {
          Notification.error(error.data.message);
        })
        .finally(function () {
          vm.syncing = false;
        });
    }

    function postpone(event) {
      event.preventDefault();
      vm.syncing = true;
      return FusionClusterService.postponeUpgradeSchedule(vm.clusterId, vm.upgradeSchedule.nextUpgradeWindow)
        .then(updateUI);
    }

    function labelForTime(time) {
      var currentLanguage = $translate.use();
      if (currentLanguage === 'en_US') {
        return moment(time, 'HH:mm').format('hh:mm A');
      } else {
        return time;
      }
    }

    function getTimeOptions() {
      var values = _.range(0, 24).map(function (time) {
        return _.padLeft(time, 2, '0') + ':00';
      });
      return _.map(values, function (value) {
        return {
          label: labelForTime(value),
          value: value
        };
      });
    }

    function labelForDay(day) {
      return $translate.instant('weekDays.everyDay', {
        day: $translate.instant('weekDays.' + day)
      });
    }

    function getDayOptions() {
      var currentLanguage = $translate.use();
      var days = _.map(KEYS, function (day) {
        return {
          label: labelForDay(day),
          value: day
        };
      });
      // if USA, put Sunday first
      if (currentLanguage === 'en_US') {
        var sunday = days.pop();
        days = [sunday].concat(days);
      }
      // add daily option at the top
      return [{
        label: $translate.instant('weekDays.daily'),
        value: 'everyDay'
      }].concat(days);
    }

    function labelForTimeZone(zone) {
      var map = TimezoneService.getCountryMapping();
      return map[zone] + ': ' + zone;
    }

    function getTimeZoneOptions() {
      var timezones = moment.tz.names()
        .filter(function (zone) {
          var map = TimezoneService.getCountryMapping();
          return map[zone];
        })
        .map(function (zone) {
          return {
            'label': labelForTimeZone(zone),
            'value': zone
          };
        })
        .sort(function (a, b) {
          return a['label'].localeCompare(b['label']);
        });
      return timezones;
    }
  }
})();
