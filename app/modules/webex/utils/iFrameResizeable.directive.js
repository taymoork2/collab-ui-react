/**
 * 
 */
'use strict';

angular.module('WebExUtils').directive('iFrameResizable', function ($window) {
  return function ($scope) {
    $scope.initializeWindowSize = function () {
      var innerHeight = $window.innerHeight;
      $scope.iframeHeight = (240 >= innerHeight) ? 0 : innerHeight - 240;
      return $scope.iframeHeight;
    };
    $scope.initializeWindowSize();
    return angular.element($window).bind('resize', function () {
      $scope.initializeWindowSize();
      return $scope.$apply();
    });
  };
});
