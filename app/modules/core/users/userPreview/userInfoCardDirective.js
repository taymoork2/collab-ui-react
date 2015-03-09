'use strict';

angular.module('Core')
  .directive('crUserInfoCard', [
    function () {
      return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'modules/core/users/userPreview/userInfoCard.tpl.html',
        link: function () {}
      };
    }
  ]);
