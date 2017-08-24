(function () {
  'use strict';

  angular.module('Core')
    .controller('FirstTimeWizardCtrl', FirstTimeWizardCtrl);

  /* @ngInject */
  function FirstTimeWizardCtrl($q, $scope, $state, $translate, AccountService, Authinfo, Orgservice, SetupWizardService) {
    $scope.greeting = $translate.instant('index.greeting', {
      name: Authinfo.getUserName(),
    });

    $scope.finish = function () {
      serviceSetupWizardComplete().then(function () {
        Authinfo.setSetupDone(true);
        $state.go('overview');
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
