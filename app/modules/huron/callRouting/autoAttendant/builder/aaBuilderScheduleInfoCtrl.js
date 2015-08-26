(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AABuilderScheduleInfoCtrl', AABuilderScheduleInfoCtrl);

  /* @ngInject */
  function AABuilderScheduleInfoCtrl($scope) {
    $scope.openHours = {
      title: 'Open Hours'
    };
    $scope.closedHours = {
      title: 'Closed Hours'
    };
    $scope.holidays = {
      title: 'Holidays'
    };

    /* todo: schedule model  */

  }
})();
