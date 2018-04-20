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
      template: require('modules/core/userInfo/userInfo.html'),
    };
  }
})();
