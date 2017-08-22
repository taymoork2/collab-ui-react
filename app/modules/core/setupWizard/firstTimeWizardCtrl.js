(function () {
  'use strict';

  angular.module('Core')
    .controller('FirstTimeWizardCtrl', FirstTimeWizardCtrl);

  /* @ngInject */
  function FirstTimeWizardCtrl($q, $scope, $state, $translate, Auth, Authinfo, Orgservice, SetupWizardService) {
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
      if (SetupWizardService.hasPendingLicenses()) {
        return updateAccountInfo();
      } else {
        return Orgservice.setSetupDone().then(function () {
          return updateAccountInfo();
        });
      }
    }

    function updateAccountInfo() {
      if (Authinfo.isAdmin()) {
        return Auth.getCustomerAccount(Authinfo.getOrgId())
          .then(function (response) {
            Authinfo.updateAccountInfo(response.data, response.status);
          });
      } else {
        return $q.resolve();
      }
    }
  }
})();
