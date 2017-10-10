(function () {
  'use strict';

  angular.module('Core')
    .controller('FirstTimeWizardCtrl', FirstTimeWizardCtrl);

  /* @ngInject */
  function FirstTimeWizardCtrl($q, $scope, $state, $translate, AccountService, Analytics, Authinfo, Orgservice, SetupWizardService) {
    $scope.greeting = $translate.instant('index.greeting', {
      name: Authinfo.getUserName(),
    });

    $scope.finish = function () {
      serviceSetupWizardComplete().then(function () {
        Authinfo.setSetupDone(true);
        $state.go('overview');
        Analytics.trackServiceSetupSteps(Analytics.sections.SERVICE_SETUP.eventNames.FINISH_BUTTON_CLICK, { subscriptionId: SetupWizardService.getActingSubscriptionId() });
      });
    };

    function serviceSetupWizardComplete() {
      AccountService.clearCache();
      if (SetupWizardService.hasPendingLicenses()) {
        AccountService.updateCacheAge(5);
        return updateAccountInfo();
      } else {
        return Orgservice.setSetupDone().then(function () {
          return updateAccountInfo();
        });
      }
    }

    function updateAccountInfo() {
      if (Authinfo.isAdmin()) {
        return AccountService.updateAuthinfoAccount();
      } else {
        return $q.resolve();
      }
    }
  }
})();
