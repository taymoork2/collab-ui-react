'use strict';

angular.module('Core')

.directive('crGroupInfoCard', [

  function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/core/groups/groupPreview/groupInfoCard.tpl.html',
      link: function (scope, element, attrs) {}
    };
  }
])

;
