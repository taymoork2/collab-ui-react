/**
 * 
 */
'use strict';

angular.module('WebExUtils').directive('iFrameResizable', function ($window) {
  return function ($scope) {
    $scope.initializeWindowSize = function () {
      var innerHeight = $window.innerHeight;
      // var iframeTopMargin = 200;
      var iframeTopMargin = 214;

      $scope.iframeHeight = (iframeTopMargin >= innerHeight) ? 0 : innerHeight - iframeTopMargin;

      return $scope.iframeHeight;
    };

    $scope.initializeWindowSize();
    return angular.element($window).bind('resize', function () {
      $scope.initializeWindowSize();
      return $scope.$apply();
    });
  };
});
