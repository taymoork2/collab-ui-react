(function () {
  'use strict';

  angular
    .module('Core')
    .directive('crUserInfo', crUserInfo);

  function crUserInfo() {
    return {
      restrict: 'E',
      // scope: false,
      controller: 'UserInfoController',
      templateUrl: 'modules/core/userInfo/userInfo.html',
      link: function (scope) {
        scope.collapsed = { value: false };
        // atlas2017NameChange, revisit other solutions but this works for now
        if (scope && scope.$parent && scope.$parent.$parent && scope.$parent.$parent.collapsed) {
          scope.collapsed = scope.$parent.$parent.collapsed;
        }
      },
    };
  }
})();
