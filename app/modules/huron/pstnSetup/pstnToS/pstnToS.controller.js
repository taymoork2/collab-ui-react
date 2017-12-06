(function () {
  'use strict';

  angular.module('Core')
    .controller('PstnToSCtrl', PstnToSCtrl);

  /* @ngInject */
  function PstnToSCtrl($q, $rootScope, $scope, $translate, Notification, Orgservice, PstnService) {
    var vm = this;

    var PSTN_TOS_ACCEPT = 'pstn-tos-accept-event';
    var CC_CANADA = 'CA';
    var THINKTEL = 'THINKTEL';

    vm.firstName = '';
    vm.lastName = '';
    vm.email = '';
    vm.tosAccepted = true;
    vm.onAgreeClick = onAgreeClick;
    vm.orgData = null;
    vm.pstnCarrierStatics = [];
    vm.carrier = { logoSrc: '', logoAlt: '' };
    vm.isTrial = false;
    vm.loading = false;
    vm.initComplete = false;
    vm.tosUrl = '';
    vm.showCanadaThinkTelLegal = false;

    init();

    function init() {
      var params = {
        basicInfo: true,
      };
      getCarriersStatic();
      Orgservice.getOrg(function (data, status) {
        if (status === 200) {
          vm.orgData = data;
          getToSInfo();
        }
      }, null, params);
    }

    function getCarriersStatic() {
      getCarriersJson().then(function (carriersResponse) {
        var carriers = _.cloneDeep(carriersResponse);
        carriers.forEach(function (carrier) {
          //translate the feature strings
          for (var i = 0; i < carrier.features.length; i++) {
            carrier.features[i] = $translate.instant(carrier.features[i]);
          }
          vm.pstnCarrierStatics.push(carrier);
        });
      });
    }

    function getCarriersJson() {
      return $q.resolve(require('../../pstn/pstnProviders/pstnProviders.json'));
    }

    function getToSInfo() {
      PstnService.getCustomerV2(vm.orgData.id).then(function (customer) {
        if (customer.trial) {
          var carriers = [{ uuid: customer.pstnCarrierId }];
          vm.isTrial = true;
          PstnService.getCarrierDetails(carriers).then(function (carrier) {
            loadCarrier(carrier[0]);
            vm.initComplete = true;
          });
          PstnService.getCustomerTrialV2(vm.orgData.id).then(function (trial) {
            if (_.has(trial, 'termsOfServiceUrl')) {
              vm.tosUrl = _.get(trial, 'termsOfServiceUrl');
            }
          });
        }
      });
    }

    function loadCarrier(carrier) {
      for (var i = 0; i < vm.pstnCarrierStatics.length; i++) {
        if (vm.pstnCarrierStatics[i].name === carrier.vendor) {
          vm.carrier = vm.pstnCarrierStatics[i];
          if (vm.carrier.name === THINKTEL) {
            if (vm.orgData.countryCode && vm.orgData.countryCode === CC_CANADA) {
              vm.showCanadaThinkTelLegal = true;
            }
          }
          break;
        }
      }
    }

    function onAgreeClick() {
      vm.loading = true;

      PstnService.setCustomerTrialV2(vm.orgData.id, vm.firstName, vm.lastName, vm.email)
        .then(function () {
          $rootScope.$broadcast(PSTN_TOS_ACCEPT);
          $scope.$close();
        })
        .catch(function (response) {
          Notification.errorResponse(response);
        })
        .finally(function () {
          vm.loading = false;
        });
    }
  }
})();
