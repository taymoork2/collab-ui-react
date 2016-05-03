(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive("aaPopoverHtmlPopup", aaPopoverHtmlPopup)
    .directive("aaPopoverHtml", aaPopoverHtml);

  /* @ngInject */
  function aaPopoverHtmlPopup() {
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
  }

  /* @ngInject */
  function aaPopoverHtml($tooltip) {
    return $tooltip("aaPopoverHtml", "popover", 'click');
  }
})();
