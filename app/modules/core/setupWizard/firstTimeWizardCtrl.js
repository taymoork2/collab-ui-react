(function () {
  'use strict';

  angular.module('Core')
    .controller('FirstTimeWizardCtrl', FirstTimeWizardCtrl);

  /* @ngInject */
  function FirstTimeWizardCtrl($scope, $translate, Auth, Authinfo, $state, Orgservice) {
    $scope.greeting = $translate.instant('index.greeting', {
      name: Authinfo.getUserName()
    });

    $scope.finish = function () {
      return Orgservice.setSetupDone().then(function () {
        Authinfo.setSetupDone(true);
      }).then(function () {
        if (Authinfo.isAdmin()) {
          return Auth.getCustomerAccount(Authinfo.getOrgId())
            .success(function (data, status) {
              Authinfo.updateAccountInfo(data, status);
            });
        }
      }).finally(function () {
        $state.go('overview');
      });
    };
  }
})();
