'use strict';

angular.module('Hercules')
  .directive('herculesPopover', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.find('.popover-trigger').popover({
          html: true,
          container: "body",
          trigger: "focus",
          placement: "auto",
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
