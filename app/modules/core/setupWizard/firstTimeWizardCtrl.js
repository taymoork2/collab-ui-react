(function () {
  'use strict';

  angular.module('Core')
    .controller('FirstTimeWizardCtrl', FirstTimeWizardCtrl);

  /* @ngInject */
  function FirstTimeWizardCtrl($scope, $state, $translate, Auth, Authinfo,
                               Config, FeatureToggleService, Orgservice,
                               Userservice) {
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

    FeatureToggleService.atlasCareTrialsGetStatus().then(function (careEnabled) {
      if (!careEnabled || needNotPatch()) {
        return;
      }

      function needNotPatch() {
        return (Authinfo.isInDelegatedAdministrationOrg() ||
                !Authinfo.getCareServices() ||
                Authinfo.getCareServices().length === 0);
      }

      /**
       * Patch the first time admin login with SyncKms role and Care entitlements.
       */
      Userservice.getUser('me', function (user) {
        if (!user.success) {
          return; // Can't patch now, try later.
        }

        var hasSyncKms = _.find(user.roles, function (r) {
          return r === Config.backend_roles.spark_synckms;
        });

        var hasCareEntitlements = _.filter(user.entitlements, function (e) {
          return (e === Config.entitlements.care ||
                  e === Config.entitlements.context);
        }).length === 2;

        if (!hasSyncKms || !hasCareEntitlements) {
          var userData = {
            'schemas': Config.scimSchemas,
            roles: [Config.backend_roles.spark_synckms],
            entitlements: [Config.entitlements.care, Config.entitlements.context]
          };

          Userservice.updateUserProfile(user.id, userData, function (res, status) {
            if (res.success) {
              /**
               * TODO: This is a workaround until we figure out a way to
               * Revoke/Refresh access token with newly patched entitlements.
               */
              Auth.logout();
            }
          });
        }
      });
    });
  }
})();
