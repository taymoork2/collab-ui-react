'use strict';

angular.module('Hercules')
  .directive('herculesPopover', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.find('.popover-trigger').popover({
          html: true,
          trigger: "click",
          placement: "auto",
          container: 'body',
          title: function () {
            return element.find('.popover-title').html();
          },
          content: function () {
            return element.find('.popover-content').html();
          }
        });
      }
    };
  });
