'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaSayMessage', [
    function () {
      return {
        restrict: 'E',
        scope: {
          schedule: '@aaSchedule',
          index: '=aaIndex',
          isMenuHeader: '=aaHeader',
          menuKeyIndex: '@aaKeyIndex'
        },
        controller: 'AASayMessageCtrl',
        controllerAs: 'aaSay',
        templateUrl: 'modules/huron/features/autoAttendant/sayMessage/aaSayMessage.tpl.html'
      };
    }
  ]);
