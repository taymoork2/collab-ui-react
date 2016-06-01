(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ScheduleUpgradeConfigurationCtrl', ScheduleUpgradeConfigurationCtrl);

  /* @ngInject */
  function ScheduleUpgradeConfigurationCtrl($rootScope, $scope, $translate, $modal, Authinfo, ScheduleUpgradeService, NotificationService, TimezoneService) {
    var vm = this;
    vm.state = 'syncing'; // 'error' | 'idle'
    vm.data = {}; // UI data
    vm.isAdminAcknowledged = true;
    vm.postponed = false;
    vm.errorMessage = '';
    vm.nextUpdate = null;
    vm.timeOptions = getTimeOptions();
    vm.dayOptions = getDayOptions();
    vm.timezoneOptions = getTimezoneOptions();
    vm.acknowledge = patch;
    vm.openModal = openModal;

    ////////

    ScheduleUpgradeService.get(Authinfo.getOrgId(), vm.connectorType)
      .then(function (data) {
        vm.data = convertDataForUI(data);
        vm.isAdminAcknowledged = data.isAdminAcknowledged;
        vm.postponed = data.postponed;
        vm.nextUpdate = findNextUpdate();
        vm.errorMessage = '';
        vm.state = 'idle';
      }, function (error) {
        vm.errorMessage = error.message;
        vm.state = 'error';
      });

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

    function convertDataForUI(data) {
      return {
        scheduleTime: {
          label: labelForTime(data.scheduleTime),
          value: data.scheduleTime
        },
        scheduleDay: {
          label: labelForDay(data.scheduleDay),
          value: data.scheduleDay
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
      return ScheduleUpgradeService.patch(Authinfo.getOrgId(), vm.connectorType, {
          scheduleTime: data.scheduleTime.value,
          scheduleTimeZone: data.scheduleTimeZone.value,
          scheduleDay: data.scheduleDay.value
        })
        .then(function (data) {
          $rootScope.$broadcast('ACK_SCHEDULE_UPGRADE');
          vm.isAdminAcknowledged = true;
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
      $modal.open({
        templateUrl: 'modules/hercules/schedule-upgrade-configuration/postpone-modal.html',
        controller: 'PostponeModalController',
        controllerAs: 'postponeModal',
        type: 'dialog',
        resolve: {
          data: function () {
            return vm.data;
          },
          nextUpdate: function () {
            return vm.nextUpdate;
          },
          connectorType: function () {
            return vm.connectorType;
          }
        }
      }).result.then(function (data) {
        vm.postponed = data.postponed;
        vm.nextUpdate = findNextUpdate();
      });
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
}());
