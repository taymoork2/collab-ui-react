(function () {
  'use strict';

  angular.module('Core')
    .component('leastMostUsed', {
      controller: LeastUsedCtrl,
      template: require('modules/core/customerReports/deviceUsage/leastMostUsedDevices.component.html'),
      bindings: {
        usedDevices: '<',
        waitingStats: '<',
        displayTitle: '<',
      },
    });
  /* @ngInject */
  function LeastUsedCtrl() {
    //var vm = this;
  }
}());
