(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAHelpCtrl', AAHelpCtrl);

  /* @ngInject */
  function AAHelpCtrl($scope, $translate, Config, AAMetricNameService, Analytics) {

    var vm = this;

    vm.content = "";
    vm.showLink = false;
    vm.trigger = "focus";
    vm.placement = "auto right";
    var metric = "";

    vm.optionHelp = $translate.instant("autoAttendant.aaHelpFAQ");
    vm.helpUrlAATag = Config.helpUrl + "/tags#/?tags=auto%20attendant";
    vm.optionHelpLink = "<a href='" + vm.helpUrlAATag + "' target='blank'>" + vm.helpUrlAATag + "</a>";

    vm.getHelpText = getHelpText;
    vm.sendMetrics = sendMetrics;

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

    function sendMetrics() {
      if (metric) {
        Analytics.trackEvent(AAMetricNameService.UI_HELP, {
          type: metric
        });
      }
    }

    function activate() {
      vm.content = $scope.content;
      vm.showLink = $scope.showLink;
      metric = $scope.metric;
    }

    activate();
  }
})();
