(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerOverviewCtrl', CustomerOverviewCtrl);

  /* @ngInject */
  function CustomerOverviewCtrl($q, $state, $stateParams, $translate, $window, $modal, Authinfo, BrandService, Config, FeatureToggleService, identityCustomer, Log, newCustomerViewToggle, Notification, Orgservice, PartnerService, TrialService) {
    var vm = this;

    vm.currentCustomer = $stateParams.currentCustomer;
    vm.customerName = vm.currentCustomer.customerName;
    vm.customerOrgId = vm.currentCustomer.customerOrgId;

    vm.reset = reset;
    vm.saveLogoSettings = saveLogoSettings;
    vm.launchCustomerPortal = launchCustomerPortal;
    vm.openEditTrialModal = openEditTrialModal;
    vm.getDaysLeft = getDaysLeft;
    vm.isSquaredUC = isSquaredUC();
    vm.getIsSetupDone = getIsSetupDone;
    vm.isOwnOrg = isOwnOrg;
    vm.deleteTestOrg = deleteTestOrg;
    vm.isPartnerCreator = isPartnerCreator;

    vm.uuid = '';
    vm.logoOverride = false;
    vm.showRoomSystems = false;
    vm.usePartnerLogo = true;
    vm.allowCustomerLogos = false;
    vm.allowCustomerLogoOrig = false;
    vm.isTest = false;
    vm.isDeleting = false;
    vm.isOrgSetup = false;
    vm.isUpdateStatusEnabled = false;

    vm.partnerOrgId = Authinfo.getOrgId();
    vm.partnerOrgName = Authinfo.getOrgName();
    vm.isPartnerAdmin = Authinfo.isPartnerAdmin();
    vm.currentAdminId = Authinfo.getUserId();

    vm.freeOrPaidServices = null;
    vm.hasMeeting = false;

    vm.newCustomerViewToggle = newCustomerViewToggle;

    if (Authinfo.isCare()) {
      FeatureToggleService.atlasCareTrialsGetStatus()
        .then(function (result) {
          if (_.find(vm.currentCustomer.offers, {
            id: Config.offerTypes.roomSystems
          })) {
            vm.showRoomSystems = true;
          }
          setOffers(result);
        });
    }

    FeatureToggleService.atlasCustomerListUpdateGetStatus()
      .then(function (result) {
        vm.isUpdateStatusEnabled = result;
      });

    function setOffers(isCareEnabled) {
      var licAndOffers = PartnerService.parseLicensesAndOffers(vm.currentCustomer, isCareEnabled);
      vm.offer = vm.currentCustomer.offer = _.get(licAndOffers, 'offer');
      if (vm.newCustomerViewToggle) {
        vm.freeOrPaidServices = PartnerService.getFreeOrActiveServices(vm.currentCustomer, isCareEnabled);
        vm.hasMeeting = _.some(vm.freeOrPaidServices, {
          isMeeting: true
        });
      }
    }

    init();

    vm.toggleAllowCustomerLogos = _.debounce(function (value) {
      if (value) {
        BrandService.enableCustomerLogos(vm.customerOrgId);
      } else {
        BrandService.disableCustomerLogos(vm.customerOrgId);
      }
    }, 2000, {
      'leading': true,
      'trailing': false
    });

    function init() {
      initCustomer();
      getLogoSettings();
      getIsTestOrg();
      getIsSetupDone();
    }

    function resetForm() {
      if (vm.form) {
        vm.allowCustomerLogos = vm.allowCustomerLogoOrig;
        vm.form.$setPristine();
        vm.form.$setUntouched();
      }
    }

    function reset() {
      resetForm();
    }

    function saveLogoSettings() {
      vm.toggleAllowCustomerLogos(vm.allowCustomerLogos);
      vm.form.$setPristine();
      vm.form.$setUntouched();
    }

    function initCustomer() {
      if (angular.isUndefined(vm.currentCustomer.customerEmail)) {
        vm.currentCustomer.customerEmail = identityCustomer.email;
      }
    }

    function getLogoSettings() {
      BrandService.getSettings(Authinfo.getOrgId())
        .then(function (settings) {
          vm.logoOverride = settings.allowCustomerLogos;
        });
      BrandService.getSettings(vm.customerOrgId)
        .then(function (settings) {
          vm.usePartnerLogo = settings.usePartnerLogo;
          vm.allowCustomerLogos = settings.allowCustomerLogos;
          vm.allowCustomerLogoOrig = settings.allowCustomerLogos;
        });
    }

    function launchCustomerPortal() {
      $q.resolve(vm.isPartnerAdmin && PartnerService.modifyManagedOrgs(vm.customerOrgId))
      .then(openCustomerPortal)
      .catch(function (response) {
        Notification.errorWithTrackingId(response, 'customerPage.launchCustomerPortalError');
        return response;
      });
    }

    function openCustomerPortal() {
      $window.open($state.href('login_swap', {
        customerOrgId: vm.customerOrgId,
        customerOrgName: vm.customerName
      }));
    }

    function openEditTrialModal() {
      TrialService.getTrial(vm.currentCustomer.trialId).then(function (response) {
        $state.go('trialEdit.info', {
          currentTrial: vm.currentCustomer,
          details: response
        })
          .then(function () {
            $state.modal.result.then(function () {
              $state.go('partnercustomers.list', {}, {
                reload: true
              });
            });
          });
      });
    }

    function getDaysLeft(daysLeft) {
      if (daysLeft < 0) {
        return $translate.instant('customerPage.expired');
      } else if (daysLeft === 0) {
        return $translate.instant('customerPage.expiresToday');
      } else {
        return daysLeft;
      }
    }

    function isSquaredUC() {
      if (angular.isArray(identityCustomer.services)) {
        return _.contains(identityCustomer.services, Config.entitlements.huron);
      }
      return false;
    }

    function isPartnerCreator() {
      return TrialService.getTrial(vm.currentCustomer.trialId)
        .then(function (response) {
          return response.createdBy === vm.currentAdminId;
        })
        .catch(function (error) {
          Notification.error('customerPage.errGetTrial', {
            customer: vm.customerName,
            message: error.data.message
          });
          return false;
        });
    }

    function getIsSetupDone() {
      Orgservice.isSetupDone(vm.customerOrgId)
        .then(function (results) {
          vm.isOrgSetup = results;
        })
        .catch(function (error) {
          // Allow trials created by another partner admin to pass through this error.
          // The trial will not generate the error once the View/Setup Customer button
          // is pressed. See US11827
          isPartnerCreator()
            .then(function (isPartnerCreator) {
              if (isPartnerCreator) {
                Notification.error('customerPage.isSetupDoneError', {
                  orgName: vm.customerName,
                  message: error.data.message
                });
              }
            });
        });
    }

    function isOwnOrg() {
      return vm.customerName === Authinfo.getOrgName();
    }

    function getIsTestOrg() {
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          vm.isTest = data.isTestOrg;
        } else {
          Log.error('Query org info failed. Status: ' + status);
        }
      }, vm.customerOrgId);
    }

    function deleteTestOrg() {
      if (vm.isTest) {
        $modal.open({
          type: 'dialog',
          templateUrl: 'modules/core/customers/customerOverview/customerDeleteConfirm.tpl.html',
          controller: function () {
            var ctrl = this;
            ctrl.orgName = vm.customerName;
          },
          controllerAs: 'ctrl'
        }).result.then(function () {
          // delete the customer
          vm.isDeleting = true;
          Orgservice.deleteOrg(vm.customerOrgId).then(function () {
            $state.go('partnercustomers.list');
            Notification.success('customerPage.deleteOrgSuccess', {
              orgName: vm.customerName
            });
          }).catch(function (error) {
            vm.isDeleting = false;
            Notification.error('customerPage.deleteOrgError', {
              orgName: vm.customerName,
              message: error.data.message
            });
          });
        });
      }
    }

  }
})();
