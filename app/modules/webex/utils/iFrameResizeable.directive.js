(function () {
  'use strict';

  /* @ngInject */
  function iFrameResizableDirective($window, WindowEventService) {
    return function iFrameResizable($scope, element, attributes) {
      function initializeWindowSize() {
        var innerHeight = $window.innerHeight;
        var targetElementId = attributes['iFrameResizable'];
        var targetElement = $window.document.getElementById(targetElementId);

        if (!targetElement) {
          return;
        }
        var targetElementBoundingClientRect = targetElement.getBoundingClientRect();
        var targetElementLocation = {
          left: targetElementBoundingClientRect.left + $window.pageXOffset,
          top: targetElementBoundingClientRect.top + $window.pageYOffset,
        };

        var iframeTopMargin = targetElementLocation.top;
        var iframeBottomMargin = 28;
        var iframeTotalMargin = iframeTopMargin + iframeBottomMargin;

        $scope.iframeHeight = (iframeTotalMargin >= innerHeight) ? 0 : innerHeight - iframeTotalMargin;
      }

      function initializeWindowSizeAndApply() {
        initializeWindowSize();
        $scope.$apply();
      }

      initializeWindowSize();

      WindowEventService.registerEventListener('resize', initializeWindowSizeAndApply, $scope);
    }; // iFrameResizable()
  } // iFrameResizableDirective ()

  module.exports = iFrameResizableDirective;
})();
