(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAHelpCtrl', AAHelpCtrl);

  /* @ngInject */
  function AAHelpCtrl($scope, $translate, Config) {

    var vm = this;

    vm.content = "";
    vm.showLink = false;
    vm.trigger = "focus";
    vm.placement = "right";

    vm.optionHelp = $translate.instant("autoAttendant.aaHelpFAQ");
    vm.helpUrlAATag = Config.helpUrl + "/tags#/?tags=auto%20attendant";
    vm.optionHelpLink = "<a href='" + vm.helpUrlAATag + "' target='blank'>" + vm.helpUrlAATag + "</a>";

    vm.getHelpText = getHelpText;

    /////////////////////

    function getHelpText() {
      var helpText = "";

      if (vm.content) {
        helpText = vm.content;
      }

      if (vm.showLink === true) {
        helpText = vm.content + "<br><br>" + vm.optionHelp + "<br>" + vm.optionHelpLink;
      }

      return helpText;
    }

    function activate() {
      vm.content = $scope.content;
      vm.showLink = $scope.showLink;
    }

    activate();
  }
})();
