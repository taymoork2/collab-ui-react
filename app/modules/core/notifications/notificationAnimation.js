(function () {
  'use strict';

  angular.module('Core')
    .animation('.notification-animation', notificationAnimation);

  function notificationAnimation() {
    var animation = {
      enter: enter,
      leave: leave
    };

    return animation;

    function enter(element, done) {
      element.animate({
        right: '30px'
      }, done);
    }

    function leave(element, done) {
      element.fadeOut({}, done);
    }
  }
})();
