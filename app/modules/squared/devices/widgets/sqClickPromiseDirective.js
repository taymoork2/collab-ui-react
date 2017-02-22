(function () {
  'use strict';

  function SqClickPromiseDirective() {
    function Link(scope, elem, attr) {
      var key = attr['sqClickPromise'];
      var i = $('<i class="icon icon-spinner">').appendTo(elem).hide();
      elem.click(function () {
        var promise = scope.$eval(key);
        if (promise) {
          promise.then(done, done);
          elem.children().hide();
          i.show();
          elem.attr('disabled', true);
        }
      });

      function done() {
        elem.children().show();
        i.hide();
        elem.attr('disabled', false);
      }
    }
    return {
      restrict: 'A',
      link: Link,
    };
  }

  angular
    .module('Squared')
    .directive('sqClickPromise', SqClickPromiseDirective);
}());
