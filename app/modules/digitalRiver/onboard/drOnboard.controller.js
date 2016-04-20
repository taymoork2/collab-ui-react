(function () {
  'use strict';

  angular
    .module('DigitalRiver')
    .controller('drOnboardController', drOnboardController);

  /* @ngInject */
  function drOnboardController($state, $translate, Auth, DigitalRiverService, Config, Storage) {

    var vm = this;
    var params = {};
    var isAdmin = false;
    var isPaidOrg = false;

    var token = Storage.get('userToken');
    Auth.setAuthorizationHeader(token);

    DigitalRiverService.getUserAuthInfo()
      .then(function (result) {
        if (_.get(result, 'status') === 200) {
          var data = _.get(result, 'data');
          if (_.includes(data.roles, Config.roles.full_admin)) {
            isAdmin = true;
          }
          isPaidOrg = data.orgId !== (Config.consumerOrgId && Config.consumerMockOrgId);

          if (isPaidOrg && isAdmin) {
            params.org = data.orgName;
            $state.go('drConfirmAdminOrg', params);
          } else if (!isPaidOrg) {
            params.email = data.name;
            $state.go('drOnboardQuestion', params);
          }
        } else {
          vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
        }
      }, function (result) {
        vm.error = _.get(result, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError'));
      });
  }
})();
