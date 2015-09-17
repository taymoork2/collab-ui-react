'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaBuilderActions', [
    function () {
      return {
        restrict: 'E',
        transclude: true,
        scope: {
          schedule: '@'
        },
        controller: 'AABuilderActionsCtrl',
        controllerAs: 'actions',
        bindToController: true,
        templateUrl: 'modules/huron/callRouting/autoAttendant/builder/aaBuilderActions.tpl.html'
      };
    }
  ]);
