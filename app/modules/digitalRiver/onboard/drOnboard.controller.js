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

    //TODO check order status

    var token = Storage.get('userToken');
    Auth.setAuthorizationHeader(token);

    DigitalRiverService.getUserAuthInfo()
      .then(function (result) {
        // determine flow based on org status and user's current role
        if (_.get(result, 'status') === 200) {
          var data = _.get(result, 'data');
          params.email = data.name;
          if (_.includes(data.roles, Config.roles.full_admin)) {
            isAdmin = true;
          }
          isPaidOrg = (data.orgId !== (Config.consumerOrgId && Config.consumerMockOrgId));

          if (isPaidOrg && isAdmin) {
            params.org = data.orgName;
            $state.go('drConfirmAdminOrg', params);
          } else if (isPaidOrg && !isAdmin) {
            $state.go('drAdminChoices', params);
          } else if (!isPaidOrg) {
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
