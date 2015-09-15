(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderScheduleInfoCtrl', AABuilderScheduleInfoCtrl);

  /* @ngInject */
  function AABuilderScheduleInfoCtrl($scope) {
    $scope.openHours = {
      title: 'autoAttendant.scheduleOpen'
    };
    $scope.closedHours = {
      title: 'autoAttendant.scheduleClosed'
    };
    $scope.holidays = {
      title: 'autoAttendant.scheduleHolidays'
    };

    /* schedule model  */

  }
})();
