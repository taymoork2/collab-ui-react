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
  function UpgradeScheduleConfigurationCtrl($rootScope, $scope, $translate, $window, $modal, Authinfo, FusionClusterService, NotificationService, TimezoneService) {
    var vm = this;
    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.acknowledge = patch;
    vm.openModal = openModal;

    ////////

    function $onInit() {
      vm.state = 'syncing'; // 'error' | 'idle'
      vm.data = {}; // UI data
      vm.isAcknowledged = true;
      vm.postponed = false;
      vm.errorMessage = '';
      vm.nextUpdate = null;
      vm.timeOptions = getTimeOptions();
      vm.dayOptions = getDayOptions();
      vm.timezoneOptions = getTimezoneOptions();
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
          init();
        }
        vm.clusterId = changes.clusterId.currentValue;
      }
    }

    $scope.$watch(function () {
      return vm.data;
    }, function saveNewData(newValue, oldValue) {
      if (newValue === oldValue || _.isEmpty(oldValue)) {
        return;
      }
      patch(newValue)
        .then(function () {
          vm.nextUpdate = findNextUpdate();
        });
    }, true);

    function init() {
      return FusionClusterService.getUpgradeSchedule(vm.clusterId)
        .then(function (upgradeSchedule) {
          vm.data = convertDataForUI(upgradeSchedule);
          vm.isAcknowledged = upgradeSchedule.isAcknowledged;
          vm.postponed = upgradeSchedule.postponed;
          vm.nextUpdate = findNextUpdate();
          vm.errorMessage = '';
          vm.state = 'idle';
        }, function (error) {
          vm.errorMessage = error.message || error.statusText;
          vm.state = 'error';
        });
    }

    function convertDataForUI(data) {
      return {
        scheduleTime: {
          label: labelForTime(data.scheduleTime),
          value: data.scheduleTime
        },
        scheduleDay: {
          label: labelForDay(data.scheduleDays[0]),
          value: data.scheduleDays[0]
        },
        scheduleTimeZone: {
          label: labelForTimezone(data.scheduleTimeZone),
          value: data.scheduleTimeZone
        }
      };
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
      var keys = ['', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return $translate.instant('weekDays.everyDay', {
        day: $translate.instant('weekDays.' + keys[day])
      });
    }

    function getDayOptions() {
      var currentLanguage = $translate.use();
      var days = _.range(1, 8).map(function (day) {
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

    function labelForTimezone(zone) {
      var map = TimezoneService.getCountryMapping();
      return map[zone] + ': ' + zone;
    }

    function getTimezoneOptions() {
      var timezones = moment.tz.names()
        .filter(function (zone) {
          var map = TimezoneService.getCountryMapping();
          return map[zone];
        })
        .map(function (zone) {
          return {
            'label': labelForTimezone(zone),
            'value': zone
          };
        })
        .sort(function (a, b) {
          return a['label'].localeCompare(b['label']);
        });
      return timezones;
    }

    function patch(data) {
      vm.state = 'syncing';
      return FusionClusterService.setUpgradeSchedule(vm.clusterId, {
          scheduleTime: data.scheduleTime.value,
          scheduleTimeZone: data.scheduleTimeZone.value,
          scheduleDays: [data.scheduleDay.value]
        })
        .then(function (data) {
          $rootScope.$broadcast('ACK_SCHEDULE_UPGRADE');
          vm.isAcknowledged = true;
          vm.postponed = data.postponed;
          vm.errorMessage = '';
          vm.state = 'idle';
        }, function (error) {
          vm.errorMessage = error.message;
          vm.state = 'error';
        });
    }

    function openModal(event) {
      event.preventDefault();
      $window.alert('Not implemented yet');
      // $modal.open({
      //   templateUrl: 'modules/hercules/schedule-upgrade-configuration/postpone-modal.html',
      //   controller: 'PostponeModalController',
      //   controllerAs: 'postponeModal',
      //   type: 'dialog',
      //   resolve: {
      //     data: function () {
      //       return vm.data;
      //     },
      //     nextUpdate: function () {
      //       return vm.nextUpdate;
      //     }
      //   }
      // }).result.then(function (data) {
      //   vm.postponed = data.postponed;
      //   vm.nextUpdate = findNextUpdate();
      // });
    }

    function findNextUpdate() {
      var now = moment.tz(vm.data.scheduleTimeZone.value);
      var time = vm.data.scheduleTime.value.split(':');
      var nextUpdate = moment.tz(vm.data.scheduleTimeZone.value)
        .isoWeekday(vm.data.scheduleDay.value)
        .hours(Number(time[0]))
        .minutes(Number(time[1]))
        .seconds(0);

      // the .isoWeekday() from moment.js is not made to ALWAYS get the NEXT $day (i.e. monday)
      // and always doing a +7 is not the right thing to do either
      if (nextUpdate.isBefore(now)) {
        nextUpdate.add(7, 'day');
      }
      if (vm.postponed) {
        nextUpdate.add(7, 'day');
      }
      return nextUpdate.toDate();
    }
  }
})();
