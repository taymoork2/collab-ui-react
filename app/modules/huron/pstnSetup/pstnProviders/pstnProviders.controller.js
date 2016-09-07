(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnProvidersCtrl', PstnProvidersCtrl);

  /* @ngInject */
  function PstnProvidersCtrl($q, $translate, $state, PstnSetup, PstnSetupService, PstnServiceAddressService, Notification) {
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
      if (!PstnSetup.isCustomerExists()) {
        $state.go('pstnSetup.contractInfo');
      } else if (!PstnSetup.isSiteExists()) {
        $state.go('pstnSetup.serviceAddress');
      } else {
        $state.go('pstnSetup.orderNumbers');
      }
    }

    function selectProvider(provider) {
      var currentProvider = PstnSetup.getProvider();
      if (!angular.equals(currentProvider, provider)) {
        // If switching providers, clear provider specific data
        PstnSetup.clearProviderSpecificData();
      }
      PstnSetup.setProvider(provider || {});
    }

    function catchNotFound(response) {
      if (_.get(response, 'status') !== 404) {
        return $q.reject(response);
      }
    }

    function initCustomer(customer) {
      PstnSetup.setIsTrial(_.get(customer, 'trial', false));
      PstnSetup.setCustomerExists(true);
    }

    function initCarriers() {
      // lookup customer carriers
      return PstnSetupService.getCustomer(PstnSetup.getCustomerId())
        .then(initCustomer)
        .then(_.partial(PstnSetupService.listCustomerCarriers, PstnSetup.getCustomerId()))
        .then(function (carriers) {
          if (_.isArray(carriers) && carriers.length > 0) {
            PstnSetup.setCarrierExists(true);
          }
          return carriers;
        })
        .catch(catchNotFound)
        // if none, lookup reseller carriers
        .then(function (carriers) {
          if (_.isArray(carriers) && carriers.length > 0) {
            return carriers;
          } else {
            return PstnSetupService.listResellerCarriers()
              .then(function (carriers) {
                PstnSetup.setResellerExists(true);
                return carriers;
              });
          }
        })
        .catch(catchNotFound)
        // if none, lookup default carriers
        .then(function (carriers) {
          if (_.isArray(carriers) && carriers.length > 0) {
            return carriers;
          } else {
            return PstnSetupService.listDefaultCarriers();
          }
        })
        // process carriers
        .then(_.partialRight(_.forEach, initCarrier))
        .catch(_.partialRight(Notification.errorResponse, 'pstnSetup.carrierListError'));
    }

    function processSelectedProviders() {
      if (PstnSetup.isCustomerExists() && PstnSetup.isCarrierExists() && _.isArray(vm.providers) && vm.providers.length === 1) {
        PstnSetup.setProvider(vm.providers[0]);
        goToNumbers();
      } else if (_.isArray(vm.providers) && vm.providers.length === 1) {
        PstnSetup.setSingleCarrierReseller(true);
        PstnSetup.setProvider(vm.providers[0]);
        goToNumbers();
      }
    }

    function initSites() {
      return PstnServiceAddressService.listCustomerSites(PstnSetup.getCustomerId())
        .then(function (sites) {
          // If we have sites, set the flag and store the first site address
          if (_.isArray(sites) && _.size(sites)) {
            PstnSetup.setSiteExists(true);
          }
        })
        .catch(function (response) {
          //TODO temp remove 500 status after terminus if fixed
          if (response && response.status !== 404 && response.status !== 500) {
            Notification.errorResponse(response, 'pstnSetup.listSiteError');
          }
        });
    }

    function init() {
      $q.all([initCarriers(), initSites()])
        .then(processSelectedProviders)
        .finally(function () {
          vm.loading = false;
        });
    }

    function initCarrier(carrier) {
      var carrierObj = {
        uuid: carrier.uuid,
        name: carrier.name,
        apiExists: carrier.apiExists,
        vendor: carrier.vendor,
        countryCode: carrier.countryCode,
        country: carrier.country,
        title: carrier.displayName || carrier.name
      };
      if (carrier.vendor === PstnSetupService.INTELEPEER) {
        _.extend(carrierObj, {

          logoSrc: 'images/carriers/logo_intelepeer.svg',
          logoAlt: 'IntelePeer',
          docSrc: 'docs/carriers/IntelePeerVoicePackage.pdf',
          features: [
            $translate.instant('intelepeerFeatures.feature1'),
            $translate.instant('intelepeerFeatures.feature2'),
            $translate.instant('intelepeerFeatures.feature3'),
            $translate.instant('intelepeerFeatures.feature4')
          ],
          selectFn: goToNumbers
        });
      } else if (carrier.vendor === PstnSetupService.TATA) {
        _.extend(carrierObj, {
          logoSrc: 'images/carriers/logo_tata_comm.svg',
          logoAlt: 'Tata',
          features: [
            $translate.instant('tataFeatures.feature1'),
            $translate.instant('tataFeatures.feature2'),
            $translate.instant('tataFeatures.feature3'),
            $translate.instant('tataFeatures.feature4'),
            $translate.instant('tataFeatures.feature5')
          ],
          selectFn: goToNumbers
        });
      } else if (carrier.vendor === PstnSetupService.TELSTRA) {
        _.extend(carrierObj, {
          logoSrc: 'images/carriers/logo_telstra.svg',
          logoAlt: 'Telstra',
          features: [],
          selectFn: goToNumbers
        });
      } else if (carrier.vendor === PstnSetupService.WESTUC) {
        _.extend(carrierObj, {
          logoSrc: 'images/carriers/logo_westuc.jpg',
          logoAlt: 'West Corporation',
          features: [],
          selectFn: goToNumbers
        });
      }
      vm.providers.push(carrierObj);
    }
  }
})();
