(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnProvidersCtrl', PstnProvidersCtrl);

  /* @ngInject */
  function PstnProvidersCtrl($q, $translate, $state, PstnSetup, PstnSetupService, Notification) {
    var vm = this;
    vm.providers = [];
    vm.loading = true;
    vm.selectProvider = selectProvider;

    init();

    ////////////////////////

    function goToNumbers() {
      if (PstnSetup.getProvider().apiExists) {
        goToOrderNumbers();
      } else {
        goToSwivelNumbers();
      }
    }

    function goToSwivelNumbers() {
      $state.go('pstnSetup.swivelNumbers');
    }

    function goToOrderNumbers() {
      $state.go('pstnSetup.orderNumbers');
    }

    function selectProvider(provider) {
      var currentProvider = PstnSetup.getProvider();
      if (!angular.equals(currentProvider, provider)) {
        // If switching providers, clear the stored numbers
        PstnSetup.setNumbers([]);
      }
      PstnSetup.setProvider(provider || {});
    }

    function init() {
      PstnSetupService.listCustomerCarriers(PstnSetup.getCustomerId())
        .then(function (carriers) {
          PstnSetup.setCustomerExists(true);
          if (angular.isArray(carriers) && carriers.length === 0) {
            return PstnSetupService.listCarriers();
          } else {
            PstnSetup.setCarrierExists(true);
            return carriers;
          }
        })
        .catch(function (response) {
          if (response && response.status === 404) {
            return PstnSetupService.listCarriers();
          } else {
            return $q.reject(response);
          }
        })
        .then(function (carriers) {
          angular.forEach(carriers, initCarrier);
          if (PstnSetup.isCustomerExists() && PstnSetup.isCarrierExists() && angular.isArray(vm.providers) && vm.providers.length === 1) {
            selectProvider(vm.providers[0]);
            goToNumbers();
          }
        })
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.carrierListError');
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function initCarrier(carrier) {
      if (carrier.vendor === PstnSetupService.INTELEPEER) {
        vm.providers.push({
          uuid: carrier.uuid,
          name: carrier.name,
          apiExists: carrier.apiExists,
          vendor: carrier.vendor,
          logoSrc: 'images/carriers/logo_intelepeer.svg',
          logoAlt: 'IntelePeer',
          title: 'IntelePeer Pro6S',
          features: [
            $translate.instant('intelepeerFeatures.feature1'),
            $translate.instant('intelepeerFeatures.feature2'),
            $translate.instant('intelepeerFeatures.feature3'),
            $translate.instant('intelepeerFeatures.feature4')
          ],
          selectFn: goToOrderNumbers
        });
      } else if (carrier.vendor === PstnSetupService.TATA) {
        vm.providers.push({
          uuid: carrier.uuid,
          name: carrier.name,
          apiExists: carrier.apiExists,
          vendor: carrier.vendor,
          logoSrc: 'images/carriers/logo_tata_comm.svg',
          logoAlt: 'Tata',
          title: 'Tata Smart Voice Bundle',
          features: [
            $translate.instant('tataFeatures.feature1'),
            $translate.instant('tataFeatures.feature2'),
            $translate.instant('tataFeatures.feature3'),
            $translate.instant('tataFeatures.feature4'),
            $translate.instant('tataFeatures.feature5')
          ],
          selectFn: goToSwivelNumbers
        });
      }
    }
  }
})();
