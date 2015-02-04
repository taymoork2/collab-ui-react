'use strict';

angular.module('Core')

.directive('crUserGroupCard', [

  function () {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/core/users/userPreview/userGroupCard.tpl.html',
      link: function (scope, element, attrs) {

      }
    };
  }
])

;
