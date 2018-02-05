require('./_user-add.scss');

(function () {
  'use strict';

  //TODO refactor this into OnboardCtrl, BulkUserCtrl, AssignServicesCtrl
  angular.module('Core')
    .controller('OnboardCtrl', OnboardCtrl);

  /*@ngInject*/
  function OnboardCtrl($modal, $previousState, $q, $rootScope, $scope, $state, $stateParams, $timeout, $translate, Analytics, Authinfo, Config, FeatureToggleService, DialPlanService, Log, LogMetricsService, MessengerInteropService, NAME_DELIMITER, Notification, OnboardService, OnboardStore, Orgservice, TelephonyInfoService, LocationsService, NumberService, Userservice, Utils, UserCsvService, WebExUtilsFact, ServiceSetup, ExternalNumberPool, DirSyncService) {
    var vm = this;

    // reset corresponding scope properties in OnboardStore each time this controller initializes
    var resetOnboardStoreStates = _.get($state, 'params.resetOnboardStoreStates');
    OnboardStore.resetStatesAsNeeded(resetOnboardStoreStates);

    $scope.model = OnboardStore['users.add.manual'].model;

    $scope.hasAccount = Authinfo.hasAccount();
    $scope.usrlist = [];
    $scope.internalNumberPool = [];
    $scope.externalNumberPool = [];
    $scope.telephonyInfo = {};
    $scope.cmrLicensesForMetric = {};
    $scope.currentUserCount = OnboardStore['users.add.manual'].currentUserCount;

    $scope.locationOptions = [];
    $scope.location = '';
    $scope.selectedLocation = '';

    vm.maxUsersInManual = OnboardService.maxUsersInManual;

    $scope.searchStr = '';
    $scope.timeoutVal = 1000;
    $scope.timer = 0;
    $scope.searchPlaceholder = $translate.instant('usersPage.convertUserSearch');
    $scope.manageUsers = $stateParams.manageUsers;

    $scope.labelField = '';

    $scope.loadLocations = loadLocations;
    $scope.loadInternalNumberPool = loadInternalNumberPool;
    $scope.loadExternalNumberPool = loadExternalNumberPool;
    $scope.checkDnOverlapsSteeringDigit = checkDnOverlapsSteeringDigit;
    $scope.assignDNForUserList = assignDNForUserList;
    $scope.assignMapUserList = assignMapUserList;
    $scope.checkDidDnDupes = checkDidDnDupes;
    $scope.returnInternalNumberlist = returnInternalNumberlist;
    $scope.mapDidToDn = mapDidToDn;
    $scope.resetDns = resetDns;
    $scope.syncGridDidDn = syncGridDidDn;
    $scope.filterList = filterList;
    $scope.isMapped = false;
    $scope.isMapInProgress = false;
    $scope.isResetInProgress = false;
    $scope.isMapEnabled = true;
    $scope.processing = false;
    $scope.PATTERN_LIMIT = 50;
    $scope.messagingLicenseAvailability = 0;
    $scope.conferencingLicenseAvailability = 0;
    $scope.dirSyncConnectorDownload = 'https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/CloudConnectorManager/DirectoryConnector.zip';

    var isFTW = false;
    $scope.isReset = false;
    $scope.showExtensions = true;
    $scope.isResetEnabled = false;

    $scope.careRadioValue = {
      NONE: $translate.instant('onboardModal.paidNone'),
      K1: $translate.instant('onboardModal.paidCDC'),
      K2: $translate.instant('onboardModal.paidCVC'),
    };

    $scope.radioStates = {
      commRadio: false,
      msgRadio: false,
      careRadio: $scope.careRadioValue.NONE,
      initialCareRadioState: $scope.careRadioValue.NONE, // For generating Metrics
    };

    $scope.radioStates.careRadio = $scope.careRadioValue.NONE;

    $scope.convertUsersFlow = false;
    $scope.editServicesFlow = false;
    $scope.hasSite = false;

    $scope.placeholder = $translate.instant('directoryNumberPanel.chooseNumber');
    $scope.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');

    OnboardService.huronCallEntitlement = false;

    $scope.shouldAddCallService = shouldAddCallService;
    $scope.cancelModal = cancelModal;
    var currentUserHasCall = false;
    $scope.currentUserEnablesCall = false;
    $scope.currentUserCommFeature = $scope.selectedCommFeature = null;

    $scope.isDirSyncEnabled = DirSyncService.isDirSyncEnabled();
    $scope.convertUsersReadOnly = $stateParams.readOnly || $scope.isDirSyncEnabled;

    $scope.controlMsg = controlMsg;

    initController();

    /****************************** License Enforcement START *******************************/
    //***
    //***
    //***********************************************************************************/

    function setLicenseAvailability() {
      return Orgservice.getLicensesUsage()
        .then(function (result) {
          $scope.licenses = _.get(result, '[0].licenses', []);
          _.forEach($scope.licenses, function (license) {
            switch (license.licenseType) {
              case Config.licenseTypes.MESSAGING:
                $scope.messagingLicenseAvailability = license.volume - license.usage;
                break;
              case Config.licenseTypes.CONFERENCING:
                $scope.conferencingLicenseAvailability = license.volume - license.usage;
                break;
              default:
                break;
            }
          });
        });
    }

    $scope.checkLicenseAvailability = function (licenseName, licenseModel) {
      if (!licenseName || !licenseModel) {
        return;
      }
      var licenseNamePrefix = licenseName.toLowerCase();
      if ($scope[licenseNamePrefix + 'LicenseAvailability'] < $scope.currentUserCount) {
        $scope.licenseCheckModal();
      }
    };

    $scope.checkCommLicenseAvailability = function (licenseModel, commFeature) {
      if (!commFeature) {
        return;
      }
      if (licenseModel) {
        $scope.currentUserEnablesCall = true;
        $scope.selectedCommFeature = commFeature;
      } else {
        $scope.currentUserEnablesCall = false;
        $scope.selectedCommFeature = null;
        return;
      }
      var availableLicenses = commFeature.license.volume - commFeature.license.usage;
      if (availableLicenses < $scope.currentUserCount) {
        $scope.licenseCheckModal();
      }
    };

    $scope.disableCommCheckbox = function (commFeature) {
      return $scope.currentUserEnablesCall
        && $scope.selectedCommFeature
        && commFeature.license.licenseId !== $scope.selectedCommFeature.license.licenseId;
    };

    $scope.licenseCheckModal = function () {
      if (Authinfo.isOnline()) {
        $modal.open({
          type: 'dialog',
          template: require('modules/core/users/userAdd/licenseErrorModal.tpl.html'),
        }).result.then(function () {
          $previousState.forget('modalMemo');
          $state.go('my-company.subscriptions');
        });
      }
    };

    $scope.goToManageUsers = function () {
      $state.go('users.manage.picker');
    };

    /****************************** License Enforcement END *******************************/
    //***
    //***
    //***********************************************************************************/
    function initController() {
      $scope.currentUserCount = 1;
      setLicenseAvailability();
      initToggles();
      checkSite();
      initResults();
    }

    function initResults() {
      $scope.numUpdatedUsers = 0;
      $scope.numAddedUsers = 0;
      $scope.results = {
        resultList: [],
        errors: [],
        warnings: [],
      };
    }

    var rootState = $previousState.get().state.name;
    if (rootState === 'users.manage.emailSuppress') {
      rootState = 'users.manage.picker';
    }
    $scope.onBack = function (state) {
      var goToState = state || rootState;
      Analytics.trackAddUsers(Analytics.eventNames.BACK, Analytics.sections.ADD_USERS.uploadMethods.MANUAL, { emailEntryMethod: Analytics.sections.ADD_USERS.manualMethods[$scope.model.userInputOption.toString()] });
      $state.go(goToState);
    };

    // initiate the bulkSave operation for ADSync
    $scope.bulkSave = bulkSave;

    /****************************** Did to Dn Mapping START *******************************/
    //***
    //***
    //***********************************************************************************/

    function activateDID() {
      $q.all([loadExternalNumberPool(), loadLocations(), toggleShowExtensions(), loadPrimarySiteInfo()])
        .finally(function () {
          showLocationSelectColumn();
          if ($scope.showExtensions === true) {
            assignDNForUserList();
            $scope.validateDnForUser();
          } else {
            mapDidToDn();
          }
          $scope.processing = false;
        });
    }

    function loadPrimarySiteInfo() {
      return TelephonyInfoService.getPrimarySiteInfo().then(function (telephonyInfo) {
        $scope.telephonyInfo = telephonyInfo;
      }).catch(function (response) {
        Notification.errorResponse(response, 'directoryNumberPanel.siteError');
      });
    }

    // Check to see if the currently selected directory number's first digit is
    // the same as the company steering digit.
    function checkDnOverlapsSteeringDigit(userEntity) {
      return _.startsWith(_.get(userEntity, 'assignedDn.pattern'), _.get($scope, 'telephonyInfo.steeringDigit'));
    }

    function returnInternalNumberlist(pattern, locationUuid) {
      if ($scope.ishI1484) {
        loadLocationInternalNumberPool(pattern, locationUuid);
      } else {
        loadInternalNumberPool(pattern);
      }
    }

    function loadLocationInternalNumberPool(pattern, locationUuid, userEntity) {
      $scope.labelField = 'siteToSite';
      $scope.order = 'SITETOSITE-ASC';
      return NumberService.getNumberList(pattern, 'internal', false, $scope.order, null, null, locationUuid)
        .then(function (internalNumberPool) {
          $scope.internalNumberPool = internalNumberPool;
          if (userEntity) {
            userEntity.assignedDn.pattern = internalNumberPool[0].internal;
          }
          return $scope.internalNumberPool;
        }).catch(function (response) {
          $scope.internalNumberPool = [];
          Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
        });
    }

    function loadInternalNumberPool(pattern) {
      $scope.labelField = 'number';
      return NumberService.getNumberList(pattern, 'internal', false, null, null, null, null)
        .then(function (internalNumberPool) {
          $scope.internalNumberPool = internalNumberPool;
        }).catch(function (response) {
          $scope.internalNumberPool = [];
          Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
        });
    }

    function loadLocations() {
      if ($scope.ishI1484) {
        return LocationsService.getLocationList()
          .then(function (locationOptions) {
            $scope.locationOptions = locationOptions;
            // enable mapDidToDn only when we have 1 location(default)
            if ($scope.locationOptions.length === 1) {
              $scope.isMapped = false;
              $scope.isMapEnabled = true;
            } else {
              $scope.isMapped = true;
              $scope.isMapEnabled = false;
            }
            _.forEach(locationOptions, function (result) {
              if (result.defaultLocation === true) {
                _.forEach($scope.usrlist, function (data) {
                  data.selectedLocation = { uuid: result.uuid, name: result.name };
                  $scope.selectedLocation = data.selectedLocation.uuid;
                });
              }
            });
          })
          .then(function () {
            return loadLocationInternalNumberPool(null, $scope.selectedLocation);
          });
      } else {
        return loadInternalNumberPool();
      }
    }

    function loadExternalNumberPool(pattern) {
      // Numbers loaded here should be limited to standard DID numbers. No Toll-Free numbers.
      return TelephonyInfoService.loadExternalNumberPool(pattern, ExternalNumberPool.FIXED_LINE_OR_MOBILE)
        .then(function (externalNumberPool) {
          $scope.externalNumberPool = externalNumberPool;
        }).catch(function (response) {
          $scope.externalNumberPool = [{
            uuid: 'none',
            pattern: $translate.instant('directoryNumberPanel.none'),
          }];
          Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
        });
    }

    function mapDidToDn() {
      $scope.isMapInProgress = true;
      $scope.isMapEnabled = false;
      var count = $scope.usrlist.length;

      // Numbers loaded here should be limited to standard DID numbers. No Toll-Free numbers.
      TelephonyInfoService.loadExtPoolWithMapping(count, ExternalNumberPool.FIXED_LINE_OR_MOBILE)
        .then(function (externalNumberMapping) {
          $scope.externalNumberMapping = externalNumberMapping;
          assignMapUserList(count, externalNumberMapping);
          $scope.isMapped = true;
          $scope.isMapInProgress = false;
          $scope.validateDnForUser();
        }).catch(function (response) {
          $scope.isMapInProgress = false;
          $scope.isMapped = false;
          $scope.isMapEnabled = true;
          $scope.externalNumberMapping = [];
          Notification.errorResponse(response, 'directoryNumberPanel.externalNumberMappingError');
        });
    }

    function assignDNForUserList() {
      _.forEach($scope.usrlist, function (user, index) {
        user.assignedDn = $scope.internalNumberPool[index];
      });

      // don't select any DID on loading the page
      _.forEach($scope.usrlist, function (user) {
        user.externalNumber = $scope.externalNumberPool[0];
        user.didDnMapMsg = undefined;
      });
    }

    function resetDns() {
      $scope.isResetInProgress = true;
      $scope.isResetEnabled = false;
      loadInternalNumberPool().then(function () {
        assignDNForUserList();
        $scope.validateDnForUser();
        $scope.isReset = true;
        $scope.isResetInProgress = false;
      }).catch(function () {
        $scope.isResetInProgress = false;
        $scope.validateDnForUser();
      });
    }

    function assignMapUserList(count, externalNumberMappings) {
      for (var i = 0; i < $scope.usrlist.length; i++) {
        if (i <= externalNumberMappings.length - 1) {
          if (externalNumberMappings[i].directoryNumber !== null) {
            $scope.usrlist[i].externalNumber = externalNumberMappings[i];
            $scope.usrlist[i].assignedDn = externalNumberMappings[i].directoryNumber;
            if ($scope.ishI1484) {
              $scope.usrlist[i].assignedDn.internal = externalNumberMappings[i].directoryNumber.pattern;
              // update the siteTosite for I1484 labelField
              // Use the routingPrefix from default location since mapping is only enabled with 1 location for now
              if (!_.isUndefined($scope.locationOptions[0].routingPrefix) && $scope.locationOptions[0].routingPrefix !== null) {
                $scope.usrlist[i].assignedDn.siteToSite = $scope.locationOptions[0].routingPrefix + externalNumberMappings[i].directoryNumber.pattern;
              } else {
                $scope.usrlist[i].assignedDn.siteToSite = externalNumberMappings[i].directoryNumber.pattern;
              }
            } else {
              // fix a bug with non multilocation Internal Extension
              $scope.usrlist[i].assignedDn.number = externalNumberMappings[i].directoryNumber.pattern;
              $scope.usrlist[i].assignedDn.internal = externalNumberMappings[i].directoryNumber.pattern;
            }
          } else {
            $scope.usrlist[i].externalNumber = externalNumberMappings[i];
            $scope.usrlist[i].didDnMapMsg = 'usersPage.noExtMappingAvail';
          }
        } else {
          $scope.usrlist[i].externalNumber = $scope.externalNumberPool[0];
          $scope.usrlist[i].didDnMapMsg = 'usersPage.noExternalNumberAvail';
        }
      }
    }

    function checkDidDnDupes() {
      var didDnDupe = {
        didDupe: false,
        dnDupe: false,
      };
      for (var i = 0; i < $scope.usrlist.length - 1; i++) {
        for (var j = i + 1; j < $scope.usrlist.length; j++) {
          if ($scope.ishI1484) {
            if (!_.isUndefined($scope.usrlist[i].assignedDn) && !_.isUndefined($scope.usrlist[j].assignedDn) && ($scope.usrlist[i].assignedDn.uuid !== 'none') && ($scope.usrlist[i].assignedDn.siteToSite === $scope.usrlist[j].assignedDn.siteToSite)) {
              //same extension across different locations are allowed to be set
              if ($scope.usrlist[i].selectedLocation.uuid !== $scope.usrlist[j].selectedLocation.uuid) {
                break;
              }
              didDnDupe.dnDupe = true;
            }
          } else {
            if (!_.isUndefined($scope.usrlist[i].assignedDn) && !_.isUndefined($scope.usrlist[j].assignedDn) && ($scope.usrlist[i].assignedDn.uuid !== 'none') && ($scope.usrlist[i].assignedDn.number === $scope.usrlist[j].assignedDn.number)) {
              didDnDupe.dnDupe = true;
            }
          }
          if (!_.isUndefined($scope.usrlist[i].externalNumber) && !_.isUndefined($scope.usrlist[j].externalNumber) && ($scope.usrlist[i].externalNumber.uuid !== 'none') && ($scope.usrlist[i].externalNumber.pattern === $scope.usrlist[j].externalNumber.pattern)) {
            didDnDupe.didDupe = true;
          }
          if (didDnDupe.dnDupe && didDnDupe.didDupe) {
            break;
          }
        }
        if (didDnDupe.dnDupe && didDnDupe.didDupe) {
          break;
        }
      }
      return didDnDupe;
    }

    $scope.isDnNotAvailable = function () {
      for (var i = 0; i < $scope.usrlist.length; i++) {
        if ($scope.usrlist[i].assignedDn === undefined) {
          return true;
        }
      }
      return false;
    };

    $scope.assignServicesSave = function () {
      if (shouldAddCallService()) {
        $scope.processing = true;
        activateDID();
        $state.go('users.add.services.dn');
      } else {
        $scope.onboardUsers(true);
      }
    };

    function initToggles() {
      FeatureToggleService.supports(FeatureToggleService.features.hI1484)
        .then(function (supports) {
          $scope.ishI1484 = supports;
        });
    }

    $scope.editServicesSave = function () {
      for (var licenseId in $scope.cmrLicensesForMetric) {
        if ($scope.cmrLicensesForMetric[licenseId]) {
          Analytics.trackUserOnboarding(Analytics.sections.USER_ONBOARDING.eventNames.CMR_CHECKBOX, $state.current.name, Authinfo.getOrgId(), { licenseId: licenseId });
        }
      }
      if (shouldAddCallService()) {
        $scope.processing = true;
        $scope.editServicesFlow = true;
        $scope.convertUsersFlow = false;

        // Populate list with single user for updateUserLicense()
        $scope.usrlist = [{
          address: _.get($scope, 'currentUser.userName', ''),
        }];
        activateDID();
        $state.go('editService.dn');
      } else {
        $scope.updateUserLicense();
      }
    };

    function toggleShowExtensions() {
      return DialPlanService.getDialPlan().then(function (response) {
        var indexOfDidColumn = _.findIndex($scope.addDnGridOptions.columnDefs, {
          field: 'externalNumber',
        });
        var indexOfDnColumn = _.findIndex($scope.addDnGridOptions.columnDefs, {
          field: 'internalExtension',
        });
        if (response.extensionGenerated === 'true') {
          $scope.showExtensions = false;
          $scope.addDnGridOptions.columnDefs[indexOfDidColumn].visible = false;
          $scope.addDnGridOptions.columnDefs[indexOfDnColumn].displayName = $translate.instant('usersPage.directLineHeader');
        } else {
          $scope.showExtensions = true;
          $scope.addDnGridOptions.columnDefs[indexOfDidColumn].visible = true;
          $scope.addDnGridOptions.columnDefs[indexOfDnColumn].displayName = $translate.instant('usersPage.extensionHeader');
        }
      }).catch(function (response) {
        Notification.errorResponse(response, 'serviceSetupModal.customerDialPlanDetailsGetError');
      });
    }

    // Synchronize the DIDs and DNs on the Assign Numbers page when selections change
    function syncGridDidDn(rowEntity, modifiedFieldName) {
      if (modifiedFieldName === 'location') {
        populateExtensions(rowEntity);
      }
      if ($scope.showExtensions === false) {
        var dnLength = rowEntity.assignedDn.pattern.length;
        // if the internalNumber was changed, find a matching DID and set the externalNumber to match
        if (modifiedFieldName === 'internalNumber') {
          var matchingDid = _.find($scope.externalNumberPool, function (extNum) {
            return extNum.pattern.substr(-dnLength) === rowEntity.assignedDn.pattern;
          });
          if (matchingDid) {
            rowEntity.externalNumber = matchingDid;
          }
        }
        // if the externalNumber was changed, find a matching DN and set the internalNumber to match
        if (modifiedFieldName === 'externalNumber') {
          var matchingDn = _.find($scope.internalNumberPool, {
            pattern: rowEntity.externalNumber.pattern.substr(-dnLength),
          });
          if (matchingDn) {
            rowEntity.assignedDn = matchingDn;
          }
        }
      }
    }

    function populateExtensions(rowEntity) {
      var selectedLocationColumn = rowEntity.selectedLocation.uuid;
      return loadLocationInternalNumberPool(null, selectedLocationColumn)
        .then(function (internalNumberPool) {
          //Array to maintain the index positions of numbers already present on the grid
          var copyArray = new Array(internalNumberPool.length);
          _.forEach($scope.usrlist, function (user, userIndex) {
            if ($scope.usrlist[userIndex].selectedLocation.uuid === selectedLocationColumn) {
              _.forEach(internalNumberPool, function (internalNumber, index) {
                if (internalNumberPool[index].siteToSite === $scope.usrlist[userIndex].assignedDn.siteToSite) {
                  //if the number is present on the grid, then set its index position to 1 on the copyArray
                  copyArray[index] = 1;
                }
              });
            }
          });
          for (var i = 0; i < copyArray.length; i++) {
            //pick the first number which is not already on the grid, in copy array, the element is not 1, and that index from the internalNumberPool
            if (copyArray[i] !== 1) {
              rowEntity.assignedDn.siteToSite = internalNumberPool[i].siteToSite;
              break;
            }
          }
        });
    }


    /****************************** Did to Dn Mapping END *******************************/
    //***
    //***
    //***********************************************************************************/

    function ServiceFeature(label, value, name, license) {
      this.label = label;
      this.value = value;
      this.name = name;
      this.license = license;
    }

    function FakeLicense(type) {
      this.licenseType = type;
      this.features = Config.getDefaultEntitlements();
    }

    function checkSite() {
      ServiceSetup.listSites().then(function () {
        $scope.hasSite = (ServiceSetup.sites.length !== 0);
      });
    }

    var userEnts = null;
    var userLicenseIds = null;
    var userInvites = null;
    $scope.cmrFeature = null;
    $scope.messageFeatures = [];
    $scope.conferenceFeatures = [];
    $scope.communicationFeatures = [];
    $scope.careFeatures = [];
    $scope.cdcCareFeature = [];
    $scope.cvcCareFeature = [];
    $scope.licenses = [];
    $scope.licenseStatus = [];
    $scope.populateConf = populateConf;
    $scope.populateConfInvitations = populateConfInvitations;
    $scope.getAccountLicenses = getAccountLicenses;
    $scope.setCareService = setCareService;
    var convertUsersCount = 0;
    var convertStartTime = 0;
    var convertBacked = false;
    var convertPending = false;
    var convertProps = OnboardStore['users.convert']; // shorthand alias

    $scope.messageFeatures.push(new ServiceFeature($translate.instant('onboardModal.msgFree'), 0, 'msgRadio', new FakeLicense('freeTeamRoom')));
    $scope.conferenceFeatures.push(new ServiceFeature($translate.instant('onboardModal.mtgFree'), 0, 'confRadio', new FakeLicense('freeConferencing')));
    $scope.communicationFeatures.push(new ServiceFeature($translate.instant('onboardModal.callFree'), 0, 'commRadio', new FakeLicense('advancedCommunication')));
    $scope.careFeatures.push(new ServiceFeature($translate.instant('onboardModal.careFree'), 0, 'careRadio', new FakeLicense('freeCareService')));
    $scope.currentUser = $stateParams.currentUser;

    $scope.currentUserDisplayName = function () {
      if (_.isObject($scope.currentUser)) {
        if (!_.isEmpty($scope.currentUser.displayName)) {
          return _.trim($scope.currentUser.displayName);
        } else if (_.isObject($scope.currentUser.name) && (!_.isEmpty($scope.currentUser.name.givenName) || !_.isEmpty($scope.currentUser.name.familyName))) {
          return _.trim(($scope.currentUser.name.givenName || '') + ' ' + ($scope.currentUser.name.familyName || ''));
        } else if (!_.isEmpty($scope.currentUser.userName)) {
          return _.trim($scope.currentUser.userName);
        }
      }
      // if all else fails, return Unknown
      return _.trim($translate.instant('common.unknown'));
    };

    if ($scope.currentUser) {
      userEnts = $scope.currentUser.entitlements;
      userLicenseIds = $scope.currentUser.licenseID;
      userInvites = $scope.currentUser.invitations;
      $scope.hybridCallServiceAware = userEnts && userEnts.indexOf('squared-fusion-uc') > -1;
    }

    function populateConf() {
      if (userLicenseIds) {
        _.forEach(userLicenseIds, function (userLicenseId) {
          _.forEach($scope.allLicenses, function (siteObj) {
            if (siteObj.siteUrl === '' && !siteObj.confModel) {
              siteObj.confModel = siteObj.licenseId === userLicenseId;
            }
            siteObj.confLic = _.map(siteObj.confLic, function (conf) {
              if (!conf.confModel) {
                conf.confModel = conf.licenseId === userLicenseId;
              }
              return conf;
            });
            siteObj.cmrLic = _.map(siteObj.cmrLic, function (cmr) {
              if (!cmr.cmrModel) {
                cmr.cmrModel = cmr.licenseId === userLicenseId;
              }
              return cmr;
            });
          });
        });
      }
    }

    function populateConfInvitations() {
      if (userInvites && userInvites.cf) {
        _.forEach($scope.allLicenses, function (siteObj) {
          if (siteObj.siteUrl === '' && !siteObj.confModel) {
            siteObj.confModel = siteObj.licenseId === userInvites.cf;
          }
          siteObj.confLic = _.map(siteObj.confLic, function (conf) {
            if (!conf.confModel) {
              conf.confModel = conf.licenseId === userInvites.cf;
            }
            return conf;
          });
        });
      }
    }

    function createPropertiesForAnalytics() {
      // FIXME (mipark2): understand original intent and fix this
      var servicesSelected = {};
      return OnboardService.createPropertiesForAnalytics(
        $scope.numAddedUsers,
        $scope.numUpdatedUsers,
        _.size($scope.results.errors),
        servicesSelected
      );
    }

    if (userEnts) {
      if (userEnts.indexOf('ciscouc') > -1) {
        currentUserHasCall = true;
        $scope.currentUserEnablesCall = true;
      }
      if (userEnts.indexOf('squared-room-moderation') > -1) {
        $scope.radioStates.msgRadio = true;
      }
      if (userEnts.indexOf('cloud-contact-center') > -1) {
        setCareService();
      }
    }

    if (userInvites) {
      if (userInvites.ms) {
        $scope.radioStates.msgRadio = true;
      }
      if (userInvites.cc) {
        setCareService();
      }
    }

    function setCareService() {
      var hasSyncKms = _.includes($scope.currentUser.roles, Config.backend_roles.spark_synckms);
      var hasContextServiceEntitlement = _.includes($scope.currentUser.entitlements, Config.entitlements.context);
      var hasSunlightDigital = _.includes($scope.currentUser.entitlements, Config.entitlements.care_digital);
      var hasSunlightVoice = _.includes($scope.currentUser.entitlements, Config.entitlements.care_inbound_voice);
      if (hasSyncKms && hasContextServiceEntitlement && hasSunlightDigital) {
        $scope.radioStates.initialCareRadioState = $scope.radioStates.careRadio = $scope.careRadioValue.K1;
      } else if (hasSyncKms && hasContextServiceEntitlement && hasSunlightVoice) {
        $scope.radioStates.initialCareRadioState = $scope.radioStates.careRadio = $scope.careRadioValue.K2;
      } else {
        $scope.radioStates.initialCareRadioState = $scope.radioStates.careRadio = $scope.careRadioValue.NONE;
      }
    }

    function shouldAddCallService() {
      return !currentUserHasCall && ($scope.currentUserEnablesCall || $scope.entitlements.ciscoUC);
    }

    function createFeatures(obj) {
      return {
        siteUrl: _.get(obj, 'license.siteUrl', ''),
        billing: _.get(obj, 'license.billingServiceId', ''),
        volume: _.get(obj, 'license.volume', ''),
        licenseId: _.get(obj, 'license.licenseId', ''),
        licenseModel: _.get(obj, 'license.licenseModel', ''),
        offerName: _.get(obj, 'license.offerName', ''),
        label: obj.label,
        isTrial: _.get(obj, 'license.isTrial', false),
        status: _.get(obj, 'license.status', ''),
        confModel: false,
        cmrModel: false,
      };
    }


    $scope.updateCmrLicensesForMetric = function (cmrModel, licenseId) {
      $scope.cmrLicensesForMetric[licenseId] = !cmrModel;
    };

    var generateConfChk = function (confs, cmrs) {
      $scope.confChk = [];
      $scope.allLicenses = [];
      $scope.basicLicenses = [];
      $scope.advancedLicenses = [];

      var formatLicense = function (site) {
        var confMatches = _.filter(confFeatures, function (o) {
          return _.toUpper(o.siteUrl) === _.toUpper(site);
        });
        var cmrMatches = _.filter(cmrFeatures, function (o) {
          return _.toUpper(o.siteUrl) === _.toUpper(site);
        });
        var isCISiteFlag = WebExUtilsFact.isCIEnabledSite(site);
        return {
          site: site,
          billing: _.uniq(_.map(cmrMatches, 'billing').concat(_.map(confMatches, 'billing'))),
          confLic: confMatches,
          cmrLic: cmrMatches,
          isCISite: isCISiteFlag,
          siteAdminUrl: (isCISiteFlag ? '' : WebExUtilsFact.getSiteAdminUrl(site)),
        };
      };

      for (var i in confs) {
        var temp = {
          confFeature: confs[i],
          confModel: false,
          confId: 'conf-' + i,
        };

        var confNoUrl = _.chain(confs)
          .filter(function (conf) {
            return conf.license.licenseType !== 'freeConferencing';
          })
          .filter(function (conf) {
            return !_.has(conf, 'license.siteUrl');
          })
          .map(createFeatures)
          .remove(undefined)
          .value();

        var confFeatures = _.chain(confs)
          .filter('license.siteUrl')
          .map(createFeatures)
          .remove(undefined)
          .value();
        var cmrFeatures = _.chain(cmrs)
          .filter('license.siteUrl')
          .map(createFeatures)
          .remove(undefined)
          .value();

        var siteUrls = _.map(confFeatures, function (lic) {
          return lic.siteUrl;
        });
        siteUrls = _.uniq(siteUrls);

        $scope.allLicenses = _.map(siteUrls, formatLicense);
        $scope.allLicenses = _.union(confNoUrl, $scope.allLicenses);

        for (var j in cmrs) {
          if (!_.isUndefined(cmrs[j]) && !_.isNull(cmrs[j]) && !_.isUndefined(confs[i].license.siteUrl)) {
            if (_.isEqual(confs[i].license.siteUrl, cmrs[j].license.siteUrl) && _.isEqual(confs[i].license.billingServiceId, cmrs[j].license.billingServiceId)) {
              temp.cmrFeature = cmrs[j];
              temp.cmrModel = false;
              temp.cmrId = 'cmr-' + j;
            }
          }
        }

        $scope.confChk.push(temp);
      }

      // Distinguish between basic license and advanced license types
      _.forEach($scope.allLicenses, function (license) {
        if (license.site) {
          $scope.advancedLicenses.push(license);
        } else {
          $scope.basicLicenses.push(license);
        }
      });

      populateConf();
      populateConfInvitations();
    };

    $scope.isSharedMeetingsLicense = function (license) {
      return _.toLower(_.get(license, 'confLic[0].licenseModel', '')) === Config.licenseModel.cloudSharedMeeting;
    };

    $scope.determineLicenseType = function (license) {
      return $scope.isSharedMeetingsLicense(license) ? $translate.instant('firstTimeWizard.sharedLicense') : $translate.instant('firstTimeWizard.namedLicense');
    };

    $scope.generateLicenseTooltip = function (license) {
      return '<div class="license-tooltip-html">' + $scope.generateLicenseTranslation(license) + '</div>';
    };

    $scope.generateLicenseTranslation = function (license) {
      return $scope.isSharedMeetingsLicense(license) ? $translate.instant('firstTimeWizard.sharedLicenseTooltip') : $translate.instant('firstTimeWizard.namedLicenseTooltip');
    };

    var getAccountServices = function () {
      var services = {
        message: Authinfo.getMessageServices({ assignableOnly: true }),
        conference: Authinfo.getConferenceServices(),
        communication: Authinfo.getCommunicationServices(),
        care: Authinfo.getCareServices(),
      };
      if (services.message) {
        services.message = OnboardService.mergeMultipleLicenseSubscriptions(services.message);
        $scope.messageFeatures = $scope.messageFeatures.concat(services.message);
        var licenses = _.get($scope.messageFeatures, '[1].licenses', []);
        if (userLicenseIds) {
          _.forEach(licenses, function (license) {
            license.model = userLicenseIds.indexOf(license.licenseId) >= 0;
          });
        }

        if (licenses.length > 1) {
          $scope.radioStates.msgRadio = true;
        }
      }
      if (services.conference) {
        $scope.cmrFeatures = Authinfo.getCmrServices();
        $scope.conferenceFeatures = $scope.conferenceFeatures.concat(services.conference);
        generateConfChk($scope.conferenceFeatures, $scope.cmrFeatures);
      }
      if (services.communication) {
        $scope.communicationFeatures = $scope.communicationFeatures.concat(services.communication);
        Orgservice.getLicensesUsage()
          .then(function (licenseUsages) {
            // Set the Spark Call checkbox and usage
            var commLicenseID = '';
            if (currentUserHasCall) {
              // validCallLicenses should be array of valid 'CO_' licenseIds
              var licenses = _.flatMap(licenseUsages, 'licenses');
              var licenseIds = _.map(licenses, 'licenseId');
              var validCallLicenses = _.filter(licenseIds, function (licenseId) {
                return _.startsWith(licenseId, 'CO_');
              });
              commLicenseID = _.find(userLicenseIds, function (license) {
                return _.startsWith(license, 'CO_') && validCallLicenses.indexOf(license) !== -1;
              });
            }

            _.forEach($scope.communicationFeatures, function (commFeature) {
              // Set current communication license checkbox
              if (!_.isUndefined(commFeature.license.licenseId) &&
                commFeature.license.licenseId === commLicenseID) {
                commFeature.commRadio = true;
                $scope.currentUserCommFeature = $scope.selectedCommFeature = commFeature;
              } else {
                commFeature.commRadio = false;
              }
              // Set communication license usage
              commFeature.license.usage = 0;
              _.forEach(licenseUsages, function (licenseUsage) {
                var index = _.findIndex(licenseUsage.licenses, function (license) {
                  return license.licenseId === commFeature.license.licenseId;
                });
                if (index >= 0) {
                  commFeature.license.usage = licenseUsage.licenses[index].usage;
                }
              });
            });
          });
      }
      if (services.care) {
        $scope.careFeatures = $scope.careFeatures.concat(services.care);
        $scope.cdcCareFeature = getCareFeature(Config.offerCodes.CDC);
        $scope.cvcCareFeature = getCareFeature(Config.offerCodes.CVC);
      }
    };

    if (Authinfo.isInitialized()) {
      getAccountServices();
    }

    var nameTemplate = '<div class="ui-grid-cell-contents"><span class="name-display-style">{{row.entity.name}}</span>' +
      '<span class="email-display-style">{{row.entity.address}}</span></div>';

    var internalExtensionTemplate = '<div ng-show="row.entity.assignedDn !== undefined"> ' +
      '<cs-select name="internalNumber" ' +
      'ng-model="row.entity.assignedDn" options="grid.appScope.internalNumberPool" ' +
      'refresh-data-fn="grid.appScope.returnInternalNumberlist(filter, row.entity.selectedLocation.uuid)" wait-time="0" ' +
      'placeholder="placeholder" input-placeholder="inputPlaceholder" ' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'internalNumber\')"' +
      'labelfield="{{grid.appScope.labelField}}" valuefield="uuid" required="true" filter="true"' +
      ' is-warn="{{grid.appScope.checkDnOverlapsSteeringDigit(row.entity)}}" warn-msg="{{\'usersPage.steeringDigitOverlapWarning\' | translate: { steeringDigitInTranslation: telephonyInfo.steeringDigit } }}" > </cs-select></div>' +
      '<div ng-show="row.entity.assignedDn === undefined"> ' +
      '<cs-select name="noInternalNumber" ' +
      'ng-model="grid.appScope.noExtInPool" labelfield="grid.appScope.noExtInPool" is-disabled="true" > </cs-select>' +
      '<span class="error">{{\'usersPage.noExtensionInPool\' | translate }}</span> </div> ';

    var locationTemplate = '<div>' +
    '<cs-select name="location" ' +
      'ng-model="row.entity.selectedLocation" options="grid.appScope.locationOptions" ' +
      'labelfield="name" valuefield="uuid" required="true" filter="true"' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'location\')"' +
      '</div>';

    var externalExtensionTemplate = '<div ng-show="row.entity.didDnMapMsg === undefined"> ' +
      '<cs-select name="externalNumber" ' +
      'ng-model="row.entity.externalNumber" options="grid.appScope.externalNumberPool" ' +
      'refresh-data-fn="grid.appScope.loadExternalNumberPool(filter)" wait-time="0" ' +
      'placeholder= "placeholder" input-placeholder="inputPlaceholder" ' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'externalNumber\')"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select></div> ' +
      '<div ng-show="row.entity.didDnMapMsg !== undefined"> ' +
      '<cs-select name="grid.appScope.noExternalNumber" ' +
      'ng-model="row.entity.externalNumber" options="grid.appScope.externalNumberPool" class="select-warning"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"> </cs-select>' +
      '<span class="warning did-map-error">{{row.entity.didDnMapMsg | translate }}</span> </div> ';

    $scope.noExtInPool = $translate.instant('usersPage.notApplicable');
    $scope.noExternalNum = $translate.instant('usersPage.notApplicable');

    $scope.$watch('model.userList', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.usrlist = OnboardService.parseUsersList($scope.model.userList);
      }
    });

    // To differentiate the user list change made by map operation
    //  and other manual/reset operation.
    $scope.$watch('usrlist', function () {
      if ($scope.isMapped) {
        $scope.isMapped = false;
      } else {
        // For I1484 feature, turn on map only when location count is 1 (default)
        if (!$scope.ishI1484 || ($scope.ishI1484 && $scope.locationOptions.length === 1)) {
          $scope.isMapEnabled = true;
        }
      }

      if ($scope.isReset) {
        $scope.isReset = false;
      } else {
        $scope.isResetEnabled = true;
      }
    }, true);

    $scope.$watch('currentUserEnablesCall', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        // Store value of checkbox in service (cast to bool)
        OnboardService.huronCallEntitlement = !!newVal;

        // Do not change wizard text when configuring bulk user services
        if (!_.isUndefined($scope.wizard) && !($scope.wizard.current.step.name === 'csvServices' || $scope.wizard.current.step.name === 'dirsyncServices')) {
          if (shouldAddCallService()) {
            $scope.$emit('wizardNextText', 'next');
          } else {
            $scope.$emit('wizardNextText', 'finish');
          }
        }
      }
    });

    $scope.$watch('wizard.current.step', function () {
      if (!_.isUndefined($scope.wizard) && $scope.wizard.current.step.name === 'assignServices') {
        if (shouldAddCallService()) {
          $scope.$emit('wizardNextText', 'next');
        } else {
          $scope.$emit('wizardNextText', 'finish');
        }
      } else if (!_.isUndefined($scope.wizard) && $scope.wizard.current.step.name === 'assignDnAndDirectLines') {
        if (!shouldAddCallService()) {
          // we don't have call service, so skip to previous step
          $scope.wizard.previousStep();
        } else {
          $scope.isResetEnabled = false;
          $scope.validateDnForUser();
        }
      }
    });

    $scope.$watch('radioStates.msgRadio', function () {
      $scope.controlMsg();
    });

    $scope.validateDnForUser = function () {
      if ($scope.isDnNotAvailable()) {
        $scope.$emit('wizardNextButtonDisable', true);
      } else {
        $scope.$emit('wizardNextButtonDisable', false);
      }
    };

    $scope.isResetEnabled = false;
    $scope.validateDnForUser();

    $scope.addDnGridOptions = {
      data: 'usrlist',
      enableHorizontalScrollbar: 0,
      enableRowSelection: false,
      multiSelect: false,
      rowHeight: 45,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      columnDefs: [{
        field: 'name',
        displayName: $translate.instant('common.user'),
        sortable: false,
        cellTemplate: nameTemplate,
        width: '*',
      }, {
        field: 'externalNumber',
        displayName: $translate.instant('usersPage.directLineHeader'),
        sortable: false,
        cellTemplate: externalExtensionTemplate,
        maxWidth: 220,
        minWidth: 140,
        width: '*',
      }, {
        field: 'internalExtension',
        displayName: $translate.instant('usersPage.extensionHeader'),
        sortable: false,
        cellTemplate: internalExtensionTemplate,
        maxWidth: 220,
        minWidth: 140,
        width: '*',
      }],
    };

    function showLocationSelectColumn() {
      if ($scope.locationOptions.length > 1) {
        vm.locationColumn = {
          field: 'location',
          displayName: $translate.instant('usersPreview.location'),
          sortable: false,
          cellTemplate: locationTemplate,
          width: '*',
        };
        $scope.addDnGridOptions.columnDefs.splice(1, 0, vm.locationColumn);
      }
    }

    $scope.onboardUsers = onboardUsers;

    var usersList = [];

    /**
     * get the current license settings for the CF_ licenses
     *
     * @param {string[]} state - return license list based on matching state (checked = true)
     */
    var getConfIdList = function (state) {
      var idList = [];

      _.forEach($scope.allLicenses, function (license) {
        if (!_.isArray(license) && license.confModel === state) {
          idList.push(license.licenseId);
        }
        idList = idList.concat(_(license.confLic)
          .filter({
            confModel: state,
          })
          .map('licenseId')
          .remove(undefined)
          .value()
        );

        idList = idList.concat(_(license.cmrLic)
          .filter({
            cmrModel: state,
          })
          .map('licenseId')
          .remove(undefined)
          .value()
        );
      });

      return idList;
    };

    function filterList(str) {
      if ($scope.timer) {
        $timeout.cancel($scope.timer);
        $scope.timer = 0;
      }

      $scope.timer = $timeout(function () {
        if (str.length >= 3 || str === '') {
          $scope.searchStr = str;
          getUnlicensedUsers();
          Analytics.trackUserOnboarding(Analytics.sections.USER_ONBOARDING.eventNames.CONVERT_USER, $state.current.name, Authinfo.getOrgId());
        }
      }, $scope.timeoutVal);
    }

    /**
     * get the list of selected account licenses on the dialog
     *
     * @param {null|Object[]} action - 'additive' - add new licenses only, 'patch' - remove any licenses not specified
     */
    function getAccountLicenses(action) {
      var licenseList = [];
      if (Authinfo.hasAccount()) {
        var msgIndex = $scope.radioStates.msgRadio ? 1 : 0;
        var selMsgService = $scope.messageFeatures[msgIndex];
        var licenses = selMsgService.license || selMsgService.licenses;
        // Messaging: prefer selected subscription, if specified
        if (_.isArray(licenses)) {
          if (licenses.length > 1) {
            _.forEach(licenses, function (license) {
              licenseList.push(new LicenseFeature(license.licenseId, license.model));
            });
          } else {
            licenseList.push(new LicenseFeature(licenses[0].licenseId, true));
          }
        } else {
          if ('licenseId' in licenses) {
            // Add new licenses
            licenseList.push(new LicenseFeature(licenses.licenseId, true));
          } else if ((action === 'patch') && ($scope.messageFeatures.length > 1) && ('licenseId' in $scope.messageFeatures[1].licenses[0])) {
            // Remove existing license
            licenseList.push(new LicenseFeature($scope.messageFeatures[1].licenses[0].licenseId, false));
          }
        }

        // Conferencing: depends on model (standard vs. CMR)
        var cidListAdd = getConfIdList(true);
        for (var i = 0; i < cidListAdd.length; i++) {
          licenseList.push(new LicenseFeature(cidListAdd[i], true));
        }
        if (action === 'patch') {
          var cidListRemove = getConfIdList(false);
          for (i = 0; i < cidListRemove.length; i++) {
            licenseList.push(new LicenseFeature(cidListRemove[i], false));
          }
        }

        // Communication
        if (currentUserHasCall) { // has existing communication license
          var currentLicenseId = _.get($scope.currentUserCommFeature, 'license.licenseId');
          if ($scope.currentUserEnablesCall) { // has selected a communication license
            // check if the license is the same, if not, do the move
            var selectedLicenseId = _.get($scope.selectedCommFeature, 'license.licenseId');
            if (currentLicenseId !== selectedLicenseId) {
              // move license & prevent undefined licenseIds from being passed on to LicenseFeature/licenseList
              if (currentLicenseId) {
                licenseList.push(new LicenseFeature(currentLicenseId, false));
              }
              if (selectedLicenseId) {
                licenseList.push(new LicenseFeature(selectedLicenseId, true));
              }
            }
          } else {
            // delete license & prevent undefined licenseIds from being passed on to LicenseFeature/licenseList
            if (action === 'patch' && currentLicenseId) {
              licenseList.push(new LicenseFeature(currentLicenseId, false));
            }
          }
        } else { // no existing communication license
          if ($scope.currentUserEnablesCall) {
            // add new license (may select trial)
            licenseList.push(new LicenseFeature($scope.selectedCommFeature.license.licenseId, true));
          }
        }

        // BEGIN: Care License provisioning for users
        var selCareService = {};

        // get the selected care service according to care radio button selected
        switch ($scope.radioStates.careRadio) {
          case $scope.careRadioValue.K1:
            if ($scope.cdcCareFeature.license.licenseId) {
              selCareService = $scope.cdcCareFeature;
            }
            break;
          case $scope.careRadioValue.K2:
            if ($scope.cvcCareFeature.license.licenseId) {
              selCareService = $scope.cvcCareFeature;
            }
            break;
          case $scope.careRadioValue.NONE:
            selCareService = $scope.careFeatures[0];
            break;
        }

        // push and remove licenses in licenseList as per selected care service
        var licenseId = _.get(selCareService, 'license.licenseId', null);
        if (licenseId) {
          licenseList.push(new LicenseFeature(licenseId, true));

          if (_.startsWith(licenseId, Config.offerCodes.CDC)) {
            removeCareLicence($scope.cvcCareFeature, licenseList);
          } else if (_.startsWith(licenseId, Config.offerCodes.CVC)) {
            removeCareLicence($scope.cdcCareFeature, licenseList);
          }
        } else if (action === 'patch' && $scope.careRadioValue.NONE !== $scope.radioStates.initialCareRadioState) { // will get invoked when None is selected in care radio and  previous state was not none
          removeCareLicence($scope.cdcCareFeature, licenseList);
          removeCareLicence($scope.cvcCareFeature, licenseList);
        }
        // END: Care License provisioning for users

        // Metrics for care entitlement for users
        if ($scope.radioStates.careRadio !== $scope.radioStates.initialCareRadioState) {
          if ($scope.radioStates.careRadio === $scope.careRadioValue.K1) {
            LogMetricsService.logMetrics('Enabling care for user', LogMetricsService.getEventType('careEnabled'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
          } else if ($scope.radioStates.careRadio === $scope.careRadioValue.K2) {
            LogMetricsService.logMetrics('Enabling care for user', LogMetricsService.getEventType('careVoiceEnabled'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
          }
          if ($scope.radioStates.initialCareRadioState === $scope.careRadioValue.K1) {
            LogMetricsService.logMetrics('Disabling care for user', LogMetricsService.getEventType('careDisabled'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
          }
          if ($scope.radioStates.initialCareRadioState === $scope.careRadioValue.K2) {
            LogMetricsService.logMetrics('Disabling careVoice for user', LogMetricsService.getEventType('careVoiceDisabled'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
          }
        }
      }
      return licenseList.length === 0 ? null : licenseList;
    }

    function getCareFeature(offerName) {
      return _.find($scope.careFeatures, function (careFeature) {
        return _.startsWith(careFeature.license.licenseId, offerName);
      });
    }

    function removeCareLicence(careFeature, licenseList) {
      if (careFeature && careFeature.license.licenseId) {
        licenseList.push(new LicenseFeature(careFeature.license.licenseId, false));
      }
    }

    function getEntitlements(action) {
      return OnboardService.getEntitlements(action, $scope.entitlements);
    }

    // Hybrid Services entitlements
    var getHybridServicesEntitlements = function (action) {
      return _.chain($scope.hybridServicesEntitlements)
        .filter(function (entry) {
          return action === 'add' && entry.entitlementState === 'ACTIVE';
        })
        .map(function (entry) {
          return new Feature(entry.entitlementName, entry.entitlementState);
        })
        .value();
    };

    $scope.updateUserLicense = function () {
      var users = [];
      if (_.get($scope, 'usrlist.length')) {
        users = $scope.usrlist;
      } else if ($scope.currentUser) {
        usersList = [];
        var userObj = {
          address: $scope.currentUser.userName,
          name: $scope.currentUser.name,
        };
        users.push(userObj);
        usersList.push(users);
      }
      $scope.btnSaveEntLoad = true;

      // make sure we have any internal extension and direct line set up for the users
      _.forEach(users, function (user) {
        if (!$scope.ishI1484) {
          user.internalExtension = _.get(user, 'assignedDn.number');
        } else {
          user.internalExtension = _.get(user, 'assignedDn.internal');
        }
        if ($scope.ishI1484 && $scope.locationOptions.length > 1) {
          user.location = _.get(user, 'selectedLocation.uuid');
        }
        if (user.externalNumber && user.externalNumber.uuid && user.externalNumber.uuid !== 'none') {
          user.directLine = user.externalNumber.pattern;
        }
      });

      Userservice.onboardUsersLegacy(users, null, getAccountLicenses('patch'))
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(response) {
        // adapt response to call existing entitleUserCallback
        var rdata = response.data || {};
        rdata.success = true;
        $rootScope.$broadcast('Userservice::updateUsers');
        entitleUserCallback(rdata, response.status, 'updateUserLicense', response.headers);
      }

      function errorCallback(response) {
        var rdata = response || {};
        rdata.success = false;
        rdata.status = response.status || false;
        entitleUserCallback(rdata, response.status, 'updateUserLicense', response.headers);
      }
    };

    //****************MODAL INIT FUNCTION FOR INVITE AND ADD***************
    //***
    //***
    //*********************************************************************

    var Feature = require('modules/core/users/shared/onboard/feature.model').default;

    function LicenseFeature(name, bAdd) {
      return {
        id: name.toString(),
        idOperation: bAdd ? 'ADD' : 'REMOVE',
        properties: {},
      };
    }

    $scope.isAddEnabled = function () {
      return Authinfo.isAddUserEnabled();
    };

    $scope.isEntitleEnabled = function () {
      return Authinfo.isEntitleUserEnabled();
    };

    // TODO (mipark2): rm this if determined no longer needed (see: '$scope.manualEntryNext()')
    $scope.invalidcount = OnboardStore['users.add.manual'].invalidcount;

    var resetUsersfield = function () {
      return OnboardService.resetUsersfield($scope);
    };

    // TODO (mipark2): rm this if no longer needed:
    $scope.clearPanel = function () {
      resetUsersfield();
      initResults();
    };

    $scope.fixBulkErrors = function () {
      if (isFTW) {
        $scope.wizard.goToStep('manualEntry');
      } else {
        Analytics.trackAddUsers(Analytics.sections.ADD_USERS.eventNames.GO_BACK_FIX, null, createPropertiesForAnalytics());
        $state.go('users.add.manual');
      }
    };

    function onboardUsers(optionalOnboard) {
      initResults();
      usersList = OnboardService.parseUsersList($scope.model.userList);

      // early-out if user list is empty
      if (_.isEmpty(usersList)) {
        if (optionalOnboard) {
          return $q.resolve();
        } else {
          Notification.error('usersPage.validEmailInput');
          return $q.reject();
        }
      }

      $scope.btnOnboardLoading = true;

      _.forEach(usersList, function (userItem) {
        var userAndDnObj = $scope.usrlist.filter(function (user) {
          return (user.address === userItem.address);
        });

        if ($scope.ishI1484 && $scope.locationOptions.length > 1) {
          userItem.location = userAndDnObj[0].selectedLocation.uuid;
        }

        if ($scope.ishI1484) {
          if (userAndDnObj[0].assignedDn && userAndDnObj[0].assignedDn.siteToSite.length > 0) {
            userItem.internalExtension = userAndDnObj[0].assignedDn.internal;
          }
        } else {
          if (userAndDnObj[0].assignedDn && userAndDnObj[0].assignedDn.number.length > 0) {
            userItem.internalExtension = userAndDnObj[0].assignedDn.number;
          }
        }

        if (userAndDnObj[0].externalNumber && userAndDnObj[0].externalNumber.uuid !== 'none') {
          userItem.directLine = userAndDnObj[0].externalNumber.pattern;
        }
      });

      var entitleList = [],
        licenseList = [];

      // notes:
      // - start with all enabled entitlements
      entitleList = getEntitlements('add');

      // - as of 2017-05-19, this conditional branch does not collect enabled entitlements
      if (Authinfo.hasAccount()) {
        licenseList = getAccountLicenses('additive');

        // - so either isolate the messenger interop entitlement, or reset the list
        entitleList = MessengerInteropService.hasAssignableMessageOrgEntitlement()
          ? _.filter(entitleList, { entitlementName: 'messengerInterop' })
          : [];
      }

      entitleList = entitleList.concat(getHybridServicesEntitlements('add'));

      return OnboardService.onboardUsersInChunks(usersList, entitleList, licenseList)
        .catch(function (rejectedResponse) {
          // notes:
          // - potentially multiple 'Userservice.onboardUsers()' calls could have been made
          // - if any calls reject (or in the case of multiple calls, the first one rejects), we
          //   error notify and re-reject
          Notification.errorResponse(rejectedResponse);
          return $q.reject();
        })
        .then(function (aggregateResults) {
          // TODO: rm this if determined no longer needed (onboarding user still in FTSW?)
          if (isFTW) {
            return $q.resolve();
          }

          // put aggregate results back into scope variables
          $scope.numUpdatedUsers = aggregateResults.numUpdatedUsers;
          $scope.numAddedUsers = aggregateResults.numAddedUsers;
          $scope.results.resultList = _.get(aggregateResults, 'results.resultList');
          $scope.results.errors = _.get(aggregateResults, 'results.errors');
          $scope.results.warnings = _.get(aggregateResults, 'results.warnings');

          // notes:
          // - trim out entries for successfully onboarded users
          // - if errors are present, the next step ('users.add.results') will show a link allowing
          //   jump back to 'users.add.manual', which renders the remaining user entries
          _.forEach($scope.results.resultList, function (userResult) {
            if (userResult.alertType === 'success' && userResult.email) {
              $scope.model.userList = OnboardService.removeEmailFromTokenfield(userResult.email, $scope.model.userList);
            }
          });

          $state.go('users.add.results', {
            convertPending: convertPending,
            convertUsersFlow: $scope.convertUsersFlow,
            numUpdatedUsers: $scope.numUpdatedUsers,
            numAddedUsers: $scope.numAddedUsers,
            results: $scope.results,
          });
        })
        .finally(function () {
          $rootScope.$broadcast('USER_LIST_UPDATED');
          $scope.btnOnboardLoading = false;
        });
    }

    $scope.hybridServicesEntitlements = [];
    $scope.updateHybridServicesEntitlements = function (entitlements) {
      $scope.hybridCallServiceAware = _.some(entitlements, {
        entitlementName: 'squaredFusionUC',
        entitlementState: 'ACTIVE',
      });
      $scope.hybridServicesEntitlements = entitlements;
    };

    function entitleUserCallback(data, status, method, headers) {
      initResults();
      $scope.numAddedUsers = 0;
      $scope.numUpdatedUsers = 0;
      var isComplete = true;

      $rootScope.$broadcast('USER_LIST_UPDATED');
      if (data.success) {
        Log.info('User successfully updated', data);

        var userResponseArray = _.get(data, 'userResponse');
        _.forEach(userResponseArray, function (userResponseItem) {
          var userResult = {
            email: userResponseItem.email,
            alertType: null,
          };

          var httpStatus = userResponseItem.status;

          switch (httpStatus) {
            case 200:
            case 201: {
              userResult.message = $translate.instant('onboardModal.result.200');
              userResult.alertType = 'success';
              if (httpStatus === 200) {
                $scope.numUpdatedUsers++;
              } else if (httpStatus === 201) {
                $scope.numAddedUsers++;
              }
              break;
            }
            case 404: {
              userResult.message = $translate.instant('onboardModal.result.404');
              userResult.alertType = 'danger';
              isComplete = false;
              break;
            }
            case 408: {
              userResult.message = $translate.instant('onboardModal.result.408');
              userResult.alertType = 'danger';
              isComplete = false;
              break;
            }
            case 409: {
              userResult.message = $translate.instant('onboardModal.result.409');
              userResult.alertType = 'danger';
              isComplete = false;
              break;
            }
            default: {
              if (userResponseItem.message === Config.messageErrors.hybridServicesComboError) {
                userResult.message = $translate.instant('onboardModal.result.400094', {
                  status: httpStatus,
                });
                userResult.alertType = 'danger';
                isComplete = false;
              } else if (_.includes(userResponseItem.message, 'DN_IS_FALLBACK')) {
                userResult.message = $translate.instant('onboardModal.result.deleteUserDnFallbackError');
                userResult.alertType = 'danger';
                isComplete = false;
              } else {
                userResult.message = $translate.instant('onboardModal.result.other', {
                  status: httpStatus,
                });
                userResult.alertType = 'danger';
                isComplete = false;
              }
              break;
            }
          }

          $scope.results.resultList.push(userResult);
          if (method !== 'convertUser') {
            $scope.$dismiss();
          }
        });


        for (var idx in $scope.results.resultList) {
          if ($scope.results.resultList[idx].alertType !== 'success') {
            $scope.results.errors.push(UserCsvService.addErrorWithTrackingID($scope.results.resultList[idx].email + ' ' + $scope.results.resultList[idx].message, null, headers));
          }
        }

        //Displaying notifications
        if (method !== 'convertUser') {
          if ($scope.results.errors.length) {
            $scope.btnOnboardLoading = false;
            $scope.btnSaveEntLoad = false;
            Notification.notify($scope.results.errors, 'error');
          }
        }
      } else {
        Log.warn('Could not entitle the user', data);
        var error = null;
        if (status) {
          error = $translate.instant('errors.statusError', {
            status: status,
          });
          if (data && _.isString(data.message)) {
            error += ' ' + $translate.instant('usersPage.messageError', {
              message: data.message,
            });
          }
        } else {
          error = 'Request failed.';
          if (_.isString(data)) {
            error += ' ' + data;
          }
        }
        error = UserCsvService.addErrorWithTrackingID(error, null, headers);
        if (method !== 'convertUser') {
          Notification.notify([error], 'error');
          isComplete = false;
          $scope.btnOnboardLoading = false;
          $scope.btnSaveEntLoad = false;
        } else {
          $scope.results.errors.push(error);
        }
      }

      if (method !== 'convertUser') {
        if (isComplete) {
          resetUsersfield();
        }
      } else {
        if ($scope.convertSelectedList.length > 0 && convertProps.convertCancelled === false && convertBacked === false) {
          convertUsersInBatch();
        } else {
          if (convertBacked === false) {
            $scope.btnConvertLoad = false;
            $state.go('users.convert.results', {
              convertPending: convertPending,
              convertUsersFlow: $scope.convertUsersFlow,
              numUpdatedUsers: $scope.numUpdatedUsers,
              numAddedUsers: $scope.numAddedUsers,
              results: $scope.results,
            });
          } else {
            $state.go('users.convert', {});
          }
          var msg = 'Migrated ' + $scope.numUpdatedUsers + ' users';
          var migratedata = {
            totalUsers: convertUsersCount,
            successfullyConverted: $scope.numUpdatedUsers,
          };
          LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('convertUsers'), LogMetricsService.getEventAction('buttonClick'), 200, convertStartTime, $scope.numUpdatedUsers, migratedata);
        }
      }
    }

    //radio group
    $scope.entitlements = {};
    var setEntitlementList = function () {
      if (_.isArray($rootScope.services)) {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i].serviceId;

          $scope.entitlements[svc] = false;
          if (svc === 'webExSquared') {
            $scope.entitlements[svc] = true;
          }
        }
      }
      $scope.entitlementsKeys = Object.keys($scope.entitlements).sort().reverse();
    };

    $scope.$on('AuthinfoUpdated', function () {
      if (_.isArray($rootScope.services) && $rootScope.services.length === 0) {
        $rootScope.services = Authinfo.getServices();
      }
      setEntitlementList();
    });

    // Wizard hook for next button
    $scope.manualEntryNext = function () {
      isFTW = true;
      var deferred = $q.defer();

      var userList = OnboardService.parseUsersList($scope.model.userList);
      if (userList.length === 0) {
        $q.resolve($scope.wizard.nextTab()).then(function () {
          deferred.reject();
        });
      } else {
        if ($scope.invalidcount === 0) {
          deferred.resolve();
        } else {
          Notification.error('usersPage.validEmailInput');
          deferred.reject();
        }
      }
      return deferred.promise;
    };

    // Wizard hook for save button
    $scope.assignServicesNext = function () {
      var deferred = $q.defer();

      if (shouldAddCallService()) {
        $scope.processing = true;
        activateDID();
        deferred.resolve();
      } else {
        onboardUsers(true).then(function () {
          deferred.reject(); // prevent the wizard from going forward
          $scope.wizard.goToStep('addUsersResults');
        });
      }
      return deferred.promise;
    };

    $scope.getServicesNextText = function () {
      if (shouldAddCallService()) {
        return 'common.next';
      } else {
        return 'common.save';
      }
    };

    // Wizard hook for modal save button
    $scope.assignDnAndDirectLinesNext = function () {
      var deferred = $q.defer();
      var didDnDupes = checkDidDnDupes();
      // check for DiD duplicates
      if (didDnDupes.didDupe) {
        Log.debug('Duplicate Direct Line entered.');
        Notification.error('usersPage.duplicateDidFound');
        deferred.reject();
        return deferred.promise;
      }
      // check for Dn duplicates
      if (didDnDupes.dnDupe) {
        Log.debug('Duplicate Internal Extension entered.');
        Notification.error('usersPage.duplicateDnFound');
        deferred.reject();
        return deferred.promise;
      }
      return onboardUsers(true);
    };

    $scope.isServiceAllowed = function (service) {
      return Authinfo.isServiceAllowed(service);
    };

    $scope.getServiceName = function (service) {
      for (var i = 0; i < _.get($rootScope, 'services', []).length; i++) {
        var svc = $rootScope.services[i];
        if (svc.serviceId === service) {
          return svc.displayName;
        }
      }
    };

    $scope.shouldAddIndent = function (key, reference) {
      return key !== reference;
    };

    var watchCheckboxes = function () {
      $timeout(function () { });
      var flag = false;
      $scope.$watchCollection('entitlements', function (newEntitlements, oldEntitlements) {
        if (flag) {
          flag = false;
          return;
        }
        var changedKey = Utils.changedKey(newEntitlements, oldEntitlements);
        if (changedKey === 'webExSquared' && !newEntitlements.webExSquared && Utils.areEntitlementsActive($scope.entitlements)) {
          for (var key in $scope.entitlements) {
            if (key !== 'webExSquared') {
              $scope.entitlements[key] = false;
              flag = true;
            }
          }
          $scope.saveDisabled = false;
        } else if (!$scope.entitlements.webExSquared && !oldEntitlements[changedKey] && changedKey !== 'webExSquared') {
          $scope.entitlements.webExSquared = true;
          $scope.saveDisabled = false;
        } else if (newEntitlements !== oldEntitlements) {
          $scope.saveDisabled = false;
        }

        if (changedKey === 'ciscoUC' && newEntitlements[changedKey]) {
          $scope.$emit('wizardNextText', 'next');
        } else if (changedKey === 'ciscoUC') {
          $scope.$emit('wizardNextText', 'finish');
        }
      });
    };

    //set intitially when loading the page
    //on initial login the AuthinfoUpdated broadcast may not be caught if not on user page
    setEntitlementList();
    watchCheckboxes();

    $scope.cancelConvert = function () {
      if (convertPending === true) {
        convertProps.convertCancelled = true;
      } else {
        $scope.$dismiss();
      }
    };

    $scope.goToConvertUsers = function () {
      if (convertPending === true) {
        convertBacked = true;
      } else {
        $state.go('users.convert', {});
      }
    };

    $scope.assignDNForConvertUsers = function () {
      var didDnDupes = checkDidDnDupes();
      // check for DiD duplicates
      if (didDnDupes.didDupe) {
        Log.debug('Duplicate Direct Line entered.');
        Notification.error('usersPage.duplicateDidFound');
        return;
      }
      // check for Dn duplicates
      if (didDnDupes.dnDupe) {
        Log.debug('Duplicate Internal Extension entered.');
        Notification.error('usersPage.duplicateDnFound');
        return;
      }

      // copy numbers to convertSelectedList
      _.forEach($scope.usrlist, function (user) {
        var userArray = $scope.convertSelectedList.filter(function (selectedUser) {
          return user.address === selectedUser.userName;
        });
        userArray[0].assignedDn = user.assignedDn;
        userArray[0].externalNumber = user.externalNumber;
      });

      return $scope.convertUsers();
    };

    $scope.saveConvertList = function () {
      $scope.selectedState = $scope.gridApi.saveState.save();
      $scope.convertSelectedList = $scope.gridApi.selection.getSelectedRows();
      convertUsersCount = $scope.convertSelectedList.length;
      $scope.convertUsersFlow = true;
      convertPending = false;
      // TODO if auto-assign, should go to summary screen
      $state.go('users.convert.services', {});
    };

    $scope.convertUsersNext = function () {
      // TODO if auto-assign, should just call convertUsers
      if (shouldAddCallService()) {
        $scope.processing = true;
        // Copying selected users to user list
        $scope.usrlist = [];
        _.forEach($scope.convertSelectedList, function (selectedUser) {
          var user = {};
          var givenName = '';
          var familyName = '';
          if (!_.isUndefined(selectedUser.name)) {
            if (!_.isUndefined(selectedUser.name.givenName)) {
              givenName = selectedUser.name.givenName;
            }
            if (!_.isUndefined(selectedUser.name.familyName)) {
              familyName = selectedUser.name.familyName;
            }
          }
          if (!_.isUndefined(givenName) || !_.isUndefined(familyName)) {
            user.name = givenName + ' ' + familyName;
          }
          user.address = selectedUser.userName;
          $scope.usrlist.push(user);
        });
        activateDID();
        $state.go('users.convert.services.dn');
      } else {
        $scope.convertUsers();
      }
    };

    $scope.convertUsers = function () {
      $scope.btnConvertLoad = true;
      convertPending = true;
      convertProps.convertCancelled = false;
      convertBacked = false;
      $scope.numAddedUsers = 0;
      $scope.numUpdatedUsers = 0;
      convertStartTime = moment();
      convertUsersInBatch();
    };

    function convertUsersInBatch() {
      var batch = $scope.convertSelectedList.slice(0, Config.batchSize);
      $scope.convertSelectedList = $scope.convertSelectedList.slice(Config.batchSize);
      Userservice.migrateUsers(batch, function (data) {
        var successMovedUsers = [];
        var match = function (batchObj) {
          return user.address === batchObj.userName;
        };
        for (var i = 0; i < data.userResponse.length; i++) {
          if (data.userResponse[i].status !== 200) {
            $scope.results.errors.push(data.userResponse[i].email + $translate.instant('homePage.convertError'));
          } else {
            var user = {
              address: data.userResponse[i].email,
            };
            var userArray = batch.filter(match);
            user.assignedDn = userArray[0].assignedDn;
            user.externalNumber = userArray[0].externalNumber;
            successMovedUsers.push(user);
          }
        }

        // TODO if auto-assign, should not update users
        if (successMovedUsers.length > 0) {
          var entitleList = [];
          var licenseList = [];
          if (Authinfo.hasAccount()) {
            licenseList = getAccountLicenses('patch');
          } else {
            entitleList = getEntitlements('add');
          }
          entitleList = entitleList.concat(getHybridServicesEntitlements('add'));
          convertPending = false;
          Userservice.updateUsers(successMovedUsers, licenseList, entitleList, 'convertUser', entitleUserCallback);
        } else {
          if ($scope.convertSelectedList.length > 0 && convertProps.convertCancelled === false && convertBacked === false) {
            convertUsersInBatch();
          } else {
            convertPending = false;
            if (convertBacked === false) {
              $scope.btnConvertLoad = false;
              $state.go('users.convert.results', {
                convertPending: convertPending,
                convertUsersFlow: $scope.convertUsersFlow,
                numUpdatedUsers: $scope.numUpdatedUsers,
                numAddedUsers: $scope.numAddedUsers,
                results: $scope.results,
              });
            } else {
              $state.go('users.convert', {});
            }
            var msg = 'Migrated ' + $scope.numUpdatedUsers + ' users';
            var migratedata = {
              totalUsers: convertUsersCount,
              successfullyConverted: $scope.numUpdatedUsers,
            };
            LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('convertUsers'), LogMetricsService.getEventAction('buttonClick'), 200, convertStartTime, $scope.numUpdatedUsers, migratedata);
          }
        }
      });
    }

    var getUnlicensedUsers = function () {
      $scope.showSearch = false;
      Orgservice.getUnlicensedUsers(function (data) {
        $scope.unlicensed = 0;
        $scope.unlicensedUsersList = null;
        $scope.showSearch = true;
        if (data.success) {
          if (data.totalResults) {
            $scope.unlicensed = data.totalResults;
            $scope.unlicensedUsersList = data.resources;
          }
        }
      }, null, $scope.searchStr);
    };

    $scope.convertDisabled = function () {
      return $scope.isDirSyncEnabled || !$scope.gridApi || $scope.gridApi.selection.getSelectedRows().length === 0;
    };

    getUnlicensedUsers();

    $scope.convertGridOptions = {
      data: 'unlicensedUsersList',
      rowHeight: 45,
      enableHorizontalScrollbar: 0,
      selectionRowHeaderWidth: 50,
      enableRowHeaderSelection: !$scope.convertUsersReadOnly,
      enableFullRowSelection: !$scope.convertUsersReadOnly,
      useExternalSorting: false,
      enableColumnMenus: false,
      showFilter: false,
      saveSelection: true,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        if ($scope.selectedState) {
          $timeout(function () {
            gridApi.saveState.restore($scope, $scope.selectedState);
          }, 100);
        }
        $timeout(gridApi.core.handleWindowResize, 200);
      },
      columnDefs: [{

        field: 'displayName',
        displayName: $translate.instant('usersPage.displayNameHeader'),
        resizable: false,
        sortable: true,
      }, {
        field: 'userName',
        displayName: $translate.instant('homePage.emailAddress'),
        resizable: false,
        sort: {
          direction: 'desc',
          priority: 0,
        },
        sortCellFiltered: true,
      }],
    };

    /////////////////////////////////
    // DirSync Bulk Onboarding logic
    var userArray = [];
    var cancelDeferred;
    var saveDeferred;
    $scope.initBulkMetric = initBulkMetric;
    $scope.sendBulkMetric = sendBulkMetric;

    var bulkStartLog = moment();

    function initBulkMetric() {
      bulkStartLog = moment();
    }

    function sendBulkMetric() {
      var eType = LogMetricsService.getEventType('bulkCsvUsers');
      var currentStepName = _.get($scope, 'wizard.current.step.name', 'csvResult');
      if (currentStepName === 'dirsyncResult') {
        eType = LogMetricsService.getEventType('bulkDirSyncUsers');
      }
      var data = {
        newUsersCount: $scope.model.numNewUsers || 0,
        updatedUsersCount: $scope.model.numExistingUsers || 0,
        errorUsersCount: _.isArray($scope.model.userErrorArray) ? $scope.model.userErrorArray.length : 0,
      };
      LogMetricsService.logMetrics('Finished bulk processing', eType, LogMetricsService.getEventAction('buttonClick'), 200, bulkStartLog, 1, data);
    }

    $scope.cancelProcessCsv = function () {
      cancelDeferred.resolve();
      saveDeferred.resolve();
    };

    /////////////////////////////////
    // Bulk DirSync Onboarding logic
    // Wizard hooks
    $scope.installConnectorNext = function () {
      return DirSyncService.refreshStatus().then(function () {
        return $q(function (resolve, reject) {
          if (DirSyncService.isDirSyncEnabled()) {
            // getStatus() is in the parent scope - AddUserCtrl
            if (_.isFunction($scope.getStatus)) {
              return $scope.getStatus().then(function () {
                resolve();
              });
            } else {
              reject();
            }
          } else {
            $scope.dirsyncStatus = $translate.instant('firstTimeWizard.syncNotConfigured');
            $scope.numUsersInSync = '';
            $scope.dirsyncUserCountText = '';
            resolve();
          }
        });
      });
    };

    // hack to allow adding services when exiting the users.manage.dir-sync.add.ob.syncStatus state
    $scope.dirsyncInitForServices = function () {
      userArray = [];
      if ($scope.userList && $scope.userList.length > 0) {
        userArray = $scope.userList.map(function (user) {
          return user.Email;
        });
      }

      if (userArray.length === 0) {
        Notification.error('firstTimeWizard.uploadDirSyncEmpty');
      } else {
        $scope.model.numMaxUsers = userArray.length;
      }
    };

    $scope.dirsyncProcessingNext = bulkSave;

    function bulkSave() {
      saveDeferred = $q.defer();
      cancelDeferred = $q.defer();

      $scope.model.userErrorArray = [];
      $scope.model.numMaxUsers = userArray.length;
      $scope.model.processProgress = $scope.model.numTotalUsers = $scope.model.numNewUsers = $scope.model.numExistingUsers = 0;
      $scope.model.isProcessing = true;
      $scope.model.cancelProcessCsv = $scope.cancelProcessCsv;

      function addUserError(row, email, errorMsg) {
        $scope.model.userErrorArray.push({
          row: row,
          email: email,
          error: errorMsg,
        });
        UserCsvService.setCsvStat({
          userErrorArray: [{
            row: row,
            email: email,
            error: errorMsg,
          }],
        });
      }

      function addUserErrorWithTrackingID(row, errorMsg, response, email) {
        errorMsg = UserCsvService.addErrorWithTrackingID(errorMsg, response);
        addUserError(row, (email || ''), _.trim(errorMsg));
      }

      function successCallback(response, startIndex, length) {
        if (_.isArray(response.data.userResponse)) {
          var addedUsersList = [];

          _.forEach(response.data.userResponse, function (user, index) {
            if (user.httpStatus === 200 || user.httpStatus === 201) {
              if (user.httpStatus === 200) {
                $scope.model.numExistingUsers++;
              } else {
                $scope.model.numNewUsers++;
              }
              // Build list of successful onboards and patches
              var addItem = {
                address: user.email,
              };
              if (addItem.address.length > 0) {
                addedUsersList.push(addItem);
              }
            } else {
              addUserErrorWithTrackingID(startIndex + index + 1, UserCsvService.getBulkErrorResponse(user.httpStatus, user.message, user.email), response, user.email);
            }
          });
        } else {
          for (var i = 0; i < length; i++) {
            addUserErrorWithTrackingID(startIndex + i + 1, $translate.instant('firstTimeWizard.processBulkResponseError'), response);
          }
        }
      }

      function errorCallback(response, startIndex, length) {
        for (var k = 0; k < length; k++) {
          var email = (response.config && response.config.data && _.isArray(response.config.data.users) ? response.config.data.users[k].email : null);
          var responseMessage = UserCsvService.getBulkErrorResponse(response.status, null, email);
          addUserErrorWithTrackingID(startIndex + k + 1, responseMessage, response, email);
        }
      }

      // Get license/entitlements
      var entitleList = [];
      var licenseList = [];
      var isCommunicationSelected;
      if (Authinfo.hasAccount()) {
        licenseList = getAccountLicenses('additive') || [];
        isCommunicationSelected = !!_.find(licenseList, function (license) {
          return _.startsWith(license.id, 'CO_');
        });
      } else {
        entitleList = getEntitlements('add');
        isCommunicationSelected = !!_.find(entitleList, {
          entitlementName: 'ciscoUC',
        });
      }
      entitleList = entitleList.concat(getHybridServicesEntitlements('add'));

      function onboardCsvUsers(startIndex, userArray, entitlementArray, licenseArray, csvPromise) {
        return csvPromise.then(function () {
          return $q(function (resolve) {
            if (userArray.length > 0) {
              Userservice.onboardUsersLegacy(userArray, entitlementArray, licenseArray, cancelDeferred.promise).then(function (response) {
                successCallback(response, (startIndex - userArray.length) + 1, userArray.length);
              }).catch(function (response) {
                errorCallback(response, (startIndex - userArray.length) + 1, userArray.length);
              }).finally(function () {
                calculateProcessProgress();
                resolve();
              });
            } else {
              resolve();
            }
          });
        });
      }

      function calculateProcessProgress() {
        $scope.model.numTotalUsers = $scope.model.numNewUsers + $scope.model.numExistingUsers + $scope.model.userErrorArray.length;
        $scope.model.processProgress = Math.round(($scope.model.numTotalUsers / userArray.length) * 100);
        $scope.model.importCompletedAt = Date.now();

        if ($scope.model.numTotalUsers >= userArray.length) {
          $scope.model.userErrorArray.sort(function (a, b) {
            return a.row - b.row;
          });
          $rootScope.$broadcast('USER_LIST_UPDATED');
          saveDeferred.resolve();
          $scope.model.isProcessing = false;
          $scope.$broadcast('timer-stop');
        }
      }

      // Onboard users in chunks
      // Separate chunks on invalid rows
      var csvChunk = isCommunicationSelected ? 2 : 10; // Rate limit for Huron
      var csvPromise = $q.resolve();
      var tempUserArray = [];
      var uniqueEmails = [];
      var processingError;
      _.forEach(userArray, function (userEmail, j) {
        processingError = false;
        // If we haven't met the chunk size, process the next user
        if (tempUserArray.length < csvChunk) {
          // Validate content in the row
          if (_.includes(uniqueEmails, userEmail)) {
            // Report a duplicate email
            processingError = true;
            addUserError(j + 1, $translate.instant('firstTimeWizard.csvDuplicateEmail'));
          } else {
            uniqueEmails.push(userEmail);
            tempUserArray.push({
              address: userEmail,
              name: NAME_DELIMITER,
              displayName: '',
              internalExtension: '',
              directLine: '',
            });
          }
        }
        // Onboard all the previous users in the temp array if there was an error processing a row
        if (processingError) {
          csvPromise = onboardCsvUsers(j - 1, tempUserArray, entitleList, licenseList, csvPromise);
          tempUserArray = [];
        } else if (tempUserArray.length === csvChunk || j === (userArray.length - 1)) {
          // Onboard the current temp array if we've met the chunk size or is the last user in list
          csvPromise = onboardCsvUsers(j, tempUserArray, entitleList, licenseList, csvPromise);
          tempUserArray = [];
        }
      });

      calculateProcessProgress();

      return saveDeferred.promise;
    }

    function cancelModal() {
      Analytics.trackAddUsers(Analytics.eventNames.CANCEL_MODAL);
      $state.modal.dismiss();
    }

    function controlMsg() {
      if (!$scope.radioStates.msgRadio) {
        $scope.radioStates.careRadio = $scope.careRadioValue.NONE;
      }
    }
  }
})();
