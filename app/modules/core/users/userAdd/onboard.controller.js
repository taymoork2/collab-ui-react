(function () {
  'use strict';

  //TODO refactor this into OnboardCtrl, BulkUserCtrl, AssignServicesCtrl
  angular.module('Core')
    .controller('OnboardCtrl', OnboardCtrl);

  /*@ngInject*/
  function OnboardCtrl($scope, $state, $stateParams, $q, $http, $window, Log, Authinfo, $rootScope, $translate, LogMetricsService, Config, GroupService, Notification, OnboardService, Userservice, $timeout, Utils, Orgservice, TelephonyInfoService, FeatureToggleService, NAME_DELIMITER, TelephoneNumberService, DialPlanService, CsvDownloadService, TrackingId, chartColors, UserCsvService, Localytics) {
    $scope.hasAccount = Authinfo.hasAccount();
    $scope.usrlist = [];
    $scope.internalNumberPool = [];
    $scope.externalNumberPool = [];
    $scope.telephonyInfo = {};

    $scope.searchStr = '';
    $scope.timeoutVal = 1000;
    $scope.timer = 0;
    $scope.searchPlaceholder = $translate.instant('usersPage.convertUserSearch');

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
    $scope.dirSyncConnectorDownload = "https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/CloudConnectorManager/DirectoryConnector.zip";

    $scope.isReset = false;
    $scope.showExtensions = true;
    $scope.isResetEnabled = false;

    $scope.convertUsersFlow = false;
    $scope.editServicesFlow = false;

    // model can be removed after switching to controllerAs
    $scope.model = {
      userInputOption: 0,
      uploadProgress: 0
    };

    $scope.strFirstName = $translate.instant('usersPage.firstNamePlaceHolder');
    $scope.strLastName = $translate.instant('usersPage.lastNamePlaceHolder');
    $scope.strEmailAddress = $translate.instant('usersPage.emailAddressPlaceHolder');
    var strNameAndEmailAdress = $translate.instant('usersPage.nameAndEmailAddress');
    $scope.placeholder = $translate.instant('directoryNumberPanel.chooseNumber');
    $scope.inputPlaceholder = $translate.instant('directoryNumberPanel.searchNumber');
    $scope.userInputOptions = [{
      label: $scope.strEmailAddress,
      value: 0,
      name: 'radioOption',
      id: 'radioEmail'
    }, {
      label: strNameAndEmailAdress,
      value: 1,
      name: 'radioOption',
      id: 'radioNamesAndEmail'
    }];

    OnboardService.huronCallEntitlement = false;

    $scope.shouldAddCallService = shouldAddCallService;
    var currentUserHasCall = false;

    /****************************** Did to Dn Mapping START *******************************/
    //***
    //***
    //***********************************************************************************/

    function activateDID() {
      $q.all([loadInternalNumberPool(), loadExternalNumberPool(), toggleShowExtensions(), loadPrimarySiteInfo()])
        .finally(function () {
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
      var dnFirstCharacter = "";
      var steeringDigit = $scope.telephonyInfo.steeringDigit;
      return _.startsWith(_.get(userEntity, 'assignedDn.pattern'), steeringDigit);
    }

    function returnInternalNumberlist(pattern) {
      if (pattern) {
        loadInternalNumberPool(pattern);
      } else {
        return $scope.internalNumberPool;
      }
    }

    function loadInternalNumberPool(pattern) {
      return TelephonyInfoService.loadInternalNumberPool(pattern, $scope.PATTERN_LIMIT).then(function (internalNumberPool) {
        $scope.internalNumberPool = internalNumberPool;
      }).catch(function (response) {
        $scope.internalNumberPool = [];
        Notification.errorResponse(response, 'directoryNumberPanel.internalNumberPoolError');
      });
    }

    function loadExternalNumberPool(pattern) {
      return TelephonyInfoService.loadExternalNumberPool(pattern).then(function (externalNumberPool) {
        $scope.externalNumberPool = externalNumberPool;
      }).catch(function (response) {
        $scope.externalNumberPool = [{
          uuid: 'none',
          pattern: $translate.instant('directoryNumberPanel.none')
        }];
        Notification.errorResponse(response, 'directoryNumberPanel.externalNumberPoolError');
      });
    }

    function mapDidToDn() {
      $scope.isMapInProgress = true;
      $scope.isMapEnabled = false;
      var count = $scope.usrlist.length;
      TelephonyInfoService.loadExtPoolWithMapping(count).then(function (externalNumberMapping) {
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
      _.forEach($scope.usrlist, function (user, index) {
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
      }).catch(function (response) {
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
        dnDupe: false
      };
      for (var i = 0; i < $scope.usrlist.length - 1; i++) {
        for (var j = i + 1; j < $scope.usrlist.length; j++) {
          if (angular.isDefined($scope.usrlist[i].assignedDn) && angular.isDefined($scope.usrlist[j].assignedDn) && ($scope.usrlist[i].assignedDn.pattern !== "None") && ($scope.usrlist[i].assignedDn.pattern === $scope.usrlist[j].assignedDn.pattern)) {
            didDnDupe.dnDupe = true;
          }
          if (angular.isDefined($scope.usrlist[i].externalNumber) && angular.isDefined($scope.usrlist[j].externalNumber) && ($scope.usrlist[i].externalNumber.pattern !== "None") && ($scope.usrlist[i].externalNumber.pattern === $scope.usrlist[j].externalNumber.pattern)) {
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

    $scope.editServicesSave = function () {
      if (shouldAddCallService()) {
        $scope.processing = true;
        $scope.editServicesFlow = true;
        $scope.convertUsersFlow = false;

        // Populate list with single user for updateUserLicense()
        $scope.usrlist = [{
          address: _.get($scope, 'currentUser.userName', '')
        }];
        activateDID();
        $state.go('editService.dn');
      } else {
        $scope.updateUserLicense();
      }

    };

    function toggleShowExtensions() {
      return DialPlanService.getCustomerDialPlanDetails().then(function (response) {
        var indexOfDidColumn = _.findIndex($scope.addDnGridOptions.columnDefs, {
          field: 'externalNumber'
        });
        var indexOfDnColumn = _.findIndex($scope.addDnGridOptions.columnDefs, {
          field: 'internalExtension'
        });
        if (response.extensionGenerated === "true") {
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
      if ($scope.showExtensions === false) {
        var dnLength = rowEntity.assignedDn.pattern.length;
        // if the internalNumber was changed, find a matching DID and set the externalNumber to match
        if (modifiedFieldName === "internalNumber") {
          var matchingDid = _.find($scope.externalNumberPool, function (extNum) {
            return extNum.pattern.substr(-dnLength) === rowEntity.assignedDn.pattern;
          });
          if (matchingDid) {
            rowEntity.externalNumber = matchingDid;
          }
        }
        // if the externalNumber was changed, find a matching DN and set the internalNumber to match
        if (modifiedFieldName === "externalNumber") {
          var matchingDn = _.find($scope.internalNumberPool, {
            pattern: rowEntity.externalNumber.pattern.substr(-dnLength)
          });
          if (matchingDn) {
            rowEntity.assignedDn = matchingDn;
          }
        }
      }
    }

    /****************************** Did to Dn Mapping END *******************************/
    //***
    //***
    //***********************************************************************************/

    function clearNameAndEmailFields() {
      $scope.model.firstName = '';
      $scope.model.lastName = '';
      $scope.model.emailAddress = '';
      $scope.model.userInfoValid = false;
    }

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

    $scope.ConfirmAdditionalServiceSetup = function () {
      var promise = (Notification.confirmation($translate.instant('usersPage.addtionalServiceSetupConfirmation')));
      promise.then(function () {
        $state.go('firsttimewizard');
      });
    };

    $scope.disableCommFeatureAssignment = function () {
      // disable the communication feature assignment unless the UserAdd is part of the First Time Setup Wizard work flow
      return (!Authinfo.isSetupDone() && ((typeof $state.current.data === 'undefined') || (!$state.current.data.firstTimeSetup)));
    };

    var userEnts = null;
    var userLicenseIds = null;
    $scope.cmrFeature = null;
    $scope.messageFeatures = [];
    $scope.conferenceFeatures = [];
    $scope.communicationFeatures = [];
    $scope.licenses = [];
    $scope.populateConf = populateConf;
    $scope.getAccountLicenses = getAccountLicenses;
    var convertSuccess = [];
    var convertFailures = [];
    var convertUsersCount = 0;
    var convertStartTime = 0;
    var convertCancelled = false;
    var convertBacked = false;
    var convertPending = false;

    $scope.messageFeatures.push(new ServiceFeature($translate.instant('onboardModal.msgFree'), 0, 'msgRadio', new FakeLicense('freeTeamRoom')));
    $scope.conferenceFeatures.push(new ServiceFeature($translate.instant('onboardModal.mtgFree'), 0, 'confRadio', new FakeLicense('freeConferencing')));
    $scope.communicationFeatures.push(new ServiceFeature($translate.instant('onboardModal.callFree'), 0, 'commRadio', new FakeLicense('advancedCommunication')));
    $scope.currentUser = $stateParams.currentUser;

    if ($scope.currentUser) {
      userEnts = $scope.currentUser.entitlements;
      userLicenseIds = $scope.currentUser.licenseID;
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

    $scope.radioStates = {
      commRadio: false,
      msgRadio: false
    };

    if (userEnts) {
      for (var x = 0; x < userEnts.length; x++) {
        if (userEnts[x] === 'ciscouc') {
          $scope.radioStates.commRadio = true;
          currentUserHasCall = true;
        } else if (userEnts[x] === 'squared-room-moderation') {
          $scope.radioStates.msgRadio = true;
        }
      }
    }

    function shouldAddCallService() {
      return !currentUserHasCall && ($scope.radioStates.commRadio || $scope.entitlements.ciscoUC);
    }

    function createFeatures(obj) {
      return {
        siteUrl: _.get(obj, 'license.siteUrl', ''),
        billing: _.get(obj, 'license.billingServiceId', ''),
        volume: _.get(obj, 'license.volume', ''),
        licenseId: _.get(obj, 'license.licenseId', ''),
        offerName: _.get(obj, 'license.offerName', ''),
        label: obj.label,
        isTrial: _.get(obj, 'license.isTrial', false),
        confModel: false,
        cmrModel: false
      };
    }

    $scope.checkCMR = function (confModel, cmrLics) {
      if (!confModel) {
        angular.forEach(cmrLics, function (cmrLic) {
          cmrLic.cmrModel = confModel;
        });
      }
    };

    var generateConfChk = function (confs, cmrs) {
      $scope.confChk = [];
      $scope.allLicenses = [];

      for (var i in confs) {
        var temp = {
          confFeature: confs[i],
          confModel: false,
          confId: 'conf-' + i
        };

        var confNoUrl = _.chain(confs).filter(function (conf) {
          return conf.license.licenseType !== 'freeConferencing';
        }).filter(function (conf) {
          return !_.has(conf, 'license.siteUrl');
        }).map(createFeatures).remove(undefined).value();

        var confFeatures = _.chain(confs).filter('license.siteUrl')
          .map(createFeatures).remove(undefined).value();
        var cmrFeatures = _.chain(cmrs).filter('license.siteUrl')
          .map(createFeatures).remove(undefined).value();

        var siteUrls = _.map(confFeatures, function (lic) {
          return lic.siteUrl;
        });
        siteUrls = _.uniq(siteUrls);

        $scope.allLicenses = _.map(siteUrls, function (site) {
          var confMatches = _.filter(confFeatures, {
            siteUrl: site
          });
          var cmrMatches = _.filter(cmrFeatures, {
            siteUrl: site
          });
          return {
            site: site,
            billing: _.uniq(_.pluck(cmrMatches, 'billing').concat(_.pluck(confMatches, 'billing'))),
            confLic: confMatches,
            cmrLic: cmrMatches
          };
        });
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

      populateConf();
    };

    $scope.isSubscribeable = function (license) {
      if (license.status === 'ACTIVE' || license.status === 'PENDING') {
        return (license.volume > 0);
      }
      return false;
    };

    // [Services] -> [Services] (merges Service[s] w/ same license)
    var mergeMultipleLicenseSubscriptions = function (fetched) {

      // Construct a mapping from License to (array of) Service object(s)
      var services = fetched.reduce(function (object, service) {
        var key = service.license.licenseType;
        if (key in object) {
          object[key].push(service);
        } else {
          object[key] = [service];
        }
        return object;
      }, {});

      // Merge all services with the same License into a single Service
      return _.values(services).map(function (array) {
        var result = {
          licenses: []
        };
        array.forEach(function (service) {
          var copy = angular.copy(service);
          copy.licenses = [copy.license];
          delete copy.license;
          _.merge(result, copy, function (left, right) {
            if (_.isArray(left)) return left.concat(right);
          });
        });
        return result;
      });

    };

    var getAccountServices = function () {
      var services = {
        message: Authinfo.getMessageServices(),
        conference: Authinfo.getConferenceServices(),
        communication: Authinfo.getCommunicationServices()
      };
      if (services.message) {
        services.message = mergeMultipleLicenseSubscriptions(services.message);
        $scope.messageFeatures = $scope.messageFeatures.concat(services.message);
        if (userLicenseIds) {
          _.forEach($scope.messageFeatures[1].licenses, function (license) {
            license.model = userLicenseIds.indexOf(license.licenseId) >= 0;
          });
        }

        if ($scope.messageFeatures[1].licenses.length > 1) {
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
      }
    };

    if (Authinfo.isInitialized()) {
      getAccountServices();
    }

    GroupService.getGroupList(function (data, status) {
      if (data.success) {
        $scope.groups = data.groups || [];
        if ($scope.groups && $scope.groups.length === 0) {
          var defaultGroup = {
            displayName: 'Default License Group'
          };
          $scope.groups.push(defaultGroup);
        }
        $scope.selectedGroup = $scope.groups[0];
      } else {
        Log.debug('Failed to retrieve group list. Status: ' + status);
        Notification.notify([$translate.instant('onboardModal.apiError', {
          status: status
        })], 'error');
      }
    });

    $scope.collabRadio1 = {
      label: $translate.instant('onboardModal.enableCollab'),
      value: 1,
      name: 'collabRadio',
      id: 'collabRadio1'
    };

    $scope.collabRadio2 = {
      label: $translate.instant('onboardModal.enableCollabGroup'),
      value: 2,
      name: 'collabRadio',
      id: 'collabRadio2'
    };

    $scope.tableOptions = {
      cursorcolor: chartColors.gray,
      cursorminheight: 50,
      cursorborder: "0px",
      cursorwidth: "7px",
      railpadding: {
        top: 0,
        right: 3,
        left: 0,
        bottom: 0
      },
      autohidemode: "leave"
    };

    angular.element('.wizard-main-wrapper').bind('resize', function () {
      var nice = $('#errorTable').getNiceScroll();
      if (nice !== null && nice !== undefined) {
        nice.resize();
      }
    });

    var nameTemplate = '<div class="ui-grid-cell-contents"><span class="name-display-style">{{row.entity.name}}</span>' +
      '<span class="email-display-style">{{row.entity.address}}</span></div>';

    var internalExtensionTemplate = '<div ng-show="row.entity.assignedDn !== undefined"> ' +
      '<cs-select name="internalNumber" ' +
      'ng-model="row.entity.assignedDn" options="grid.appScope.internalNumberPool" ' +
      'refresh-data-fn="grid.appScope.returnInternalNumberlist(filter)" wait-time="0" ' +
      'placeholder="placeholder" input-placeholder="inputPlaceholder" ' +
      'on-change-fn="grid.appScope.syncGridDidDn(row.entity, \'internalNumber\')"' +
      'labelfield="pattern" valuefield="uuid" required="true" filter="true"' +
      ' is-warn="{{grid.appScope.checkDnOverlapsSteeringDigit(row.entity)}}" warn-msg="{{\'usersPage.steeringDigitOverlapWarning\' | translate: { steeringDigitInTranslation: telephonyInfo.steeringDigit } }}" > </cs-select></div>' +
      '<div ng-show="row.entity.assignedDn === undefined"> ' +
      '<cs-select name="noInternalNumber" ' +
      'ng-model="grid.appScope.noExtInPool" labelfield="grid.appScope.noExtInPool" is-disabled="true" > </cs-select>' +
      '<span class="error">{{\'usersPage.noExtensionInPool\' | translate }}</span> </div> ';

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
      if (newVal != oldVal) {
        $scope.usrlist = $window.addressparser.parse($scope.model.userList);
      }
    });

    // To differentiate the user list change made by map operation
    //  and other manual/reset operation.
    $scope.$watch('usrlist', function (newVal, oldVal) {
      if ($scope.isMapped) {
        $scope.isMapped = false;
      } else {
        $scope.isMapEnabled = true;
      }

      if ($scope.isReset) {
        $scope.isReset = false;
      } else {
        $scope.isResetEnabled = true;
      }
    }, true);

    $scope.$watch('radioStates.commRadio', function (newVal, oldVal) {
      if (newVal != oldVal) {
        // Store value of checkbox in service (cast to bool)
        OnboardService.huronCallEntitlement = !!newVal;

        // Do not change wizard text when configuring bulk user services
        if (angular.isDefined($scope.wizard) && !($scope.wizard.current.step.name === 'csvServices' || $scope.wizard.current.step.name === 'dirsyncServices')) {
          if (shouldAddCallService()) {
            $scope.$emit('wizardNextText', 'next');
          } else {
            $scope.$emit('wizardNextText', 'finish');
          }
        }
      }
    });

    $scope.$watch('wizard.current.step', function (newVal, oldVal) {
      if (angular.isDefined($scope.wizard) && $scope.wizard.current.step.name === 'assignServices') {
        if (shouldAddCallService()) {
          $scope.$emit('wizardNextText', 'next');
        } else {
          $scope.$emit('wizardNextText', 'finish');
        }
      } else if (angular.isDefined($scope.wizard) && $scope.wizard.current.step.name === 'assignDnAndDirectLines') {
        $scope.isResetEnabled = false;
        $scope.validateDnForUser();
      }
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
        displayName: $translate.instant('usersPage.nameHeader'),
        sortable: false,
        cellTemplate: nameTemplate,
        width: '*'
      }, {
        field: 'externalNumber',
        displayName: $translate.instant('usersPage.directLineHeader'),
        sortable: false,
        cellTemplate: externalExtensionTemplate,
        maxWidth: 220,
        minWidth: 140,
        width: '*'
      }, {
        field: 'internalExtension',
        displayName: $translate.instant('usersPage.extensionHeader'),
        sortable: false,
        cellTemplate: internalExtensionTemplate,
        maxWidth: 220,
        minWidth: 140,
        width: '*'
      }]
    };
    $scope.collabRadio = 1;

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
        idList = idList.concat(_(license.confLic).filter({
          confModel: state
        }).pluck('licenseId').remove(undefined).value());

        idList = idList.concat(_(license.cmrLic).filter({
          cmrModel: state
        }).pluck('licenseId').remove(undefined).value());

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
          Localytics.tagEvent('Convert User Search Filter', {
            from: $state.current.name
          });
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

        // Communication: straightforward license, for now
        var commIndex = $scope.radioStates.commRadio ? 1 : 0;
        var selCommService = $scope.communicationFeatures[commIndex];
        if ('licenseId' in selCommService.license) {
          licenseList.push(new LicenseFeature(selCommService.license.licenseId, true));
        } else if ((action === 'patch') && ($scope.communicationFeatures.length > 1) && ('licenseId' in $scope.communicationFeatures[1].license)) {
          licenseList.push(new LicenseFeature($scope.communicationFeatures[1].license.licenseId, false));
        }
      }

      return licenseList.length === 0 ? null : licenseList;
    }

    var getEntitlements = function (action) {
      var entitleList = [];
      var state = null;
      for (var key in $scope.entitlements) {
        state = $scope.entitlements[key];
        if ((action === 'add' && state) || (action === 'entitle' && state)) {
          entitleList.push(new Feature(key, state));
        }
      }

      Log.debug(entitleList);
      return entitleList;
    };

    // Hybrid Services entitlements
    var getExtensionEntitlements = function (action) {
      return _.chain($scope.extensionEntitlements)
        .filter(function (entry) {
          return action === 'add' && entry.entitlementState === 'ACTIVE';
        })
        .map(function (entry) {
          return new Feature(entry.entitlementName, entry.entitlementState);
        })
        .value();
    };

    var getEntitlementStrings = function (entList) {
      var entStrings = [];
      for (var e = 0; e < entList.length; e++) {
        if (entList[e].entitlementName) {
          entStrings.push(entList[e].entitlementName);
        }
      }
      return entStrings;
    };

    $scope.updateUserLicense = function () {
      var user = [];
      if (_.get($scope, 'usrlist.length')) {
        user = $scope.usrlist;
      } else if ($scope.currentUser) {
        usersList = [];
        var userObj = {
          'address': $scope.currentUser.userName,
          'name': $scope.currentUser.name
        };
        user.push(userObj);
        usersList.push(user);
      }
      $scope.btnSaveEntLoad = true;

      Userservice.updateUsers(user, getAccountLicenses('patch'), null, 'updateUserLicense', entitleUserCallback);
    };

    //****************MODAL INIT FUNCTION FOR INVITE AND ADD***************
    //***
    //***
    //*********************************************************************

    function Feature(name, state) {
      this.entitlementName = name;
      this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
      this.properties = {};
    }

    function LicenseFeature(name, bAdd) {
      return {
        id: name.toString(),
        idOperation: bAdd ? 'ADD' : 'REMOVE',
        properties: {}
      };
    }

    $scope.isAddEnabled = function () {
      return Authinfo.isAddUserEnabled();
    };

    $scope.isEntitleEnabled = function () {
      return Authinfo.isEntitleUserEnabled();
    };

    //email validation logic
    var validateEmail = function (input) {
      var emailregex = /\S+@\S+\.\S+/;
      var emailregexbrackets = /<\s*\S+@\S+\.\S+\s*>/;
      var emailregexquotes = /"\s*\S+@\S+\.\S+\s*"/;
      var valid = false;

      if (/[<>]/.test(input) && emailregexbrackets.test(input)) {
        valid = true;
      } else if (/["]/.test(input) && emailregexquotes.test(input)) {
        valid = true;
      } else if (!/[<>]/.test(input) && !/["]/.test(input) && emailregex.test(input)) {
        valid = true;
      }

      return valid;
    };

    var wizardNextText = function () {
      var userCount = angular.element('.token-label').length;
      var action = 'finish';
      if (userCount > 0) {
        action = 'next';
      }
      $scope.$emit('wizardNextText', action);
    };

    var invalidcount = 0;
    $scope.tokenfieldid = "usersfield";
    $scope.tokenplaceholder = $translate.instant('usersPage.userInput');
    $scope.tokenoptions = {
      delimiter: [',', ';'],
      createTokensOnBlur: true
    };
    var isDuplicate = false;
    $scope.tokenmethods = {
      createtoken: function (e) {
        //Removing anything in brackets from user data
        var value = e.attrs.value.replace(/\s*\([^)]*\)\s*/g, ' ');
        e.attrs.value = value;
        isDuplicate = false;
        if (isEmailAlreadyPresent(e.attrs.value)) {
          isDuplicate = true;
        }
      },
      createdtoken: function (e) {
        if (!validateEmail(e.attrs.value) || isDuplicate) {
          angular.element(e.relatedTarget).addClass('invalid');
          invalidcount++;
        }
        wizardNextText();
        checkPlaceholder();
      },
      edittoken: function (e) {
        if (angular.element(e.relatedTarget).hasClass('invalid')) {
          invalidcount--;
        }
      },
      removedtoken: function (e) {
        // Reset the token list and validate all tokens
        $timeout(function () {
          invalidcount = 0;
          angular.element('#usersfield').tokenfield('setTokens', $scope.model.userList);
        }).then(function () {
          wizardNextText();
          checkPlaceholder();
        });
      }
    };

    function isEmailAlreadyPresent(input) {
      var inputEmail = getEmailAddress(input).toLowerCase();
      if (inputEmail) {
        var userEmails = getTokenEmailArray();
        var userEmailsLower = [];
        for (var i = 0; i < userEmails.length; i++) {
          userEmailsLower[i] = userEmails[i].toLowerCase();
        }
        return userEmailsLower.indexOf(inputEmail) >= 0;
      } else {
        return false;
      }
    }

    function getTokenEmailArray() {
      var tokens = angular.element('#usersfield').tokenfield('getTokens');
      return tokens.map(function (token) {
        return getEmailAddress(token.value);
      });
    }

    function getEmailAddress(input) {
      var retString = "";
      input.split(" ").forEach(function (str) {
        if (str.indexOf("@") >= 0) {
          retString = str;
        }
      });
      return retString;
    }

    var setPlaceholder = function (placeholder) {
      angular.element('.tokenfield.form-control #usersfield-tokenfield').attr('placeholder', placeholder);
    };

    //placeholder logic
    function checkPlaceholder() {
      if (angular.element('.token-label').length > 0) {
        setPlaceholder('');
      } else {
        setPlaceholder($translate.instant('usersPage.userInput'));
      }
    }

    var getUsersList = function () {
      return $window.addressparser.parse($scope.model.userList);
    };

    $scope.validateTokensBtn = function () {
      var usersListLength = angular.element('.token-label').length;
      $scope.validateTokens().then(function () {
        if (invalidcount === 0 && usersListLength > 0) {
          $state.go('users.add.services');
        } else if (usersListLength === 0) {
          Log.debug('No users entered.');
          Notification.notify([$translate.instant('usersPage.noUsersInput')], 'error');
        } else {
          Log.debug('Invalid users entered.');
          Notification.notify([$translate.instant('usersPage.validEmailInput')], 'error');
        }
      });
    };

    $scope.validateTokens = function () {
      wizardNextText();
      return $timeout(function () {
        var tokenfield = angular.element('#usersfield');
        //reset the invalid count
        invalidcount = 0;
        angular.element('#usersfield').tokenfield('setTokens', $scope.model.userList);
      }, 100);
    };

    $scope.addToUsersfield = function () {
      if ($scope.model.userForm.$valid && $scope.model.userInfoValid) {
        var userInfo = $scope.model.firstName + NAME_DELIMITER + $scope.model.lastName + ' ' + $scope.model.emailAddress;
        angular.element('#usersfield').tokenfield('createToken', userInfo);
        clearNameAndEmailFields();
        angular.element('#firstName').focus();
      }
    };

    $scope.validateEmailField = function () {
      if ($scope.model.emailAddress) {
        $scope.model.userInfoValid = validateEmail($scope.model.emailAddress);
      } else {
        $scope.model.userInfoValid = false;
      }
    };

    $scope.onEnterKey = function (keyEvent) {
      if (keyEvent.which === 13) {
        $scope.addToUsersfield();
      }
    };

    var resetUsersfield = function () {
      angular.element('#usersfield').tokenfield('setTokens', ' ');
      $scope.model.userList = '';
      checkPlaceholder();
      invalidcount = 0;
    };

    $scope.clearPanel = function () {
      resetUsersfield();
      $scope.results = null;
    };

    function onboardUsers(optionalOnboard) {
      var deferred = $q.defer();
      $scope.results = {
        resultList: []
      };
      var isComplete = true;
      usersList = getUsersList();
      Log.debug('Entitlements: ', usersList);

      var successCallback = function (response) {
        Log.info('User onboard request returned:', response.data);
        $rootScope.$broadcast('USER_LIST_UPDATED');
        var numAddedUsers = 0;
        var hybridCheck = false;

        _.forEach(response.data.userResponse, function (user) {
          var userResult = {
            email: user.email,
            alertType: null
          };

          var userStatus = user.httpStatus;

          if (userStatus === 200 || userStatus === 201) {
            userResult.message = $translate.instant('usersPage.onboardSuccess', {
              email: userResult.email
            });
            userResult.alertType = 'success';
            numAddedUsers++;
          } else if (userStatus === 409) {
            userResult.message = userResult.email + ' ' + user.message;
          } else if (userStatus === 403 && user.message === '400081') {
            userResult.message = $translate.instant('usersPage.userExistsError', {
              email: userResult.email
            });
          } else if (userStatus === 403 && (user.message === '400084' || user.message === '400091')) {
            userResult.message = $translate.instant('usersPage.claimedDomainError', {
              email: userResult.email,
              domain: userResult.email.split('@')[1]
            });
          } else if (userStatus === 403 && user.message === '400090') {
            userResult.message = $translate.instant('usersPage.userExistsInDiffOrgError', {
              email: userResult.email
            });
          } else if (userStatus === 403 && user.message === '400096') {
            userResult.message = $translate.instant('usersPage.notSetupForManUserAddError', {
              email: userResult.email
            });
          } else if (userStatus === 400 && user.message === '400087') {
            userResult.message = $translate.instant('usersPage.hybridServicesError');
            hybridCheck = true;
          } else if (userStatus === 400 && user.message === '400094') {
            userResult.message = $translate.instant('usersPage.hybridServicesComboError');
            hybridCheck = true;
          } else {
            userResult.message = $translate.instant('usersPage.onboardError', {
              email: userResult.email,
              status: userStatus
            });
          }

          if (userStatus !== 200 && userStatus !== 201) {
            userResult.alertType = 'danger';
            isComplete = false;
          }

          $scope.results.resultList.push(userResult);

        });

        if (numAddedUsers > 0) {
          var msg = 'Invited ' + numAddedUsers + ' users';
          LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('inviteUsers'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), numAddedUsers, null);
        }

        //concatenating the results in an array of strings for notify function
        var successes = [];
        var errors = [];
        for (var idx in $scope.results.resultList) {
          if ($scope.results.resultList[idx].alertType === 'success') {
            successes.push($scope.results.resultList[idx].message);
          } else {
            errors.push(UserCsvService.addErrorWithTrackingID($scope.results.resultList[idx].message, response));
          }
        }

        //Displaying notifications
        if ($scope.results.resultList.length === usersList.length) {
          $scope.btnOnboardLoading = false;
          Notification.notify(successes, 'success');
          if (hybridCheck) {
            Notification.notify(errors[0], 'error');
          } else {
            Notification.notify(errors, 'error');
          }
          deferred.resolve();
        }
        if (angular.isFunction($scope.$dismiss) && successes.length === usersList.length) {
          $scope.$dismiss();
        }
      };

      var errorCallback = function (response) {
        Log.warn('Could not onboard the user', response.data);
        var error = null;
        if (response.status) {
          error = $translate.instant('errors.statusError', {
            status: response.status
          });
          if (response.data && _.isString(response.data.message)) {
            error += ' ' + $translate.instant('usersPage.messageError', {
              message: response.data.message
            });
          }
          error = UserCsvService.addErrorWithTrackingID(error, response);
        } else {
          error = 'Request failed.';
          if (_.isString(response.data)) {
            error += ' ' + response.data;
          }
          error = UserCsvService.addErrorWithTrackingID(error, response);
          Notification.notify(error, 'error');
        }
        Notification.notify([error], 'error');
        isComplete = false;
        $scope.btnOnboardLoading = false;
        deferred.reject();
      };

      if (angular.isArray(usersList) && usersList.length > 0) {
        $scope.btnOnboardLoading = true;

        var i, j;
        for (i = 0; i < usersList.length; i++) {
          var userAndDnObj = $scope.usrlist.filter(function (user) {
            return (user.address == usersList[i].address);
          });

          if (userAndDnObj[0].assignedDn && userAndDnObj[0].assignedDn.pattern.length > 0) {
            usersList[i].internalExtension = userAndDnObj[0].assignedDn.pattern;
          }
          if (userAndDnObj[0].externalNumber && userAndDnObj[0].externalNumber.pattern !== "None") {
            usersList[i].directLine = userAndDnObj[0].externalNumber.pattern;
          }
        }

        var tempUserArray = [],
          entitleList = [],
          licenseList = [],
          chunk = Config.batchSize;
        if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
          licenseList = getAccountLicenses('additive');
        } else {
          entitleList = getEntitlements('add');
        }
        entitleList = entitleList.concat(getExtensionEntitlements('add'));

        for (i = 0; i < usersList.length; i += chunk) {
          tempUserArray = usersList.slice(i, i + chunk);
          Userservice.onboardUsers(tempUserArray, entitleList, licenseList)
            .then(successCallback)
            .catch(errorCallback);
        }
      } else if (!optionalOnboard) {
        Log.debug('No users entered.');
        var error = [$translate.instant('usersPage.validEmailInput')];
        Notification.notify(error, 'error');
        deferred.reject();
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    }

    $scope.extensionEntitlements = [];
    $scope.updateExtensionEntitlements = function (entitlements) {
      $scope.hybridCallServiceAware = _.some(entitlements, {
        entitlementName: 'squaredFusionUC',
        entitlementState: 'ACTIVE'
      });
      $scope.extensionEntitlements = entitlements;
    };

    function entitleUserCallback(data, status, method, headers) {
      $scope.results = {
        resultList: []
      };
      var isComplete = true;

      $rootScope.$broadcast('USER_LIST_UPDATED');
      if (data.success) {
        Log.info('User successfully updated', data);

        for (var i = 0; i < data.userResponse.length; i++) {

          var userResult = {
            email: data.userResponse[i].email,
            alertType: null
          };

          var userStatus = data.userResponse[i].status;

          if (userStatus === 200) {
            userResult.message = $translate.instant('onboardModal.result.200');
            userResult.alertType = 'success';
          } else if (userStatus === 404) {
            userResult.message = $translate.instant('onboardModal.result.404');
            userResult.alertType = 'danger';
            isComplete = false;
          } else if (userStatus === 409) {
            userResult.message = $translate.instant('onboardModal.result.409');
            userResult.alertType = 'danger';
            isComplete = false;
          } else if (data.userResponse[i].message === '400094') {
            userResult.message = $translate.instant('onboardModal.result.400094', {
              status: userStatus
            });
            userResult.alertType = 'danger';
            isComplete = false;
          } else {
            userResult.message = $translate.instant('onboardModal.result.other', {
              status: userStatus
            });
            userResult.alertType = 'danger';
            isComplete = false;
          }
          $scope.results.resultList.push(userResult);
          if (method !== 'convertUser') {
            $scope.$dismiss();
          }
        }

        //concatenating the results in an array of strings for notify function
        var successes = [];
        var errors = [];
        var count_s = 0;
        var count_e = 0;
        for (var idx in $scope.results.resultList) {
          if ($scope.results.resultList[idx].alertType === 'success') {
            successes[count_s] = $scope.results.resultList[idx].email + ' ' + $scope.results.resultList[idx].message;
            count_s++;
          } else {
            errors.push(UserCsvService.addErrorWithTrackingID($scope.results.resultList[idx].email + ' ' + $scope.results.resultList[idx].message, null, headers));
            count_e++;
          }
        }

        //Displaying notifications
        if (method !== 'convertUser') {
          if (successes.length + errors.length === usersList.length) {
            $scope.btnOnboardLoading = false;
            $scope.btnSaveEntLoad = false;
            Notification.notify(successes, 'success');
            Notification.notify(errors, 'error');
          }
        } else {
          if (count_s > 0) {
            convertSuccess.push.apply(convertSuccess, successes);
          }
          if (count_e > 0) {
            convertFailures.push.apply(convertFailures, errors);
          }
        }

      } else {
        Log.warn('Could not entitle the user', data);
        var error = null;
        if (status) {
          error = $translate.instant('errors.statusError', {
            status: status
          });
          if (data && angular.isString(data.message)) {
            error += ' ' + $translate.instant('usersPage.messageError', {
              message: data.message
            });
          }
        } else {
          error = 'Request failed.';
          if (angular.isString(data)) {
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
          convertFailures.push(error);
        }
      }

      if (method !== 'convertUser') {
        if (isComplete) {
          resetUsersfield();
        }
      } else {
        if ($scope.convertSelectedList.length > 0 && convertCancelled === false && convertBacked === false) {
          convertUsersInBatch();
        } else {
          if (convertBacked === false) {
            $scope.btnConvertLoad = false;
            $scope.$dismiss();
          } else {
            $state.go('users.convert', {});
          }
          Notification.notify(convertSuccess, 'success');
          Notification.notify(convertFailures, 'error');
          var msg = 'Migrated ' + convertSuccess.length + ' users';
          var migratedata = {
            totalUsers: convertUsersCount,
            successfullyConverted: convertSuccess.length
          };
          LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('convertUsers'), LogMetricsService.getEventAction('buttonClick'), 200, convertStartTime, convertSuccess.length, migratedata);
        }
      }

    }

    //radio group
    $scope.entitlements = {};
    var setEntitlementList = function () {
      if (angular.isArray($rootScope.services)) {
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
      if (angular.isArray($rootScope.services) && $rootScope.services.length === 0) {
        $rootScope.services = Authinfo.getServices();
      }
      setEntitlementList();
    });

    // Wizard hook for next button
    $scope.manualEntryNext = function () {
      var deferred = $q.defer();

      if (getUsersList().length === 0) {
        $q.when($scope.wizard.nextTab()).then(function () {
          deferred.reject();
        });
      } else {
        if (invalidcount === 0) {
          deferred.resolve();
        } else {
          var error = [$translate.instant('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
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
        return onboardUsers(true).then(function () {
          if (angular.isDefined($scope.wizard)) {
            $q.when($scope.wizard.nextTab()).then(function () {
              deferred.reject();
            });
          } else {
            deferred.resolve();
          }
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
        Notification.notify([$translate.instant('usersPage.duplicateDidFound')], 'error');
        deferred.reject();
        return deferred.promise;
      }
      // check for Dn duplicates
      if (didDnDupes.dnDupe) {
        Log.debug('Duplicate Internal Extension entered.');
        Notification.notify([$translate.instant('usersPage.duplicateDnFound')], 'error');
        deferred.reject();
        return deferred.promise;
      }
      return onboardUsers(true);
    };

    $scope.isServiceAllowed = function (service) {
      return Authinfo.isServiceAllowed(service);
    };

    $scope.getServiceName = function (service) {
      for (var i = 0; i < $rootScope.services.length; i++) {
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
      $timeout(function () {});
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
        convertCancelled = true;
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
        Notification.notify([$translate.instant('usersPage.duplicateDidFound')], 'error');
        return;
      }
      // check for Dn duplicates
      if (didDnDupes.dnDupe) {
        Log.debug('Duplicate Internal Extension entered.');
        Notification.notify([$translate.instant('usersPage.duplicateDnFound')], 'error');
        return;
      }

      // copy numbers to convertSelectedList
      _.forEach($scope.usrlist, function (user, index) {
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
      $state.go('users.convert.services', {});
    };

    $scope.convertUsersNext = function () {
      if (shouldAddCallService()) {
        $scope.processing = true;
        // Copying selected users to user list
        $scope.usrlist = [];
        _.forEach($scope.convertSelectedList, function (selectedUser, index) {
          var user = {};
          var givenName = "";
          var familyName = "";
          if (angular.isDefined(selectedUser.name)) {
            if (angular.isDefined(selectedUser.name.givenName)) {
              givenName = selectedUser.name.givenName;
            }
            if (angular.isDefined(selectedUser.name.familyName)) {
              familyName = selectedUser.name.familyName;
            }
          }
          if (angular.isDefined(givenName) || angular.isDefined(familyName)) {
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
      convertCancelled = false;
      convertBacked = false;
      convertSuccess = [];
      convertFailures = [];
      convertStartTime = moment();
      convertUsersInBatch();
    };

    function convertUsersInBatch() {
      var batch = $scope.convertSelectedList.slice(0, Config.batchSize);
      $scope.convertSelectedList = $scope.convertSelectedList.slice(Config.batchSize);
      Userservice.migrateUsers(batch, function (data, status) {
        var successMovedUsers = [];

        for (var i = 0; i < data.userResponse.length; i++) {
          if (data.userResponse[i].status !== 200) {
            convertFailures.push(data.userResponse[i].email + $translate.instant('homePage.convertError'));
          } else {
            var user = {
              'address': data.userResponse[i].email
            };
            var userArray = batch.filter(function (batchObj) {
              return user.address === batchObj.userName;
            });
            user.assignedDn = userArray[0].assignedDn;
            user.externalNumber = userArray[0].externalNumber;
            successMovedUsers.push(user);
          }
        }

        if (successMovedUsers.length > 0) {
          var entitleList = [];
          var licenseList = [];
          if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
            licenseList = getAccountLicenses('patch');
          } else {
            entitleList = getEntitlements('add');
          }
          entitleList = entitleList.concat(getExtensionEntitlements('add'));

          Userservice.updateUsers(successMovedUsers, licenseList, entitleList, 'convertUser', entitleUserCallback);
        } else {
          if ($scope.convertSelectedList.length > 0 && convertCancelled === false && convertBacked === false) {
            convertUsersInBatch();
          } else {
            if (convertBacked === false) {
              $scope.btnConvertLoad = false;
              $scope.$dismiss();
            } else {
              $state.go('users.convert', {});
            }
            Notification.notify(convertSuccess, 'success');
            Notification.notify(convertFailures, 'error');
            var msg = 'Migrated ' + convertSuccess.length + ' users';
            var migratedata = {
              totalUsers: convertUsersCount,
              successfullyConverted: convertSuccess.length
            };
            LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('convertUsers'), LogMetricsService.getEventAction('buttonClick'), 200, convertStartTime, convertSuccess.length, migratedata);
          }
        }
      });
    }

    var getUnlicensedUsers = function () {
      Orgservice.getUnlicensedUsers(function (data) {
        $scope.unlicensed = 0;
        $scope.unlicensedUsersList = null;
        if (data.success) {
          if (data.totalResults) {
            $scope.unlicensed = data.totalResults;
            $scope.unlicensedUsersList = data.resources;
            $('.ui-grid-viewport').mouseover(function () {
              $('.ui-grid-viewport').getNiceScroll().resize();
            });
          }
        }
      }, null, $scope.searchStr);
    };

    $scope.convertDisabled = function () {
      return ($scope.gridApi.selection.getSelectedRows().length === 0) ? true : false;
    };

    getUnlicensedUsers();

    $scope.convertGridOptions = {
      data: 'unlicensedUsersList',
      rowHeight: 45,
      enableHorizontalScrollbar: 0,
      selectionRowHeaderWidth: 40,
      enableRowHeaderSelection: true,
      enableFullRowSelection: true,
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
      },
      columnDefs: [{

        field: 'displayName',
        displayName: $translate.instant('usersPage.displayNameHeader'),
        resizable: false,
        sortable: true
      }, {
        field: 'userName',
        displayName: $translate.instant('homePage.emailAddress'),
        resizable: false,
        sort: {
          direction: 'desc',
          priority: 0
        },
        sortCellFiltered: true
      }]
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
        'newUsersCount': $scope.model.numNewUsers || 0,
        'updatedUsersCount': $scope.model.numExistingUsers || 0,
        'errorUsersCount': angular.isArray($scope.model.userErrorArray) ? $scope.model.userErrorArray.length : 0
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
      return FeatureToggleService.supportsDirSync().then(function (dirSyncEnabled) {
        return $q(function (resolve, reject) {
          if (dirSyncEnabled) {
            // getStatus() is in the parent scope - AddUserCtrl
            if (angular.isFunction($scope.getStatus)) {
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

    $scope.syncStatusNext = function () {
      return $q(function (resolve, reject) {
        if (!$scope.wizard.isLastStep()) {
          userArray = [];
          if ($scope.userList && $scope.userList.length > 0) {
            userArray = $scope.userList.map(function (user) {
              return user.Email;
            });
          }
          if (userArray.length === 0) {
            Notification.error('firstTimeWizard.uploadDirSyncEmpty');
            reject();
          } else {
            $scope.model.numMaxUsers = userArray.length;
            resolve();
          }
        } else {
          resolve();
        }
      });
    };

    $scope.dirsyncProcessingNext = bulkSave;

    function bulkSave() {
      saveDeferred = $q.defer();
      cancelDeferred = $q.defer();

      $scope.model.userErrorArray = [];
      $scope.model.numMaxUsers = userArray.length;
      $scope.model.processProgress = $scope.model.numTotalUsers = $scope.model.numNewUsers = $scope.model.numExistingUsers = 0;

      function addUserError(row, errorMsg) {
        $scope.model.userErrorArray.push({
          row: row,
          error: errorMsg
        });
      }

      function addUserErrorWithTrackingID(row, errorMsg, response) {
        errorMsg = UserCsvService.addErrorWithTrackingID(errorMsg, response);
        addUserError(row, _.trim(errorMsg));
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
                address: user.email
              };
              if (addItem.address.length > 0) {
                addedUsersList.push(addItem);
              }
            } else {
              addUserErrorWithTrackingID(startIndex + index + 1, UserCsvService.getBulkErrorResponse(user.httpStatus, user.message, user.email), response);
            }
          });
        } else {
          for (var i = 0; i < length; i++) {
            addUserErrorWithTrackingID(startIndex + i + 1, $translate.instant('firstTimeWizard.processBulkResponseError'), response);
          }
        }
      }

      function errorCallback(response, startIndex, length) {
        var responseMessage = UserCsvService.getBulkErrorResponse(response.status);
        for (var k = 0; k < length; k++) {
          addUserErrorWithTrackingID(startIndex + k + 1, responseMessage, response);
        }
      }

      // Get license/entitlements
      var entitleList = [];
      var licenseList = [];
      var isCommunicationSelected;
      if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
        licenseList = getAccountLicenses('additive') || [];
        isCommunicationSelected = !!_.find(licenseList, function (license) {
          return _.startsWith(license.id, 'CO_');
        });
      } else {
        entitleList = getEntitlements('add');
        isCommunicationSelected = !!_.find(entitleList, {
          entitlementName: 'ciscoUC'
        });
      }
      entitleList = entitleList.concat(getExtensionEntitlements('add'));

      function onboardCsvUsers(startIndex, userArray, entitlementArray, licenseArray, csvPromise) {
        return csvPromise.then(function () {
          return $q(function (resolve, reject) {
            if (userArray.length > 0) {
              Userservice.onboardUsers(userArray, entitlementArray, licenseArray, cancelDeferred.promise).then(function (response) {
                successCallback(response, startIndex - userArray.length + 1, userArray.length);
              }).catch(function (response) {
                errorCallback(response, startIndex - userArray.length + 1, userArray.length);
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
        $scope.model.processProgress = Math.round($scope.model.numTotalUsers / userArray.length * 100);

        if ($scope.model.numTotalUsers >= userArray.length) {
          $scope.model.userErrorArray.sort(function (a, b) {
            return a.row - b.row;
          });
          $rootScope.$broadcast('USER_LIST_UPDATED');
          saveDeferred.resolve();
        }
      }

      // Onboard users in chunks
      // Separate chunks on invalid rows
      var csvChunk = isCommunicationSelected ? 2 : 10; // Rate limit for Huron
      var csvPromise = $q.when();
      var tempUserArray = [];
      var uniqueEmails = [];
      var processingError;
      _.forEach(userArray, function (userEmail, j) {
        processingError = false;
        // If we haven't met the chunk size, process the next user
        if (tempUserArray.length < csvChunk) {
          // Validate content in the row
          if (_.contains(uniqueEmails, userEmail)) {
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
              directLine: ''
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

  }
})();
