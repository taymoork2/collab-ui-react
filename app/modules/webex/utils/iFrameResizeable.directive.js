/**
 * 
 */
'use strict';

angular.module('WebExUtils').directive(
  'iFrameResizable',
  function iFrameResizableDirective($window) {
    return function iFrameResizable(
      $scope,
      element,
      attributes
    ) {

      $scope.initializeWindowSize = function () {
        var innerHeight = $window.innerHeight;
        var targetElementId = attributes["iFrameResizable"];
        var targetElement = document.getElementById(targetElementId).getBoundingClientRect();
        var targetElementLocation = {
          left: targetElement.left + window.scrollX,
          top: targetElement.top + window.scrollY
        };

        var iframeTopMargin = targetElementLocation.top;
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
  } // iFrameResizableDirective ()
);
