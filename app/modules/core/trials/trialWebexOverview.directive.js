(function () {
  'use strict';

  angular
    .module('core.trial')
    .directive('trialWebexOverview', trialWebexOverview);

  function trialWebexOverview() {
    var directive = {
      restrict: 'E',
      template: require('modules/core/trials/trialWebexOverview.tpl.html'),
      controller: 'TrialWebexOverviewCtrl',
      controllerAs: 'trialWebexOverview',
    };

    return directive;
  }
})();
