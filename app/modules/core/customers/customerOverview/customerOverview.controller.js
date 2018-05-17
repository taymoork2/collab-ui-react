require('./_customer-overview.scss');

(function () {
  'use strict';

  var CS_UnSigned = require('modules/huron/pstn').ContractStatus.UnSigned;
  var CS_UnKnown = require('modules/huron/pstn').ContractStatus.UnKnown;

  angular
    .module('Core')
    .controller('CustomerOverviewCtrl', CustomerOverviewCtrl);

  /* @ngInject */
  function CustomerOverviewCtrl($modal, $q, $state, $stateParams, $translate, $window, AccountOrgService, Analytics, Authinfo, BrandService, Config, FeatureToggleService, identityCustomer, Log, Notification, Orgservice, PartnerService, PstnService, PstnModel, TrialPstnService, TrialService, Userservice) {
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
    vm.hasSubviews = hasSubviews;
    vm.hasSubview = hasSubview;
    vm.goToSubview = goToSubview;
    vm.showContractIncompleteFn = showContractIncompleteFn;

    vm.uuid = '';
    vm.logoOverride = false;
    vm.showRoomSystems = false;
    vm.usePartnerLogo = true;
    vm.allowCustomerLogos = false;
    vm.allowCustomerLogoOrig = false;
    vm.isTest = false;
    vm.countryCode = 'US';
    vm.isDeleting = false;
    vm.isOrgSetup = null;
    vm.isUpdateStatusEnabled = true;
    vm.isProPackEnabled = false;
    vm.isMediaFusionEnabled = false;
    vm.isNewPatchFlow = false;

    //Feature Toggle -- HI1635
    vm.showContractIncomplete = false;
    vm.isHI1635Enabled = false;

    vm.partnerOrgId = Authinfo.getOrgId();
    vm.isPartnerAdmin = Authinfo.isPartnerAdmin();
    vm.currentAdminId = Authinfo.getUserId();

    vm.freeOrPaidServices = [];
    vm.trialActions = [];

    vm._helpers = {
      canUpdateLicensesForSelf: canUpdateLicensesForSelf,
      openCustomerPortal: openCustomerPortal,
      updateUsers: updateUsers,
    };


    var QTY = _.toUpper($translate.instant('common.quantity'));
    var FREE = _.toUpper($translate.instant('customerPage.free'));

    vm.loadingCustomerPortal = true;

    $q.all([
      FeatureToggleService.atlasCareTrialsGetStatus(),
      FeatureToggleService.atlasCareInboundTrialsGetStatus(),
      FeatureToggleService.atlasITProPackGetStatus(),
      FeatureToggleService.atlasJira2126UseAltEndpointGetStatus(),
      FeatureToggleService.hI1635GetStatus(),
    ]).then(function (results) {
      if (_.find(vm.currentCustomer.offers, {
        id: Config.offerTypes.roomSystems,
      })) {
        vm.showRoomSystems = true;
      }
      var isCareEnabled = results[0];
      var isAdvanceCareEnabled = results[1];
      setOffers(isCareEnabled, isAdvanceCareEnabled);
      vm.isProPackEnabled = results[2];
      vm.isNewPatchFlow = results[3];
      vm.isHI1635Enabled = results[4];
    });

    function showContractIncompleteFn() {
      return vm.isHI1635Enabled && vm.showContractIncomplete;
    }

    function setOffers(isCareEnabled, isAdvanceCareEnabled) {
      var licAndOffers = PartnerService.parseLicensesAndOffers(vm.currentCustomer, {
        isCareEnabled: isCareEnabled,
        isAdvanceCareEnabled: isAdvanceCareEnabled,
        isTrial: true,
      });
      vm.offer = vm.currentCustomer.offer = _.get(licAndOffers, 'offer');
      vm.trialServices = _.chain(vm.currentCustomer.offer)
        .get('trialServices')
        .map(function (trialService) {
          return _.assign({}, trialService, {
            detail: trialService.qty + ' ' + QTY,
            actionAvailable: hasSubview(trialService),
          });
        })
        .value();
      vm.freeOrPaidServices = _.map(PartnerService.getFreeOrActiveServices(vm.currentCustomer, {
        isCareEnabled: isCareEnabled,
        isTrial: false,
      }), function (service) {
        return _.assign({}, service, {
          detail: service.free ? FREE : service.qty + ' ' + QTY,
          actionAvailable: hasSubview(service),
        });
      });
    }

    init();

    vm.toggleAllowCustomerLogos = _.debounce(function (value) {
      if (value) {
        BrandService.enableCustomerLogos(vm.customerOrgId);
      } else {
        BrandService.disableCustomerLogos(vm.customerOrgId);
      }
    }, 2000, {
      leading: true,
      trailing: false,
    });

    function init() {
      initCustomer();
      initTrialActions();
      initSignedContractStatus();
      getLogoSettings();
      getIsSetupDone();
      getCountryCode();
      Orgservice.isTestOrg(vm.customerOrgId)
        .then(function (isTestOrg) {
          vm.isTest = isTestOrg;
        });
    }

    function initTrialActions() {
      if (vm.isOwnOrg()) {
        return;
      }
      if (PartnerService.canAdminTrial(vm.currentCustomer.licenseList)) {
        vm.trialActions.push({
          actionKey: 'customerPage.edit',
          actionFunction: openEditTrialModal,
        });
      } else {
        if (!vm.currentCustomer.trialId && _.get(vm.currentCustomer, 'licenseList.length', 0) > 0) {
          vm.trialActions.push({
            actionKey: 'customerPage.addTrial',
            actionFunction: openAddTrialModal,
          });
        }
      }
    }

    function initSignedContractStatus() {
      if (vm.currentCustomer.purchased) {
        PstnService.getCustomerV2(vm.currentCustomer.customerOrgId, { deep: true })
          .then(function (response) {
            var isTrialAccount = _.get(response, 'trial');
            var contractStatus = _.get(response, 'contractStatus');
            PstnModel.setContractStatus(contractStatus);
            if (contractStatus === CS_UnSigned && !isTrialAccount) {
              vm.showContractIncomplete = true;
            }
          })
          .catch(function () {
            vm.showContractIncomplete = false; //Don't show if unknown
            PstnModel.setContractStatus(CS_UnKnown);
          });
      }
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
      if (_.isUndefined(vm.currentCustomer.customerEmail)) {
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

    // TODO: understand why this is needed
    function LicenseFeature(name, bAdd) {
      this['id'] = name.toString();
      this['idOperation'] = bAdd ? 'ADD' : 'REMOVE';
      this['properties'] = null;
    }

    // TODO: understand why this is needed and possibly move this somewhere more appropriate
    function collectLicenseIdsForWebexSites(liclist) {
      var licIds = [];
      var i = 0;
      if (_.isUndefined(liclist)) {
        liclist = [];
      }
      for (i = 0; i < liclist.length; i++) {
        var lic = liclist[i];
        var licId = lic.licenseId;
        var lictype = lic.licenseType;
        var isConfType = lictype === 'CONFERENCING';
        if (isConfType) {
          licIds.push(new LicenseFeature(licId, (_.isUndefined(lic.siteUrl) === false)));
        }
      }
      return licIds;
    } //collectLicenses

    /* algendel 9/25/17 this uses UI to patch the permissions. There is a new endpoint. This should
    /* remain in place until the new endpoint is thoroughly tested */

    function updateUserAndCustomerOrgLegacy() {
      // TODO: revisit this function
      // - a simpler version was implemented in '649c251aeaefdedd57620e9fd3f4cd488b87b1f5'
      //   ...however, it did not include the logic to make the appropriate call to
      //   'Userservice.updateUsers()'
      // - this call is required in order to patch the partner-admin user as appropriate such that
      //   admin access to webex sites is enabled

      var liclist = vm.currentCustomer.licenseList;
      var licIds = collectLicenseIdsForWebexSites(liclist);
      var partnerEmail = Authinfo.getPrimaryEmail();
      var emailObj = {
        address: partnerEmail,
      };
      var promise = $q.resolve();
      if (vm.isPartnerAdmin) {
        promise = PartnerService.modifyManagedOrgs(vm.customerOrgId);
      }

      return promise.then(function () {
        // non-admin users (e.g. sales admins) should not try to update their own licenses, but
        // instead launch the portal immediately
        if (!vm._helpers.canUpdateLicensesForSelf()) {
          return;
        }

        if (licIds.length) {
          return vm._helpers.updateUsers([emailObj], licIds);
        }

        return AccountOrgService.getAccount(vm.customerOrgId).then(function (response) {
          var updateUsersList = [];
          var accounts = _.get(response, 'data.accounts', []);
          _.forEach(accounts, function (account) {
            var accountLicIds = collectLicenseIdsForWebexSites(account.licenses);
            if (accountLicIds.length) {
              updateUsersList.push(vm._helpers.updateUsers([emailObj], licIds));
            }
          });
          return $q.all(updateUsersList);
        });
      });
    }

    /* algendel 9/25/17 this uses the new endpoint instead of relying on patching in the ui */
    function updateUserAndCustomerOrg() {
      return PartnerService.updateOrgForCustomerView(vm.customerOrgId);
    }

    function launchCustomerPortal() {
      vm.loadingCustomerPortal = true;
      var promise = (vm.isNewPatchFlow) ? updateUserAndCustomerOrg() : updateUserAndCustomerOrgLegacy();
      return promise
        .then(vm._helpers.openCustomerPortal)
        .catch(function (response) {
          Notification.errorWithTrackingId(response, 'customerPage.launchCustomerPortalError');
          return response;
        })
        .finally(function () {
          vm.loadingCustomerPortal = false;
        });
    }

    function canUpdateLicensesForSelf() {
      return Authinfo.isAdmin();
    }

    // TODO: track analytic behavior and see if this is being used correctly or can be removed
    function updateUsers(userInfoList, licenses) {
      if (!vm._helpers.canUpdateLicensesForSelf()) {
        Notification.error('customerPage.updateLicensesAuthError');
        return $q.reject();
      }

      return Userservice.updateUsers(userInfoList, licenses, null, 'updateUserLicense', _.noop)
        .catch(function (response) {
          trackPatchUsersResponse();
          return $q.reject(response);
        })
        .then(function (response) {
          trackPatchUsersResponse(response);
          return response;
        });
    }

    function trackPatchUsersResponse(response) {
      var userResponses = _.get(response, 'data.userResponse');
      var httpResponses = _.map(userResponses, 'httpStatus');
      var hasError = _.isEmpty(httpResponses) || _.some(httpResponses, function (httpResponse) {
        return httpResponse >= 400;
      });
      var hasSuccess = _.some(httpResponses, function (httpResponse) {
        return httpResponse >= 200 && httpResponse < 300;
      });
      Analytics.trackEvent(Analytics.sections.PARTNER.eventNames.LAUNCH_CUSTOMER_PATCH_USERS, {
        hasError: hasError,
        hasSuccess: hasSuccess,
        partnerUserId: Authinfo.getUserId(),
        partnerOrgId: Authinfo.getUserOrgId(),
      });
    }

    function openCustomerPortal() {
      var openWindow = $window.open($state.href('login', {
        customerOrgId: vm.customerOrgId,
      }));

      if (!openWindow || openWindow.closed || typeof openWindow.closed === 'undefined') {
        $modal.open({
          type: 'dialog',
          template: require('modules/core/customers/customerOverview/popUpBlocked.tpl.html'),
        });
      }

      return openWindow;
    }

    function openEditTrialModal() {
      //var isAddTrial = options.isAddTrial;
      TrialPstnService.setCountryCode(vm.countryCode);
      TrialService.getTrial(vm.currentCustomer.trialId).then(function (response) {
        var route = TrialService.getEditTrialRoute(vm.currentCustomer, response);
        $state.go(route.path, route.params).then(function () {
          $state.modal.result.then(function () {
            $state.go('partnercustomers.list', {}, {
              reload: true,
            });
          });
        });
      });
    }

    function openAddTrialModal() {
      var route = TrialService.getAddTrialRoute(vm.currentCustomer);
      $state.go(route.path, route.params).then(function () {
        $state.modal.result.then(function () {
          $state.go('partnercustomers.list', {}, {
            reload: true,
          });
        });
      });
    }

    function getDaysLeft(daysLeft) {
      if (daysLeft < 0) {
        return $translate.instant('customerPage.expired');
      } else if (daysLeft === 0) {
        return $translate.instant('customerPage.expiresToday');
      }
      return $translate.instant('customerPage.daysLeft', { days: daysLeft }, 'messageformat');
    }

    function isSquaredUC() {
      if (_.isArray(identityCustomer.services)) {
        return _.includes(identityCustomer.services, Config.entitlements.huron);
      }
      return false;
    }

    function isPartnerCreator() {
      return TrialService.getTrial(vm.currentCustomer.trialId)
        .then(function (response) {
          return response.createdBy === vm.currentAdminId;
        })
        .catch(function (error) {
          Notification.errorResponse(error, 'customerPage.errGetTrial', {
            customer: vm.customerName,
          });
          return false;
        });
    }

    function hasSubviews(services) {
      return _.some(services, function (service) {
        return hasSubview(service);
      });
    }

    function hasSubview(service) {
      var hasWebexOrMultMeeting = (service.hasWebex === true || service.isMeeting || service.isSparkCare);
      return hasWebexOrMultMeeting || service.isRoom || service.isSparkCare;
    }

    function goToSubview(service, options) {
      if (service.hasWebex || service.isMeeting) {
        var isTrial = _.get(options, 'isTrial', false);
        var services = isTrial ? PartnerService.getTrialMeetingServices(vm.currentCustomer.licenseList, vm.currentCustomer.customerOrgId) : service.sub;
        $state.go('customer-overview.meetingDetail', {
          meetingLicenses: services,
        });
      } else if (service.isRoom) {
        $state.go('customer-overview.sharedDeviceDetail', {
          sharedDeviceLicenses: service.sub,
        });
      } else if (service.isSparkCare) {
        $state.go('customer-overview.careLicenseDetail', {
          careLicense: service.sub,
        });
      }
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
                Notification.errorResponse(error, 'customerPage.isSetupDoneError', {
                  orgName: vm.customerName,
                });
              }
            });
        })
        .finally(function () {
          vm.loadingCustomerPortal = false;
        });
    }

    function isOwnOrg() {
      return vm.customerName === Authinfo.getOrgName();
    }

    // Refactor this out.
    // Preferably call another service for this, or call once and store into universal data object
    // we are setting vm.isMediaFusionEnabled from orgsetting to block deletion of org inmediafusion is enabled
    function getCountryCode() {
      var params = {
        basicInfo: true,
      };
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          if (data.countryCode) {
            vm.countryCode = data.countryCode;
          }
          if (data.orgSettings) {
            vm.isMediaFusionEnabled = data.orgSettings.isMediaFusionEnabled;
          }
        } else {
          Log.error('Query org info failed. Status: ' + status);
        }
      }, vm.customerOrgId, params);
    }

    //if vm.isMediaFusionEnabled then we ask the user to deactivate Video Mesh service and not allowing deletion.
    function deleteTestOrg() {
      if (vm.isTest) {
        if (vm.isMediaFusionEnabled) {
          $modal.open({
            type: 'dialog',
            template: require('modules/core/customers/customerOverview/customerDeleteConfirmErrorHMS.tpl.html'),
            controller: function () {
              var ctrl = this;
              ctrl.orgName = vm.customerName;
            },
            controllerAs: 'ctrl',
          });
        } else {
          $modal.open({
            type: 'dialog',
            template: require('modules/core/customers/customerOverview/customerDeleteConfirm.tpl.html'),
            controller: function () {
              var ctrl = this;
              ctrl.orgName = vm.customerName;
            },
            controllerAs: 'ctrl',
          }).result.then(function () {
            // delete the customer
            vm.isDeleting = true;
            Orgservice.deleteOrg(vm.customerOrgId).then(function () {
              $state.go('partnercustomers.list');
              Notification.success('customerPage.deleteOrgSuccess', {
                orgName: vm.customerName,
              });
            }).catch(function (error) {
              vm.isDeleting = false;
              Notification.errorResponse(error, 'customerPage.deleteOrgError', {
                orgName: vm.customerName,
              });
            });
          });
        }
      }
    }
  }
})();
