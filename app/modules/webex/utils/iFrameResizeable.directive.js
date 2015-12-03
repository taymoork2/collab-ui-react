/**
 * 
 */
'use strict';

angular.module('WebExUtils').directive('iFrameResizable', function ($window) {
  return function iFrameResizable($scope) {
    $scope.initializeWindowSize = function () {
      var innerHeight = $window.innerHeight;

      var iframeContainerElement = document.getElementById('iframeContainer').getBoundingClientRect();
      var elementLocation = {
        left: iframeContainerElement.left + window.scrollX,
        top: iframeContainerElement.top + window.scrollY
      };

      var iframeTopMargin = elementLocation.top;
      var iframeBottomMargin = 14;
      var iframeTotalMargin = iframeTopMargin + iframeBottomMargin;

      $scope.iframeHeight = (iframeTotalMargin >= innerHeight) ? 0 : innerHeight - iframeTotalMargin;
    };

    $scope.initializeWindowSize();

    return angular.element($window).bind('resize', function () {
      $scope.initializeWindowSize();
      return $scope.$apply();
    });
  }; // iFrameResizable()
});
