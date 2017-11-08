(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .controller('AAHelpCtrl', AAHelpCtrl);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function AAHelpCtrl($scope, $translate, $window, Config, AAMetricNameService, Analytics) {
    var vm = this;

    vm.content = '';
    vm.showLink = false;
    vm.trigger = 'focus';
    vm.placement = 'auto right';
    vm.metric = '';

    vm.optionHelp = $translate.instant('autoAttendant.aaHelpFAQ');
    vm.helpUrlAATag = Config.helpUrl + '/tags#/?tags=auto%20attendant';
    vm.optionHelpLink = '<a href="' + vm.helpUrlAATag + '" target="blank" tabindex="-1">' + vm.helpUrlAATag + '</a>';

    vm.getHelpText = getHelpText;
    vm.sendMetrics = sendMetrics;
    vm.checkEvents = checkEvents;

    /////////////////////
    function checkEvents($event) {
      switch ($event.keyCode) {
        case KeyCodes.ESCAPE:
          /* Don't propagate Esc when help button is focused*/
          $event.stopPropagation();
          break;
        case KeyCodes.ENTER:
          if (vm.showLink) {
            $window.open(vm.helpUrlAATag, '_blank');
          }
          break;
      }
    }

    function getHelpText() {
      var helpText = '';

      if (vm.content) {
        helpText = vm.content;
      }

      if (vm.showLink === true) {
        helpText = vm.content + '<br><br>' + vm.optionHelp + '<br>' + vm.optionHelpLink;
      }

      return helpText;
    }

    function sendMetrics() {
      if (vm.metric) {
        Analytics.trackEvent(AAMetricNameService.UI_HELP, {
          icon: vm.metric,
        });
      }
    }

    function activate() {
      vm.content = $scope.content;
      vm.showLink = $scope.showLink;
      vm.metric = $scope.metric;
    }

    activate();
  }
})();
