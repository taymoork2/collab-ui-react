(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ScheduleUpgradeConfigurationCtrl', ScheduleUpgradeConfigurationCtrl);

  function ScheduleUpgradeConfigurationCtrl($scope, Authinfo, ScheduleUpgradeService, NotificationService, $translate) {
    var vm = this;
    vm.data = {}; // UI data
    vm.isAdminAcknowledged = true;
    vm.featureEnabled = false; // feature not enabled by default
    vm.state = 'syncing'; // 'error' | 'idle'
    vm.errorMessage = '';
    vm.timeOptions = _.range(0, 24).map(function (time) {
      return _.padLeft(time, 2, '0') + ':00';
    });
    vm.dayOptions = _.range(1, 8).map(function (day) {
      return {
        label: labelForDay(day),
        value: day
      };
    });
    vm.timezoneOptions = moment.tz.names();
    vm.acknowledge = function (data) {
      return patch(data);
    };
    ScheduleUpgradeService.get(Authinfo.getOrgId(), vm.serviceType)
      .then(function (data) {
        vm.data = {
          scheduleTime: data.scheduleTime,
          scheduleTimeZone: data.scheduleTimeZone,
          scheduleDay: {
            label: labelForDay(data.scheduleDay),
            value: data.scheduleDay
          }
        };
        vm.errorMessage = '';
        vm.isAdminAcknowledged = data.isAdminAcknowledged;
        vm.featureEnabled = true;
      }, function (error) {
        vm.state = 'error';
        vm.errorMessage = error.message;
      })
      .finally(function () {
        vm.state = 'idle';
      });

    $scope.$watch(function () {
      return vm.data;
    }, function (newValue, oldValue) {
      if (newValue === oldValue || _.isEmpty(oldValue)) {
        return;
      }
      vm.state = 'syncing';
      patch(newValue);
    }, true);

    function labelForDay(day) {
      var weekdays = new Array(7);
      weekdays[0] = '';
      weekdays[1] = $translate.instant('weekDays.monday');
      weekdays[2] = $translate.instant('weekDays.tuesday');
      weekdays[3] = $translate.instant('weekDays.wednesday');
      weekdays[4] = $translate.instant('weekDays.thursday');
      weekdays[5] = $translate.instant('weekDays.friday');
      weekdays[6] = $translate.instant('weekDays.saturday');
      weekdays[7] = $translate.instant('weekDays.sunday');

      return $translate.instant('weekDays.everyDay', {
        day: weekdays[day]
      });
    }

    function patch(data) {
      return ScheduleUpgradeService.patch(Authinfo.getOrgId(), vm.serviceType, {
          scheduleTime: data.scheduleTime,
          scheduleTimeZone: data.scheduleTimeZone,
          scheduleDay: data.scheduleDay.value
        })
        .catch(function (error) {
          vm.state = 'error';
          vm.errorMessage = error.message;
        })
        .finally(function () {
          NotificationService.removeNotification('acknowledgeScheduleUpgrade');
          vm.isAdminAcknowledged = true;
          vm.state = 'idle';
        });
    }
  }
}());
