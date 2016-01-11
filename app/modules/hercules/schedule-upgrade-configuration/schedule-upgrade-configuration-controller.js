(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ScheduleUpgradeConfigurationCtrl', ScheduleUpgradeConfigurationCtrl);

  function labelForDay(day) {
    var weekday = new Array(7);
    weekday[0] = '';
    weekday[1] = 'Monday';
    weekday[2] = 'Tuesday';
    weekday[3] = 'Wednesday';
    weekday[4] = 'Thursday';
    weekday[5] = 'Friday';
    weekday[6] = 'Saturday';
    weekday[7] = 'Sunday';

     // TODO: translate
    return 'Every ' + weekday[day];
  }

  function ScheduleUpgradeConfigurationCtrl($scope, Authinfo, ScheduleUpgradeService) {
    var vm = this;
    vm.data = {};
    vm.isAdminAcknowledged = true;
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
    vm.acknowledge = function () {
      return patch(vm.data);
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
        vm.isAdminAcknowledged = data.isAdminAcknowledged;
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
        vm.isAdminAcknowledged = true;
        vm.state = 'idle';
      });
    }
  }
}());
