'use strict';

angular
  .module('Core')
  .directive('crUserInfo', [
    function () {
      return {
        restrict: 'E',
        // scope: false,
        controller: 'UserInfoController',
        templateUrl: 'modules/core/userInfo/userInfo.html'
      };
    }
  ]);
