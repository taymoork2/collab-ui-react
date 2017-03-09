(function () {
  'use strict';

  module.exports = UserOverviewCtrl;

  /* @ngInject */
  function UserOverviewCtrl($scope, $state, $stateParams, $translate, $window, $q,
    Authinfo, Config, FeatureToggleService, Notification, SunlightConfigService,
    Userservice, UserOverviewService) {
    var vm = this;

    vm.currentUser = $stateParams.currentUser;
    vm.entitlements = $stateParams.entitlements;
    vm.queryuserslist = $stateParams.queryuserslist;
    vm.orgInfo = $stateParams.orgInfo;

    vm.services = [];
    vm.userDetailList = [];
    vm.showGenerateOtpLink = false;
    vm.titleCard = '';
    vm.subTitleCard = '';
    vm.resendInvitation = resendInvitation;
    vm.pendingStatus = false;
    vm.dirsyncEnabled = false;
    vm.isCSB = Authinfo.isCSB();
    vm.hasAccount = Authinfo.hasAccount();
    vm.isFusion = Authinfo.isFusion();
    vm.isFusionCal = Authinfo.isFusionCal();
    vm.enableAuthCodeLink = enableAuthCodeLink;
    vm.disableAuthCodeLink = disableAuthCodeLink;
    vm.getUserPhoto = Userservice.getUserPhoto;
    vm.isValidThumbnail = Userservice.isValidThumbnail;
    vm.clickService = clickService;
    vm.actionList = [];
    vm.isSharedMeetingsEnabled = false;
    vm.temporarilyOverrideSharedMeetingsFeatureToggle = { default: true, defaultValue: true };

    var msgState = {
      name: $translate.instant('onboardModal.message'),
      icon: 'icon-circle-message',
      state: 'messaging',
      detail: $translate.instant('onboardModal.msgFree'),
      actionAvailable: false,
    };
    var commState = {
      name: $translate.instant('onboardModal.call'),
      icon: 'icon-circle-call',
      state: 'communication',
      detail: $translate.instant('onboardModal.callFree'),
      actionAvailable: false,
    };
    var confState = {
      name: $translate.instant('onboardModal.meeting'),
      icon: 'icon-circle-group',
      state: 'conferencing',
      detail: $translate.instant('onboardModal.mtgFree'),
      actionAvailable: false,
    };
    var contactCenterState = {
      name: $translate.instant('onboardModal.contactCenter'),
      icon: 'icon-circle-contact-centre',
      state: 'contactCenter',
      detail: $translate.instant('onboardModal.freeContactCenter'),
      actionAvailable: true,
    };
    var preferredLanguageState = {
      name: $translate.instant('preferredLanguage.title'),
      detail: "",
      dirsyncEnabled: false,
    };

    init();

    /////////////////////////////

    function init() {

      $scope.$on('USER_LIST_UPDATED', function () {
        getCurrentUser();
      });

      $scope.$on('entitlementsUpdated', function () {
        getCurrentUser();
      });

      vm.services = [];

      if (_.get(vm, 'temporarilyOverrideSharedMeetingsFeatureToggle.default') === true) {
        vm.isSharedMeetingsEnabled = _.get(vm, 'temporarilyOverrideSharedMeetingsFeatureToggle.defaultValue', false);
      } else {
        FeatureToggleService.atlasSharedMeetingsGetStatus().then(function (smpStatus) {
          vm.isSharedMeetingsEnabled = smpStatus;
        });
      }

      initServices();
      initActionList();
      updateUserTitleCard();
      getUserFeatures();
      initUserDetails();
      FeatureToggleService.cloudberryPersonalModeGetStatus().then(function (enablePersonalCloudberry) {
        vm.showDevices = currentUserIsSquaredUC() || (enablePersonalCloudberry && Authinfo.isDeviceMgmt());
      });
    }

    function currentUserIsSquaredUC() {
      return _.some(vm.currentUser.entitlements, function (entitlement) {
        return entitlement === Config.entitlements.huron;
      });
    }

    function getCurrentUser() {
      UserOverviewService.getUser(vm.currentUser.id)
        .then(function (response) {
          vm.currentUser = response.user;
          vm.entitlements = response.sqEntitlements;
          init();
        });
    }

    function initActionList() {
      var action = {
        actionKey: 'common.edit',
      };
      if (Authinfo.isCSB()) {
        action.actionFunction = goToUserRedirect;
      } else {
        action.actionFunction = goToEditService;
      }
      vm.actionList.push(action);
      return $q.resolve();
    }

    function goToEditService() {
      $state.go('editService', {
        currentUser: vm.currentUser,
      });
    }

    function goToUserRedirect() {
      var url = $state.href('userRedirect');
      $window.open(url, '_blank');
    }

    function clickService(feature) {
      $state.go('user-overview.' + feature.state);
    }

    function getDisplayableServices(serviceName) {
      var displayableServices = Authinfo.getServices();
      if (Authinfo.hasAccount()) {
        displayableServices = displayableServices.filter(function (service) {
          return service.isConfigurable && service.licenseType === serviceName;
        });
      }
      return _.isArray(displayableServices) && (displayableServices.length > 0);
    }

    function hasLicense(license) {
      var userLicenses = vm.currentUser.licenseID;
      if (userLicenses) {
        for (var l = userLicenses.length - 1; l >= 0; l--) {
          var licensePrefix = userLicenses[l].substring(0, 2);
          if (licensePrefix === license) {
            return true;
          }
        }
      }
      return false;
    }

    function getUserFeatures() {
      // to see user features, you must either be a support member or a team member
      if (!canQueryUserFeatures()) {
        return $q.resolve();
      }

      return FeatureToggleService.getFeaturesForUser(vm.currentUser.id).then(function (response) {
        vm.features = [];
        _.forEach(_.get(response, 'developer'), function (el) {
          if (el.val !== 'false' && el.val !== '0') {
            var newEl = {
              key: el.key,
            };
            if (el.val !== 'true') {
              newEl.val = el.val;
            }
            vm.features.push(newEl);
          }
        });
      });
    }

    function canQueryUserFeatures() {
      return Authinfo.isSquaredTeamMember() || Authinfo.isAppAdmin();
    }

    function updateUserTitleCard() {
      if (vm.currentUser.displayName) {
        vm.titleCard = vm.currentUser.displayName;
      } else if (vm.currentUser.name) {
        vm.titleCard = (vm.currentUser.name.givenName || '') + ' ' + (vm.currentUser.name.familyName || '');
      } else {
        vm.titleCard = vm.currentUser.userName;
      }

      if (vm.currentUser.title) {
        vm.subTitleCard = vm.currentUser.title;
      }

      if (_.isArray(vm.currentUser.addresses) && vm.currentUser.addresses.length) {
        vm.subTitleCard += ' ' + (vm.currentUser.addresses[0].locality || '');
      }

      if (!vm.subTitleCard && vm.titleCard != vm.currentUser.userName) {
        vm.subTitleCard = vm.currentUser.userName;
      }

      return $q.resolve();
    }

    function enableAuthCodeLink() {
      vm.showGenerateOtpLink = true;
    }

    function disableAuthCodeLink() {
      vm.showGenerateOtpLink = false;
    }

    // update the list of services available to this user
    // this uses the entitlements returned from the getUser CI call.
    function initServices() {

      if (vm.currentUser.hasEntitlement('squared-room-moderation') || !vm.hasAccount) {
        if (hasLicense('MS')) {
          msgState.detail = $translate.instant('onboardModal.paidMsg');
          msgState.actionAvailable = getDisplayableServices('MESSAGING');
        }
      }
      vm.services.push(msgState);

      if (vm.currentUser.hasEntitlement('cloudmeetings')) {
        confState.actionAvailable = getDisplayableServices('CONFERENCING') || _.isArray(vm.currentUser.trainSiteNames);
        if (vm.currentUser.trainSiteNames) {
          confState.detail = vm.isSharedMeetingsEnabled ? $translate.instant('onboardModal.paidAdvancedConferencing') : $translate.instant('onboardModal.paidConfWebEx');
        }
      } else if (vm.currentUser.hasEntitlement('squared-syncup')) {
        if (hasLicense('CF')) {
          confState.detail = $translate.instant('onboardModal.paidConf');
        }
      }
      vm.services.push(confState);

      if (vm.currentUser.hasEntitlement('ciscouc')) {
        if (hasLicense('CO')) {
          commState.detail = $translate.instant('onboardModal.paidComm');
          commState.actionAvailable = true;
        }
      }
      vm.services.push(commState);

      if (vm.currentUser.hasEntitlement('cloud-contact-center')) {
        if (hasLicense('CD')) {
          SunlightConfigService.getUserInfo(vm.currentUser.id)
            .then(function () {
              var hasSyncKms = _.find(vm.currentUser.roles, function (r) {
                return r === Config.backend_roles.spark_synckms;
              });
              var hasContextServiceEntitlement = _.find(vm.currentUser.entitlements, function (r) {
                return r === Config.entitlements.context;
              });
              if (hasSyncKms && hasContextServiceEntitlement) {
                contactCenterState.detail = $translate.instant('onboardModal.paidContactCenter');
                vm.services.push(contactCenterState);
              }
            });
        }
      }
    }

    function initUserDetails() {
      var ciLanguageCode = _.get(vm.currentUser, 'preferredLanguage');
      var ciDirsyncEnabled = _.get(vm.orgInfo, 'dirsyncEnabled');
      if (ciLanguageCode) {
        UserOverviewService.getUserPreferredLanguage(ciLanguageCode).then(function (userPreferredLanguage) {
          preferredLanguageState.detail = userPreferredLanguage ? _.get(userPreferredLanguage, 'label') : ciLanguageCode;
        }).catch(function (error) {
          Notification.errorResponse(error, 'usersPreview.userPreferredLanguageError');
        });
      }
      if (ciDirsyncEnabled) {
        preferredLanguageState.dirsyncEnabled = ciDirsyncEnabled;
      }
      vm.userDetailList.push(preferredLanguageState);
    }

    function resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {
      Userservice.resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements)
        .then(function () {
          Notification.success('usersPage.emailSuccess');
        }).catch(function (error) {
          Notification.errorResponse(error, 'usersPage.emailError');
        });
      angular.element('.open').removeClass('open');
    }


  }
})();
