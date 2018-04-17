(function () {
  'use strict';

  angular.module('Hercules')
    .component('hsUpgradeScheduleConfiguration', {
      bindings: {
        clusterId: '<',
        onlyDaily: '<',
      },
      controller: UpgradeScheduleConfigurationCtrl,
      template: require('modules/hercules/upgrade-schedule-configuration/hs-upgrade-schedule-configuration.component.html'),
    });

  /* @ngInject */
  function UpgradeScheduleConfigurationCtrl($rootScope, $scope, $q, $translate, $window, $modal, Authinfo, HybridServicesClusterService, Notification, TimezoneService) {
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
        timeZone: getTimeZoneOptions(),
      };
      vm.upgradeSchedule = {};
      vm.errorMessage = '';
    }

    function $onChanges(changes) {
      if (changes.onlyDaily) {
        vm.onlyDaily = changes.onlyDaily.currentValue;
      }
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
      return HybridServicesClusterService.get(vm.clusterId)
        .then(function (cluster) {
          return cluster.upgradeSchedule;
        })
        .then(function (upgradeSchedule) {
          vm.formData = convertDataForUI(upgradeSchedule);
          vm.upgradeSchedule = upgradeSchedule;
          vm.nextUpdateOffset = moment.tz(upgradeSchedule.nextUpgradeWindow.startTime, upgradeSchedule.scheduleTimeZone).format('Z');
          vm.formOptions.day = getDayOptions();
          vm.syncing = false;
        })
        .catch(function (error) {
          // Do not reset vm.syncing if there was an error
          Notification.errorWithTrackingId(error.message || error.statusText);
        });
    }

    function convertDataForUI(data) {
      var scheduleDay = {};
      if (data.scheduleDays.length === 7) {
        scheduleDay = {
          label: $translate.instant('weekDays.daily'),
          value: 'everyDay',
        };
      } else {
        scheduleDay = {
          label: labelForDay(data.scheduleDays[0]),
          value: data.scheduleDays[0],
        };
      }

      return {
        scheduleTime: {
          label: labelForTime(data.scheduleTime),
          value: data.scheduleTime,
        },
        scheduleDay: scheduleDay,
        scheduleTimeZone: {
          label: labelForTimeZone(data.scheduleTimeZone),
          value: data.scheduleTimeZone,
        },
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
      return HybridServicesClusterService.setUpgradeSchedule(vm.clusterId, {
        scheduleTime: data.scheduleTime.value,
        scheduleTimeZone: data.scheduleTimeZone.value,
        scheduleDays: scheduleDays,
      })
        .then(function deleteMoratoria() {
          var promises = vm.upgradeSchedule.moratoria.map(function (moratorium) {
            return HybridServicesClusterService.deleteMoratoria(vm.clusterId, moratorium.id);
          });
          return $q.all(promises);
        })
        .then(updateUI)
        .catch(function (error) {
          Notification.errorWithTrackingId(error.data.message);
        })
        .finally(function () {
          vm.syncing = false;
        });
    }

    function postpone(event) {
      event.preventDefault();
      vm.syncing = true;
      return HybridServicesClusterService.postponeUpgradeSchedule(vm.clusterId, vm.upgradeSchedule.nextUpgradeWindow)
        .then(updateUI)
        .then(function () {
          Notification.success('hercules.settings.scheduleUpgrade.postponeSuccess', { datetime: moment(vm.upgradeSchedule.nextUpgradeWindow.startTime).tz(vm.upgradeSchedule.scheduleTimeZone).format('LLLL') });
        });
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
        return _.padStart(time, 2, '0') + ':00';
      });
      return _.map(values, function (value) {
        return {
          label: labelForTime(value),
          value: value,
        };
      });
    }

    function labelForDay(day) {
      return $translate.instant('weekDays.everyDay', {
        day: $translate.instant('weekDays.' + day),
      });
    }

    function getDayOptions() {
      var currentLanguage = $translate.use();
      var days = _.map(KEYS, function (day) {
        return {
          label: labelForDay(day),
          value: day,
        };
      });
      // if USA, put Sunday first
      if (currentLanguage === 'en_US') {
        var sunday = days.pop();
        days = [sunday].concat(days);
      }
      if (!vm.onlyDaily) {
        // add daily option at the top
        return [{
          label: $translate.instant('weekDays.daily'),
          value: 'everyDay',
        }].concat(days);
      } else {
        return days;
      }
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
            label: labelForTimeZone(zone),
            value: zone,
          };
        })
        .sort(function (a, b) {
          return a['label'].localeCompare(b['label']);
        });
      return timezones;
    }
  }
})();
