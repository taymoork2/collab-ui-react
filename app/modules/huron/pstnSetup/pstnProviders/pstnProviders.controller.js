(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnProvidersCtrl', PstnProvidersCtrl);

  /* @ngInject */
  function PstnProvidersCtrl($state, PstnModel, PstnService, PstnServiceAddressService, Orgservice, Notification) {
    var vm = this;

    vm.loading = true;
    vm.enableCarriers = false;
    vm.showCarriers = false;
    vm.onProviderReady = onProviderReady;
    vm.onProviderChange = onProviderChange;

    init();

    ////////////////////////
    function init() {
      //Get and save organization/customer information
      var params = {
        basicInfo: true,
      };
      Orgservice.getOrg(function (data) {
        if (data.countryCode) {
          PstnModel.setCountryCode(data.countryCode);
        }
        PstnService.getCustomerV2(PstnModel.getCustomerId())
          .then(function () {
            PstnModel.setCustomerExists(true);
          })
          .finally(function () {
            vm.enableCarriers = true;
          });
      }, PstnModel.getCustomerId(), params);
    }

    function onProviderReady() {
      initSites().then(function () {
        //If new PSTN setup show all the carriers even if there only one
        if (PstnModel.isCarrierExists() && PstnModel.isCustomerExists()) {
          // Only 1 carrier should exist for a customer
          if (PstnModel.getCarriers().length === 1) {
            PstnModel.setSingleCarrierReseller(true);
          }
        }
        vm.loading = false;
        vm.showCarriers = true;
      });
    }

    function initSites() {
      return PstnServiceAddressService.listCustomerSites(PstnModel.getCustomerId())
        .then(function (sites) {
          // If we have sites, set the flag and store the first site address
          if (_.isArray(sites) && _.size(sites)) {
            PstnModel.setSiteExists(true);
          }
        })
        .catch(function (response) {
          //TODO temp remove 500 status after terminus if fixed
          if (response && response.status !== 404 && response.status !== 500) {
            Notification.errorResponse(response, 'pstnSetup.listSiteError');
          }
        });
    }

    function onProviderChange() {
      goToNumbers();
    }

    function goToNumbers() {
      if (PstnModel.getProvider().apiImplementation === 'SWIVEL') {
        goToSwivelNumbers();
      } else {
        goToOrderNumbers();
      }
    }

    function goToSwivelNumbers() {
      $state.go('pstnSetup.swivelNumbers');
    }

    function goToOrderNumbers() {
      if (!PstnModel.isCustomerExists()) {
        $state.go('pstnSetup.contractInfo');
      } else if (!PstnModel.isSiteExists()) {
        $state.go('pstnSetup.serviceAddress');
      } else {
        $state.go('pstnSetup.orderNumbers');
      }
    }
  }
})();
