(function () {
  'use strict';

  angular.module('Core')
    .controller('PstnToSCtrl', PstnToSCtrl);

  /* @ngInject */
  function PstnToSCtrl($rootScope, $scope, Orgservice, PstnSetupService) {
    var vm = this;

    var PSTN_TOS_ACCEPT = 'pstn-tos-accept-event';

    vm.firstName = '';
    vm.lastName = '';
    vm.email = '';
    vm.tosAccepted = true;
    vm.onAgreeClick = onAgreeClick;
    vm.orgData = null;
    vm.isTrial = false;
    vm.loading = false;
    vm.tosUrl = '';
    vm.intelepeerImage = 'images/carriers/logo_intelepeer.svg';

    init();

    function init() {
      Orgservice.getOrg(function (data, status) {
        if (status === 200) {
          vm.orgData = data;
          getToSUrl();
        }
      });
    }

    function getToSUrl() {
      PstnSetupService.getCustomerV2(vm.orgData.id).then(function (customer) {
        if (customer.trial) {
          vm.isTrial = true;
          PstnSetupService.getCustomerTrialV2(vm.orgData.id).then(function (trial) {
            if (_.has(trial, 'termsOfServiceUrl')) {
              vm.tosUrl = _.get(trial, 'termsOfServiceUrl');
            }
          });
        }
      });
    }

    function onAgreeClick() {
      vm.loading = true;

      PstnSetupService.setCustomerTrialV2(vm.orgData.id, vm.firstName, vm.lastName, vm.email)
        .then(function () {
          $rootScope.$broadcast(PSTN_TOS_ACCEPT);
          $scope.$close();
        });
    }

  }
})();
