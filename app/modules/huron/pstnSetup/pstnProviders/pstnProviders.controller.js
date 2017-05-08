(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnProvidersCtrl', PstnProvidersCtrl);

  /* @ngInject */
  function PstnProvidersCtrl($q, $translate, $state, PstnModel, PstnService, PstnServiceAddressService, Orgservice, Notification, FeatureToggleService) {
    var vm = this;
    var INTELEPEER = require('modules/huron/pstn').INTELEPEER;
    var TELSTRA = require('modules/huron/pstn').TELSTRA;
    var TATA = require('modules/huron/pstn').TATA;
    var WESTUC = require('modules/huron/pstn').WESTUC;

    vm.providers = [];
    vm.loading = true;
    vm.enableCarriers = false;
    vm.showCarriers = false;
    vm.selectProvider = selectProvider;
    vm.onProviderReady = onProviderReady;
    vm.onProviderChange = onProviderChange;
    vm.ftThinkTel = false; //feature toggle is used in tpl.html

    init();

    ////////////////////////

    function goToNumbers() {
      if (PstnModel.getProvider().apiImplementation === "SWIVEL") {
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

    function selectProvider(provider) {
      var currentProvider = PstnModel.getProvider();
      if (!angular.equals(currentProvider, provider)) {
        // If switching providers, clear provider specific data
        PstnModel.clearProviderSpecificData();
      }
      PstnModel.setProvider(provider || {});
    }

    function catchNotFound(response) {
      if (_.get(response, 'status') !== 404) {
        return $q.reject(response);
      }
    }

    function initCustomer() {
      PstnModel.setCustomerExists(true);
    }

    function initCarriers() {
      // lookup customer carriers
      return PstnService.getCustomer(PstnModel.getCustomerId())
        .then(initCustomer)
        .then(_.partial(PstnService.listCustomerCarriers, PstnModel.getCustomerId()))
        .then(function (carriers) {
          if (_.isArray(carriers) && carriers.length > 0) {
            PstnModel.setCarrierExists(true);
          }
          return carriers;
        })
        .catch(catchNotFound)
        // if none, lookup reseller carriers
        .then(function (carriers) {
          if (_.isArray(carriers) && carriers.length > 0) {
            return carriers;
          } else {
            return PstnService.listResellerCarriers()
              .then(function (carriers) {
                PstnModel.setResellerExists(true);
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
            return PstnService.listDefaultCarriers();
          }
        })
        // process carriers
        .then(_.partialRight(_.forEach, initCarrier))
        .catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.carrierListError');
        });
    }

    function processSelectedProviders() {
      if (PstnModel.isCustomerExists() && PstnModel.isCarrierExists() && _.isArray(vm.providers) && vm.providers.length === 1) {
        PstnModel.setProvider(vm.providers[0]);
        goToNumbers();
      } else if (_.isArray(vm.providers) && vm.providers.length === 1) {
        PstnModel.setSingleCarrierReseller(true);
        PstnModel.setProvider(vm.providers[0]);
        goToNumbers();
      }
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

    function initCarrier(carrier) {
      var carrierObj = {
        uuid: carrier.uuid,
        name: carrier.name,
        apiImplementation: carrier.apiImplementation,
        vendor: carrier.vendor,
        countryCode: carrier.countryCode,
        country: carrier.country,
        title: carrier.displayName || carrier.name,
      };
      if (carrier.vendor === INTELEPEER) {
        _.extend(carrierObj, {

          logoSrc: 'images/carriers/logo_intelepeer.svg',
          logoAlt: 'IntelePeer',
          docSrc: 'docs/carriers/IntelePeerVoicePackage.pdf',
          features: [
            $translate.instant('intelepeerFeatures.feature1'),
            $translate.instant('intelepeerFeatures.feature2'),
            $translate.instant('intelepeerFeatures.feature3'),
            $translate.instant('intelepeerFeatures.feature4'),
          ],
          selectFn: goToNumbers,
        });
      } else if (carrier.vendor === TATA) {
        _.extend(carrierObj, {
          logoSrc: 'images/carriers/logo_tata_comm.svg',
          logoAlt: 'Tata',
          features: [
            $translate.instant('tataFeatures.feature1'),
            $translate.instant('tataFeatures.feature2'),
            $translate.instant('tataFeatures.feature3'),
            $translate.instant('tataFeatures.feature4'),
            $translate.instant('tataFeatures.feature5'),
          ],
          selectFn: goToNumbers,
        });
      } else if (carrier.vendor === TELSTRA) {
        _.extend(carrierObj, {
          logoSrc: 'images/carriers/logo_telstra.svg',
          logoAlt: 'Telstra',
          features: [],
          selectFn: goToNumbers,
        });
      } else if (carrier.vendor === WESTUC) {
        _.extend(carrierObj, {
          logoSrc: 'images/carriers/logo_westuc.svg',
          logoAlt: 'West Corporation',
          features: [
            $translate.instant('westucFeatures.feature1'),
            $translate.instant('westucFeatures.feature2'),
            $translate.instant('westucFeatures.feature3'),
            $translate.instant('westucFeatures.feature4'),
            $translate.instant('westucFeatures.feature5'),
            $translate.instant('westucFeatures.feature6'),
          ],
          selectFn: goToNumbers,
        });
      }
      vm.providers.push(carrierObj);
    }

    function init() {
      FeatureToggleService.supports(FeatureToggleService.features.huronSupportThinktel).then(function (ftThinkTel) {
        vm.ftThinkTel = ftThinkTel;
        if (!vm.ftThinkTel) {
          initOriginal();
        } else {
          initPstnCustomer();
        }
      }).catch(function () {
        initOriginal();
      });
    }

    function initOriginal() {
      $q.all([initCarriers(), initSites()])
        .then(processSelectedProviders)
        .finally(function () {
          vm.loading = false;
        });
    }

    function initPstnCustomer() {
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
            PstnModel.setProvider(PstnModel.getCarriers()[0]);
            goToNumbers();
          }
        }
        vm.loading = false;
        vm.showCarriers = true;
      });
    }

    function onProviderChange() {
      goToNumbers();
    }
  }
})();
