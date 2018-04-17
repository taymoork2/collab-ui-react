(function () {
  'use strict';

  module.exports = UserOverviewCtrl;
  var OfferName = require('modules/core/shared/offer-name').OfferName;

  /* @ngInject */
  function UserOverviewCtrl($scope, $state, $stateParams, $translate, $window, $q, Authinfo, Config, DirSyncService, FeatureToggleService, OfferNameService, MessengerInteropService, MultiDirSyncService, Notification, Userservice, UserOverviewService) {
    var vm = this;

    vm.savePreferredLanguage = savePreferredLanguage;
    vm.prefLanguageSaveInProcess = false;
    vm.preferredLanguage = '';
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
    vm.dirsyncEnabled = true;
    vm.hasLinkedSites = false;
    vm.isCSB = Authinfo.isCSB();
    vm.hasAccount = Authinfo.hasAccount();
    vm.isFusion = Authinfo.isFusion();
    vm.isFusionCal = Authinfo.isFusionCal();
    vm.goToUserDetails = goToUserDetails;
    vm.enableAuthCodeLink = enableAuthCodeLink;
    vm.disableAuthCodeLink = disableAuthCodeLink;
    vm.getUserPhoto = Userservice.getUserPhoto;
    vm.isValidThumbnail = Userservice.isValidThumbnail;
    vm.clickService = clickService;
    vm.clickUserDetailsService = clickUserDetailsService;
    vm.actionList = [];
    vm._helpers = {
      hasLicense: hasLicense,
    };
    vm.hasSparkCall = false;
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
      detail: '',
      state: 'userDetails',
      dirsyncEnabled: false,
      actionAvailable: true,
    };
    var preferredLanguageDetails = {
      selectedLanguageCode: '',
      languageOptions: [],
      currentUserId: '',
      hasSparkCall: false,
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

      MultiDirSyncService.isDirsyncEnabled().then(function (isEnabled) {
        vm.dirsyncEnabled = isEnabled;
      });

      vm.services = [];
      vm.hasLinkedSites = !_.isEmpty(vm.currentUser.linkedTrainSiteNames);

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

    function goToUserDetails() {
      if (!vm.dirsyncEnabled && !vm.hasLinkedSites) {
        $state.go('user-overview.user-profile');
      }
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

    function clickUserDetailsService(feature) {
      $state.go('user-overview.' + feature.state, { preferredLanguageDetails: preferredLanguageDetails });
    }

    function savePreferredLanguage(prefLang) {
      vm.prefLanguageSaveInProcess = true;
      UserOverviewService.updateUserPreferredLanguage(vm.currentUser.id, prefLang.value)
        .then(function () {
          preferredLanguageDetails.selectedLanguageCode = prefLang.value;
          $state.go('user-overview');
        })
        .catch(function (error) {
          Notification.errorResponse(error, 'preferredLanguage.failedToSaveChanges');
        });
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

    function hasLicense(offerName) {
      var licenseIds = vm.currentUser.licenseID;
      return _.some(licenseIds, function (licenseId) {
        return _.startsWith(licenseId, offerName);
      });
    }

    function hasAdvancedMeetings() {
      var advancedMeetingOfferNames = OfferNameService.getSortedAdvancedMeetingOfferNames();
      return _.some(advancedMeetingOfferNames, function (advancedMeetingOfferName) {
        return hasLicense(advancedMeetingOfferName);
      });
    }

    function hasConfLicense() {
      var confLicenses = _.map(Authinfo.getConferenceServices(), 'license');
      var licenseIds = [];
      _.forEach(confLicenses, function (license) {
        if (license.offerName === OfferName.CF) {
          licenseIds.push(license.licenseId);
        }
      });

      var returnValue = false;
      _.forEach(vm.currentUser.licenseID, function (userLicense) {
        if (licenseIds.indexOf(userLicense) >= 0) {
          returnValue = true;
        }
      });

      return returnValue;
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
      if (UserOverviewService.userHasEntitlement(vm.currentUser, 'squared-room-moderation') || !vm.hasAccount) {
        if (hasLicense(OfferName.MS)) {
          msgState.detail = $translate.instant('onboardModal.paidMsg');
          msgState.actionAvailable = getDisplayableServices('MESSAGING');
        }
      }
      // allow access to user-level jabber interop entitlement if org-level entitlement is set
      if (MessengerInteropService.hasAssignableMessageOrgEntitlement()) {
        msgState.actionAvailable = true;
      }
      vm.services.push(msgState);

      if (hasAdvancedMeetings()) {
        confState.detail = $translate.instant('onboardModal.paidAdvancedConferencing');
        confState.actionAvailable = getDisplayableServices('CONFERENCING') || _.isArray(vm.currentUser.trainSiteNames);
      } else if (hasConfLicense()) {
        confState.detail = $translate.instant('onboardModal.paidConf');
      }
      vm.services.push(confState);

      if (UserOverviewService.userHasEntitlement(vm.currentUser, 'squared-fusion-uc')) {
        commState.detail = $translate.instant('onboardModal.paidCommHybrid');
      }

      if (UserOverviewService.userHasEntitlement(vm.currentUser, 'ciscouc')) {
        if (hasLicense(OfferName.CO)) {
          commState.detail = $translate.instant('onboardModal.paidComm');
          commState.actionAvailable = true;
          vm.hasSparkCall = true;
        }
      }
      vm.services.push(commState);

      if (UserOverviewService.userHasEntitlement(vm.currentUser, Config.entitlements.care)) {
        var hasDigitalCareEntitlement = _.includes(vm.currentUser.entitlements, Config.entitlements.care_digital);
        var hasInboundVoiceEntitlement = _.includes(vm.currentUser.entitlements, Config.entitlements.care_inbound_voice);

        var hasSyncKms = _.includes(vm.currentUser.roles, Config.backend_roles.spark_synckms);
        var hasContextServiceEntitlement = _.includes(vm.currentUser.entitlements, Config.entitlements.context);
        var isCvcLicensed = hasInboundVoiceEntitlement && hasLicense(OfferName.CVC) && hasSyncKms && hasContextServiceEntitlement;
        var isCdcLicensed = hasDigitalCareEntitlement && hasLicense(OfferName.CDC) && hasSyncKms && hasContextServiceEntitlement;

        if (isCvcLicensed) {
          contactCenterState.detail = $translate.instant('onboardModal.paidContactCenterVoice');
          vm.services.push(contactCenterState);
        } else if (isCdcLicensed) {
          contactCenterState.detail = $translate.instant('onboardModal.paidContactCenter');
          vm.services.push(contactCenterState);
        }
      }
    }

    function initUserDetails() {
      vm.userDetailList = [];
      var ciLanguageCode = _.get(vm.currentUser, 'preferredLanguage');
      var ciDirsyncEnabled = DirSyncService.isUserAttributeSynced(vm.orgInfo, 'preferredLanguage');
      var formattedLanguage = ciLanguageCode ? UserOverviewService.formatLanguage(ciLanguageCode) : ciLanguageCode;
      UserOverviewService.getUserPreferredLanguage(formattedLanguage).then(function (userLanguageDetails) {
        preferredLanguageState.detail = !_.isEmpty(userLanguageDetails.language) ? _.get(userLanguageDetails.language, 'label') : formattedLanguage;
        var languageOptions = !_.isEmpty(userLanguageDetails.translatedLanguages) ? _.get(userLanguageDetails, 'translatedLanguages') : [];
        preferredLanguageDetails.languageOptions = _.sortBy(languageOptions, 'label');
      }).catch(function (error) {
        Notification.errorResponse(error, 'usersPreview.userPreferredLanguageError');
      });
      if (ciDirsyncEnabled) {
        preferredLanguageState.dirsyncEnabled = ciDirsyncEnabled;
      }
      preferredLanguageDetails.selectedLanguageCode = formattedLanguage;
      preferredLanguageDetails.currentUserId = vm.currentUser.id;
      preferredLanguageDetails.hasSparkCall = vm.hasSparkCall;
      preferredLanguageDetails.save = savePreferredLanguage;
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
