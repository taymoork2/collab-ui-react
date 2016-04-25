(function() {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive("aaPopoverHtmlPopup", function () {
      return {
        restrict: "EA",
        replace: true,
        scope: {
          title: "@",
          content: "@",
          placement: "@",
          animation: "&",
          isOpen: "&"
        },
        templateUrl: 'modules/huron/features/autoAttendant/builder/aaPopoverHtmlPopup.tpl.html'
      };
    })

  .directive("aaPopoverHtml", ["$tooltip", function ($tooltip) {
    return $tooltip("aaPopoverHtml", "popover", 'click');
  }]);
})();