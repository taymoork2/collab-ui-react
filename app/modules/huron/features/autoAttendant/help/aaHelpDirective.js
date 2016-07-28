(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .directive('aaHelp', aaHelp);

  function aaHelp() {
    return {
      restrict: 'AE',
      scope: {
        content: "@",
        showLink: "="
      },
      controller: 'AAHelpCtrl',
      controllerAs: 'aaHelpCtrl',
      templateUrl: 'modules/huron/features/autoAttendant/help/aaHelp.tpl.html',
      link: function (scope, element) {
        element.parent().addClass("aa-help-wrapper");
      }
    };
  }
})();
