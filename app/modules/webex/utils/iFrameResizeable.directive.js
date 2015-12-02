/**
 * 
 */
'use strict';

angular.module('WebExUtils').directive('iFrameResizable', function ($window) {
  return function ($scope) {
    $scope.initializeWindowSize = function () {
      var innerHeight = $window.innerHeight;
      var iframeTop = ($scope.showSpinner) ? 250 : 200;

      $scope.iframeHeight = (iframeTop >= innerHeight) ? 0 : innerHeight - iframeTop;

      return $scope.iframeHeight;
    };

    $scope.initializeWindowSize();
    return angular.element($window).bind('resize', function () {
      $scope.initializeWindowSize();
      return $scope.$apply();
    });
  };
});
