'use strict';

angular.module('Hercules')
  .directive('herculesPopover', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        scope.getTitle = function () {
          return element.find('.popover-title').html();
        };
        scope.getContent = function () {
          return element.find('.popover-content').html();
        };
        element.find('.popover-trigger').popover({
          html: true,
          trigger: "click",
          placement: "auto",
          container: 'body',
          title: scope.getTitle,
          content: scope.getContent
        });
      }
    };
  });
