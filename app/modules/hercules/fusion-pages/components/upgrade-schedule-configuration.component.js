(function () {
  'use strict';

  angular.module('Hercules')
    .component('upgradeScheduleConfiguration', {
      bindings: {
        canPostpone: '<',
        daily: '<',
        clusterId: '<'
      },
      controller: UpgradeScheduleConfigurationCtrl,
      templateUrl: 'modules/hercules/fusion-pages/components/upgrade-schedule-configuration.html'
    });

  /* @ngInject */
  function UpgradeScheduleConfigurationCtrl($rootScope, $scope, $q, $translate, $window, $modal, Authinfo, FusionClusterService, NotificationService, TimezoneService) {
    var vm = this;
    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.postpone = postpone;

    ////////

    function $onInit() {
      vm.state = 'syncing'; // 'error' | 'idle'
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
      if (changes.canPostpone) {
        vm.canPostpone = changes.canPostpone.currentValue;
      }
      if (changes.daily) {
        vm.daily = changes.daily.currentValue;
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
      vm.state = 'syncing';
      return FusionClusterService.get(vm.clusterId)
        .then(function (cluster) {
          return cluster.upgradeSchedule;
        })
        .then(function (upgradeSchedule) {
          vm.formData = convertDataForUI(upgradeSchedule);
          vm.upgradeSchedule = upgradeSchedule;
          vm.nextUpdateOffset = moment.tz(upgradeSchedule.nextUpgradeWindow.startTime, upgradeSchedule.scheduleTimeZone).format('Z');
          vm.errorMessage = '';
          vm.formOptions.day = getDayOptions();
          vm.state = 'idle';
        })
        .catch(function (error) {
          vm.errorMessage = error.message || error.statusText;
          vm.state = 'error';
        });
    }

    function convertDataForUI(data) {
      var scheduleDay = {};
      if (data.scheduleDays.length === 7) {
        var label = $translate.instant('weekDays.everyDay', {
          day: $translate.instant('weekDays.day')
        });
        scheduleDay = {
          label: label,
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
      vm.state = 'syncing';
      return FusionClusterService.setUpgradeSchedule(vm.clusterId, {
          scheduleTime: data.scheduleTime.value,
          scheduleTimeZone: data.scheduleTimeZone.value,
          scheduleDays: [data.scheduleDay.value]
        })
        .then(function deleteMoratoria() {
          var promises = vm.upgradeSchedule.moratoria.map(function (moratorium) {
            return FusionClusterService.deleteMoratoria(vm.clusterId, moratorium.id);
          });
          return $q.all(promises);
        })
        .then(updateUI)
        .catch(function (error) {
          vm.errorMessage = error.message;
          vm.state = 'error';
        });
    }

    function postpone(event) {
      event.preventDefault();
      vm.state = 'syncing';
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
      var labels = angular.copy(values);
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
      var keys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      var days = _.map(keys, function (day) {
        return {
          label: labelForDay(day),
          value: day
        };
      });
      // if USA, put Sunday first
      if (currentLanguage === 'en_US') {
        var sunday = days.pop();
        return [sunday].concat(days);
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
