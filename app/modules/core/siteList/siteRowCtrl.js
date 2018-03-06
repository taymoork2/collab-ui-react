require('./_site-list.scss');

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExSiteRowCtrl', WebExSiteRowCtrl);

  /*@ngInject*/

  function WebExSiteRowCtrl(
    $log,
    $modal,
    $scope,
    $sce,
    $state,
    $stateParams,
    $timeout,
    $translate,
    accountLinkingPhase2,
    Auth,
    Authinfo,
    ModalService,
    Notification,
    SetupWizardService,
    TokenService,
    WebExUtilsFact,
    WebExSiteRowService,
    WebExSiteService, Utils) {
    var vm = this;
    var showSiteMgmntEmailPattern = '^ordersimp-.*@mailinator.com';
    var actions = {
      ADD: 'add',
      DELETE: 'delete',
      REDISTRIBUTE: 'redistribute',
    };
    var dontShowLinkedSites = accountLinkingPhase2;

    vm.init = function () {
      vm.isShowAddSite = false;
      vm.showGridData = false;
      vm.canAddSite = WebExSiteRowService.canAddSite();
      vm.isAdminPage = Utils.isAdminPage();
      vm.subscriptions = Authinfo.getSubscriptions();
      WebExSiteRowService.shouldShowSiteManagement(showSiteMgmntEmailPattern).then(function (result) {
        vm.isShowAddSite = result;
      });
      vm.initializeData();
      WebExSiteService.getAllCenterDetailsFromSubscriptions().then(function (results) {
        vm.allCenterDetailsForSubscriptions = results;
      });
    };

    vm.initializeData = function () {
      WebExSiteRowService.initSiteRows(dontShowLinkedSites);
      vm.gridOptions = WebExSiteRowService.getGridOptions();
      vm.gridOptions.appScopeProvider = vm;
      vm.showGridData = true;
    };

    $log.debug('StateParams in sitreRowCrtl', $stateParams);

    vm.linkToReports = function (siteUrl) {
      $state.go('reports.webex-metrics', { siteUrl: siteUrl });
    };

    vm.linkToSiteAdminHomePage = function (siteUrl) {
      linkTOSiteAdminPage.call(vm, siteUrl, false);
    };

    vm.linkToSiteAdminLinkedPage = function (siteUrl) {
      linkTOSiteAdminPage.call(vm, siteUrl, true);
    };

    vm.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    vm.redistributeLicenses = function (entity) {
      if (vm.canModify(entity)) {
        $state.go('site-list-distribute-licenses', { subscriptionId: entity.billingServiceId, centerDetails: vm.getCenterDetailsForSingleSubscription(entity.billingServiceId) });
      } else {
        showRejectionModal(actions.REDISTRIBUTE, isOnlySiteInSubscription(entity));
      }
    };

    vm.addSite = function () {
      if (WebExSiteRowService.hasNonPendingSubscriptions()) {
        $state.go('site-list-add', { centerDetailsForAllSubscriptions: vm.allCenterDetailsForSubscriptions });
      } else {
        showRejectionModal(actions.ADD, false);
      }
    };

    vm.canModify = function (entity) {
      return !isOnlySiteInSubscription(entity) && !SetupWizardService.isSubscriptionPending(entity.billingServiceId);
    };

    vm.getCenterDetailsForSingleSubscription = function (externalSubId) {
      var singleSub = _.find(vm.allCenterDetailsForSubscriptions, { externalSubscriptionId: externalSubId });
      return _.get(singleSub, 'purchasedServices', []);
    };

    //if we are checking a single subscription - we pass the entity. If entity is not passed
    //check if this customer has any enterprise non-trial subscriptions
    vm.isSubscriptionEnterprise = function (entity) {
      if (entity) {
        return SetupWizardService.isSubscriptionEnterprise(entity.billingServiceId);
      } else {
        return !_.isEmpty(SetupWizardService.getEnterpriseSubscriptionListWithStatus());
      }
    };

    vm.deleteSite = function (entity) {
      var subscriptionId = entity.billingServiceId;
      var siteUrl = entity.siteUrl;
      if (vm.canModify(entity)) {
        $modal.open({
          type: 'dialog',
          template: require('./siteDeleteConfirmModal.tpl.html'),
          controller: function () {
            var ctrl = this;
            ctrl.siteUrl = siteUrl;
          },
          controllerAs: '$ctrl',
        }).result.then(function () {
          deleteSite(subscriptionId, siteUrl);
        });
      } else {
        showRejectionModal(actions.DELETE, isOnlySiteInSubscription(entity));
      }
    };

    vm.init();

    function deleteSite(subscriptionId, siteUrl) {
      var sites = WebExSiteRowService.getLicensesInSubscriptionGroupedBySites(subscriptionId);
      if (_.keys(sites).length === 2) {
        var remainingSite = moveLicensesToRemainingSite(subscriptionId, sites, siteUrl);
        WebExSiteService.deleteSite(subscriptionId, remainingSite)
          .then(function () {
            var params = {
              title: $translate.instant('webexSiteManagement.deleteSiteSuccessModalTitle'),
              message: $translate.instant('webexSiteManagement.deleteSiteSuccessModalBody'),
              hideDismiss: true,
            };
            ModalService.open(params).result.then(refreshSiteListData);
            Notification.success('webexSiteManagement.deleteSiteSuccessToaster');
          })
          .catch(function (response) {
            Notification.errorWithTrackingId(response, 'webexSiteManagement.deleteSiteFailureToaster');
          });
      } else { //open modal to redistribute licenses
        $state.go('site-list-delete', { subscriptionId: subscriptionId, siteUrl: siteUrl, centerDetails: vm.getCenterDetailsForSingleSubscription(subscriptionId) });
      }
    }

    function isOnlySiteInSubscription(entity) {
      if (!entity.billingServiceId) {
        return true;
      }
      var siteUrl = _.keys(WebExSiteRowService.getLicensesInSubscriptionGroupedBySites(entity.billingServiceId, entity.siteUrl));
      return siteUrl.length === 1;
    }

    function moveLicensesToRemainingSite(subscriptionId, sites, urlToRemove) {
      var keys = _.keys(sites);
      _.pull(keys, urlToRemove);
      var remainingSiteUrl = keys[0];
      var siteToRemove = sites[urlToRemove];
      var remainingSite = _.map(sites[remainingSiteUrl], function (s) {
        return {
          centerType: s.offerName,
          quantity: s.volume,
          siteUrl: s.siteUrl,
        };
      });

      _.forEach(siteToRemove, function (license) {
        var i = _.findIndex(remainingSite, { centerType: license.offerName });
        if (i > -1) {
          remainingSite[i].quantity = remainingSite[i].quantity + license.volume;
        } else {
          remainingSite.push(
            {
              centerType: license.offerName,
              quantity: license.volume,
              siteUrl: remainingSiteUrl,
            });
        }
      });
      return remainingSite;
    }

    function linkTOSiteAdminPage(siteUrl, toLinkedPage) {
      var adminUrl = [];
      adminUrl.push(WebExUtilsFact.getSiteAdminUrl(siteUrl));
      if (toLinkedPage) {
        adminUrl.push('&mainPage=');
        adminUrl.push(encodeURIComponent('accountlinking.do?siteUrl='));
        adminUrl.push(WebExUtilsFact.getSiteName(siteUrl));
      }
      vm.siteAdminUrl = adminUrl.join('');

      vm.accessToken = TokenService.getAccessToken();
      $timeout(function () {
        angular.element('#webExLinkedSiteFormBtn').click();
      }, 100);
    }

    function goToMeetingSetup() {
      $state.go('setupwizardmodal', {
        currentTab: 'meetingSettings',
        onlyShowSingleTab: true,
        showStandardModal: true,
      });
    }

    function refreshSiteListData() {
      Auth.getCustomerAccount(Authinfo.getOrgId()).then(function (response) {
        Authinfo.updateAccountInfo(response.data);
        vm.initializeData();
      });
    }

    function showRejectionModal(action, isOnlySite) {
      /*  algendel 11/13/17. We are working on implementation where in certain instances of pending setup
      the user is sent to the setup screen. This should come within a week. therefore I am leaving in the
      code to make this happen gated by this false isShowSetup flag below */

      var isShowSetup = false;
      var title, errorMessage;
      switch (action) {
        case actions.ADD:
          title = 'webexSiteManagement.addSiteRejectModalTitle';
          errorMessage = 'webexSiteManagement.addSiteRejectPending';
          break;
        case actions.DELETE:
          errorMessage = isOnlySite ? 'webexSiteManagement.deleteSiteRejectModalBodyOnlySite' : 'webexSiteManagement.deleteSiteRejectModalBodyPending';
          title = 'webexSiteManagement.deleteSiteRejectModalTitle';
          break;
        case actions.REDISTRIBUTE:
          errorMessage = isOnlySite ? 'webexSiteManagement.redistributeRejectModalBodyOnlySite' : 'webexSiteManagement.redistributeRejectModalBodyPending';
          title = 'webexSiteManagement.redistributeRejectModalTitle';
          break;
      }

      var params = {
        title: $translate.instant(title),
        message: $translate.instant(errorMessage),
        close: $translate.instant('common.dismiss'),
        hideDismiss: true,
      };

      if (isShowSetup) {
        params.hideDismiss = false;
        params.dismiss = $translate.instant('common.dismiss');
        params.close = $translate.instant('common.setUp');
      }
      ModalService.open(params).result.then(function () {
        if (isShowSetup) {
          goToMeetingSetup();
        }
      });
    }

    // kill the csv poll when navigating away from the site list page
    $scope.$on('$destroy', function () {
      WebExSiteRowService.stopPolling();
      WebExSiteRowService.initSiteRowsObj(); // this will allow re-entry to this page to use fresh content
    });

    // notes:
    // - it has been observed that when trying to launch setup wizard modal from add site modal, the
    //   setup wizard modal comes up blank
    // - this is possibly related to redirecting from a modal state to a modal state
    // - as a workaround, we:
    //   - emit an event
    //   - close the modal
    //   - 'siteRowCtrl' catches the event (since it's not a modal), and launches the setup wizard
    // - in order to avoid conflicting animations (one modal closing, another one opening), we insert
    //   an 800ms delay
    // 11/15/17 we are temporarily taking out the setup launch. This should be brought back within a week.
    $scope.$on('core::launchMeetingSetup', function () {
      $timeout(function () {
        goToMeetingSetup();
      }, 800);
    });

    $scope.$on('core::siteListModified', refreshSiteListData);
  } // WebExSiteRowCtrl()
})(); // top level function
