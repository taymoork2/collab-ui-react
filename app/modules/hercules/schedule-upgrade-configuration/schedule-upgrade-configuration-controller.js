(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ScheduleUpgradeConfigurationCtrl', ScheduleUpgradeConfigurationCtrl);

  function ScheduleUpgradeConfigurationCtrl($scope, $translate, Authinfo, ScheduleUpgradeService, NotificationService) {
    var vm = this;
    vm.data = {}; // UI data
    vm.isAdminAcknowledged = true;
    vm.featureEnabled = false; // feature not enabled by default
    vm.state = 'syncing'; // 'error' | 'idle'
    vm.errorMessage = '';
    vm.timeOptions = _.range(0, 24).map(function (time) {
      return _.padLeft(time, 2, '0') + ':00';
    });
    var days = _.range(1, 8).map(function (day) {
      return {
        label: labelForDay(day),
        value: day
      };
    });
    var sunday = days.pop();
    vm.dayOptions = [sunday].concat(days);
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
        vm.state = 'idle';
      }, function (error) {
        vm.errorMessage = error.message;
        vm.state = 'error';
      });

    $scope.$watch(function () {
      return vm.data;
    }, function (newValue, oldValue) {
      if (newValue === oldValue || _.isEmpty(oldValue)) {
        return;
      }
      patch(newValue);
    }, true);

    function labelForDay(day) {
      var keys = ['', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return $translate.instant('weekDays.everyDay', {
        day: $translate.instant('weekDays.' + keys[day])
      });
    }

    function patch(data) {
      vm.state = 'syncing';
      return ScheduleUpgradeService.patch(Authinfo.getOrgId(), vm.serviceType, {
          scheduleTime: data.scheduleTime,
          scheduleTimeZone: data.scheduleTimeZone,
          scheduleDay: data.scheduleDay.value
        })
        .then(function () {
          NotificationService.removeNotification('acknowledgeScheduleUpgrade');
          vm.isAdminAcknowledged = true;
          vm.errorMessage = '';
          vm.state = 'idle';
        }, function (error) {
          vm.errorMessage = error.message;
          vm.state = 'error';
        });
    }
  }
}());
