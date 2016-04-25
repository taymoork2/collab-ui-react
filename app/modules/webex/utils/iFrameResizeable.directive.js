(function() {
  /**
   * 
   */
  'use strict';

  angular.module('WebExApp').directive(
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
          var targetElement = $window.document.getElementById(targetElementId).getBoundingClientRect();
          var targetElementLocation = {
            left: targetElement.left + $window.pageXOffset,
            top: targetElement.top + $window.pageYOffset
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
})();