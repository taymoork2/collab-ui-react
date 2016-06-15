(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAScrollBar', AAScrollBar);

  /* @ngInject */
  function AAScrollBar($timeout) {

    var containerId = "#builderScrollContainer";
    var timeoutDelayDefault = 0;
    var positionOffset = 90; //additional px for the vertical lane x2 and the +

    var service = {
      resizeBuilderScrollBar: resizeBuilderScrollBar,
      scrollBuilderToTarget: scrollBuilderToTarget
    };

    return service;

    /////////////////////

    /* Since we are using a custom scroll bar via cs-scrollbar (aka nicescroll) instead of browser scrollbars,
     * we need to call for resize upon the add or remove of dynamic content in the builder containter.
     */
    function resizeBuilderScrollBar(delay) {
      var timeoutDelay = (delay > 0) ? delay : timeoutDelayDefault;

      $timeout(function () {
        resize();
      }, timeoutDelay);
    }

    function resize() {
      var $container = $(containerId);
      var nice = $container.getNiceScroll();
      if (nice) {
        nice.resize();
      }
    }

    function scrollBuilderToTarget(targetId, delay) {
      if (!targetId) {
        return;
      }

      var timeoutDelay = (delay > 0) ? delay : timeoutDelayDefault;

      $timeout(function () {
        var $target = $(targetId);

        var targetHeight = angular.isDefined($target.outerHeight(true)) ? $target.outerHeight(true) : 0;
        var targetEnd = angular.isDefined($target.offset()) ? $target.offset().top + targetHeight : targetHeight;

        var $container = $(containerId);
        var containerEnd = angular.isDefined($container.offset()) && angular.isDefined($container.outerHeight(true)) ? $container.offset().top + $container.outerHeight(true) : 0;

        // recheck scrollbar position
        resize();

        // automatically scroll the container as needed
        if (targetEnd > containerEnd) {
          var scrollPosition = $container.scrollTop();
          var offset = scrollPosition + targetHeight + positionOffset;
          $container.stop(true, true); //clear current and any pending animations on the container
          $container.animate({
            scrollTop: offset
          }, 800, function () {
            // adjust scrollbar after scrolling is complete
            resize();
          });
        }
      }, timeoutDelay);

    }

  }

})();
