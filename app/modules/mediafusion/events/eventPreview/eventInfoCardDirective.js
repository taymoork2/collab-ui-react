'use strict';

angular.module('Mediafusion')

.directive('crEventInfoCard', [

  function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/events/eventPreview/eventInfoCard.tpl.html',
      link: function (scope, element, attrs) {

      }
    };
  }
])

;
