(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaKeypress', aaKeypress);

  /* @ngInject */
  function aaKeypress(Notification) {
    return function (scope, element) {
      var charsNotAllowed = [{
        'keyCode': 60,
        char: '<'
      }, {
        'keyCode': 62,
        char: '>'
      }];

      element.bind('keypress', function (event) {
        var keyCode = event.keyCode;

        if (_.indexOf(_.map(charsNotAllowed, 'keyCode'), keyCode) >= 0) {

          scope.$apply(Notification.error(
            'autoAttendant.sayMessageInvalidChar', {
              char: _.find(charsNotAllowed, {
                'keyCode': keyCode
              }).char
            }));

          event.preventDefault();

        }

      });
    };
  }
})();
