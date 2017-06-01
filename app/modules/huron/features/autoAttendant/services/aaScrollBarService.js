(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AAScrollBar', AAScrollBar);

  /* @ngInject */
  function AAScrollBar($timeout) {

    var containerId = "#builderScrollContainer";
    var timeoutDelayDefault = 0;
    var positionOffset = 90; //additional pixels for the vertical line x2 and the (+)

    var service = {
      scrollBuilderToTarget: scrollBuilderToTarget,
    };

    return service;

    function scrollBuilderToTarget(targetId, delay) {
      if (!targetId) {
        return;
      }

      var timeoutDelay = (delay >= 0) ? delay : timeoutDelayDefault;

      $timeout(function () {
        var $target = $(targetId);

        var targetHeight = !_.isUndefined($target.outerHeight(true)) ? $target.outerHeight(true) : 0;
        var targetEnd = !_.isUndefined($target.offset()) ? $target.offset().top + targetHeight : targetHeight;

        var $container = $(containerId);
        var containerEnd = !_.isUndefined($container.offset()) && !_.isUndefined($container.outerHeight(true)) ? $container.offset().top + $container.outerHeight(true) : 0;

        // automatically scroll the container as needed
        if (targetEnd > containerEnd) {
          var scrollPosition = $container.scrollTop();
          var offset = scrollPosition + targetHeight + positionOffset;
          $container.stop(true, true); //clear current and any pending animations on the container
          $container.animate({
            scrollTop: offset,
          }, 800);
        }
      }, timeoutDelay);

    }

  }

})();
