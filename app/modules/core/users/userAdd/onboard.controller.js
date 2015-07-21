'use strict';

angular.module('Core')
  .controller('OnboardCtrl', ['$scope', '$state', '$stateParams', '$q', '$window', 'Log', '$log', 'Authinfo', 'Storage', '$rootScope', '$translate', 'LogMetricsService', 'Config', 'GroupService', 'Notification', 'Userservice', 'HuronUser', '$timeout', 'Utils',
    function ($scope, $state, $stateParams, $q, $window, Log, $log, Authinfo, Storage, $rootScope, $translate, LogMetricsService, Config, GroupService, Notification, Userservice, HuronUser, $timeout, Utils) {

      $scope.hasAccount = Authinfo.hasAccount();

      // model can be removed after switching to controllerAs
      $scope.model = {
        userInputOption: 0,
        nextButtonDisabled: true
      };

      $scope.strFirstName = $translate.instant('usersPage.firstNamePlaceHolder');
      $scope.strLastName = $translate.instant('usersPage.lastNamePlaceHolder');
      $scope.strEmailAddress = $translate.instant('usersPage.emailAddressPlaceHolder');
      var strNameAndEmailAdress = $translate.instant('usersPage.nameAndEmailAddress');
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

      $scope.messageFeatures.push(new ServiceFeature($translate.instant('onboardModal.freeMsg'), 0, 'msgRadio', new FakeLicense('freeTeamRoom')));
      $scope.conferenceFeatures.push(new ServiceFeature($translate.instant('onboardModal.freeConf'), 0, 'confRadio', new FakeLicense('freeConferencing')));
      $scope.communicationFeatures.push(new ServiceFeature($translate.instant('onboardModal.freeComm'), 0, 'commRadio', new FakeLicense('advancedCommunication')));
      $scope.currentUser = $stateParams.currentUser;

      if ($scope.currentUser) {
        userEnts = $scope.currentUser.entitlements;
        userLicenseIds = $scope.currentUser.licenseID;
      }

      var populateConf = function () {
        if (userLicenseIds) {
          for (var ids in userLicenseIds) {
            var currentId = userLicenseIds[ids];
            for (var conf in $scope.confChk) {
              var currentConf = $scope.confChk[conf];
              if (currentConf.confFeature) {
                if (currentConf.confFeature.license.licenseId === currentId) {
                  currentConf.confModel = true;
                }
              }
              if (currentConf.cmrFeature) {
                if (currentConf.cmrFeature.license.licenseId === currentId) {
                  currentConf.cmrModel = true;
                }
              }
            }
          }
        }
      };

      $scope.radioStates = {
        commRadio: false,
        confRadio: false,
        msgRadio: false,
        subLicense: {}
      };

      if (userEnts) {
        for (var x = 0; x < userEnts.length; x++) {
          if (userEnts[x] === 'ciscouc') {
            $scope.radioStates.commRadio = true;
          } else if (userEnts[x] === 'squared-room-moderation') {
            $scope.radioStates.msgRadio = true;
          }
        }
      }

      var generateConfChk = function (conf, cmr) {
        $scope.confChk = [];
        for (var i in conf) {
          var temp = {
            confFeature: conf[i],
            confModel: false,
            confId: 'conf-' + i
          };

          if (cmr !== null && conf[i].license.siteUrl !== undefined && cmr.license.siteUrl === conf[i].license.siteUrl) {
            temp.cmrFeature = cmr;
            temp.cmrModel = false;
            temp.cmrId = 'cmr-' + i;
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
        }
        if (services.conference) {
          $scope.cmrFeature = Authinfo.getCmrServices();
          $scope.conferenceFeatures = $scope.conferenceFeatures.concat(services.conference);
          generateConfChk($scope.conferenceFeatures, $scope.cmrFeature);
        }
        if (services.communication) {
          $scope.communicationFeatures = $scope.communicationFeatures.concat(services.communication);
        }
      };

      if (Authinfo.isInitialized()) {
        getAccountServices();
      }

      $scope.groups = [];
      GroupService.getGroupList(function (data, status) {
        if (data.success) {
          $scope.groups = data.groups;
          if (data.groups && data.groups.length === 0) {
            var defaultGroup = {
              displayName: 'Default License Group'
            };
            data.groups.push(defaultGroup);
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

      $scope.gridOptions = {
        data: 'groups',
        rowHeight: 44,
        headerRowHeight: 44,
        multiSelect: false,
        sortInfo: {
          fields: ['displayName'],
          directions: ['asc']
        },

        columnDefs: [{
          field: 'displayName',
          displayName: $translate.instant('onboardModal.groupColHeader'),
          sortable: true
        }]
      };

      $scope.collabRadio = 1;

      var isUCSelected = function (list) {
        for (var x = 0; x < list.length; x++) {
          var ent = list[x];
          if (ent.entitlementName === 'ciscoUC' &&
            ent.entitlementState === 'ACTIVE') {
            return true;
          }
        }
        return false;
      };

      $scope.onboardUsers = onboardUsers;

      var usersList = [];

      var getSqEntitlement = function (key) {
        var sqEnt = null;
        var orgServices = Authinfo.getServices();
        for (var n = 0; n < orgServices.length; n++) {
          var service = orgServices[n];
          if (key === service.ciName) {
            return service.serviceId;
          }
        }
        return sqEnt;
      };

      var getConfIdList = function () {
        var confId = [];
        for (var cf in $scope.confChk) {
          var current = $scope.confChk[cf];
          if (current.confModel === true) {
            confId.push(current.confFeature.license.licenseId);
          }
          if (current.cmrModel === true) {
            confId.push(current.cmrFeature.license.licenseId);
          }
        }
        return confId;
      };

      var getAccountLicenseIds = function () {
        var licenseIdList = [];
        if (Authinfo.hasAccount()) {
          // Messaging: prefer selected subscription, if specified
          if ('licenseId' in $scope.radioStates.subLicense) {
            licenseIdList.push($scope.radioStates.subLicense.licenseId);
          } else {
            var msgIndex = $scope.radioStates.msgRadio ? 1 : 0;
            var selMsgService = $scope.messageFeatures[msgIndex];
            // TODO (tohagema): clean up messageFeatures license(s) model :/
            var license = selMsgService.license || selMsgService.licenses[0];
            if ('licenseId' in license) licenseIdList.push(license.licenseId);
          }
          // Conferencing: depends on model (standard vs. CMR)
          licenseIdList = licenseIdList.concat(getConfIdList());
          // Communication: straightforward license, for now
          var commIndex = $scope.radioStates.commRadio ? 1 : 0;
          var selCommService = $scope.communicationFeatures[commIndex];
          if ('licenseId' in selCommService.license) {
            licenseIdList.push(selCommService.license.licenseId);
          }
        }
        return licenseIdList.length === 0 ? null : licenseIdList;
      };

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
        if ($scope.currentUser) {
          usersList = [];
          var familyName, givenName;
          if (angular.isDefined($scope.currentUser.name)) {
            familyName = $scope.currentUser.name.familyName;
            givenName = $scope.currentUser.name.givenName;
          }
          var userObj = {
            'address': $scope.currentUser.userName,
            'familyName': familyName,
            'givenName': givenName
          };
          user.push(userObj);
          usersList.push(user);
        }
        angular.element('#btnSaveEnt').button('loading');

        Userservice.updateUsers(user, getAccountLicenseIds(), null, entitleUserCallback);
      };

      //****************MODAL INIT FUNCTION FOR INVITE AND ADD***************
      //***
      //***
      //*********************************************************************

      function Feature(name, state) {
        this.entitlementName = name;
        this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
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

      var checkNextButtonStatus = function () {
        wizardNextText();
        $scope.model.nextButtonDisabled = invalidcount > 0;
      };

      var wizardNextText = function () {
        var userCount = angular.element('.token-label').length;
        var action = 'finish';
        if (userCount > 0) {
          action = 'next';
        }
        $scope.$emit('wizardNextText', action);
      };

      $scope.tokenfieldid = "usersfield";
      $scope.tokenplaceholder = $translate.instant('usersPage.userInput');
      $scope.tokenoptions = {
        delimiter: [',', ';'],
        createTokensOnBlur: true
      };
      $scope.tokenmethods = {
        createtoken: function (e) {
          //Removing anything in brackets from user data
          var value = e.attrs.value.replace(/\s*\([^)]*\)\s*/g, ' ');
          e.attrs.value = value;
        },
        createdtoken: function (e) {
          if (!validateEmail(e.attrs.value)) {
            angular.element(e.relatedTarget).addClass('invalid');
            invalidcount++;
          }
          checkNextButtonStatus();
          checkPlaceholder();
        },
        edittoken: function (e) {
          if (!validateEmail(e.attrs.value)) {
            invalidcount--;
          }
        },
        removedtoken: function (e) {
          if (!validateEmail(e.attrs.value)) {
            invalidcount--;
          }
          checkNextButtonStatus();
          checkPlaceholder();
        }
      };

      var invalidcount = 0;
      var startLog;

      var setPlaceholder = function (placeholder) {
        angular.element('.tokenfield.form-control #usersfield-tokenfield').attr('placeholder', placeholder);
      };

      //placeholder logic
      var checkPlaceholder = function () {
        if (angular.element('.token-label').length > 0) {
          setPlaceholder('');
        } else {
          setPlaceholder($translate.instant('usersPage.userInput'));
        }
      };

      var getUsersList = function () {
        return $window.addressparser.parse($scope.model.userList);
      };

      $scope.validateTokens = function () {
        wizardNextText();
        $timeout(function () {
          var tokenfield = angular.element('#usersfield');
          //reset the invalid count
          invalidcount = 0;
          angular.element('#usersfield').tokenfield('setTokens', $scope.model.userList);
        }, 100);
      };

      $scope.addToUsersfield = function () {
        if ($scope.model.userForm.$valid && $scope.model.userInfoValid) {
          var userInfo = $scope.model.firstName + ' ' + $scope.model.lastName + '  ' + $scope.model.emailAddress;
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
        $scope.radioStates.subLicense = {};
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
        var callback = function (data, status) {
          if (data.success) {
            Log.info('User onboard request returned:', data);
            $rootScope.$broadcast('USER_LIST_UPDATED');
            var promises = [];
            var numAddedUsers = 0;

            for (var num = 0; num < data.userResponse.length; num++) {
              if (data.userResponse[num].status === 200) {
                numAddedUsers++;
              }
            }

            if (numAddedUsers > 0) {
              var msg = 'Invited ' + numAddedUsers + ' users';
              LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('inviteUsers'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), numAddedUsers);
            }

            for (var i = 0; i < data.userResponse.length; i++) {
              var userResult = {
                email: data.userResponse[i].email,
                alertType: null
              };

              var userStatus = data.userResponse[i].status;

              if (userStatus === 200) {
                userResult.message = $translate.instant('usersPage.onboardSuccess', userResult);
                userResult.alertType = 'success';
                var promise;
                if (data.userResponse[i].entitled && data.userResponse[i].entitled.indexOf(Config.entitlements.huron) !== -1) {
                  var userData = {
                    'email': data.userResponse[i].email,
                    'name': data.userResponse[i].name
                  };
                  promise = HuronUser.create(data.userResponse[i].uuid, userData)
                    .catch(function (response) {
                      this.alertType = 'danger';
                      this.message = Notification.processErrorResponse(response, 'usersPage.ciscoucError', this);
                    }.bind(userResult));
                  promises.push(promise);
                }
                if (data.userResponse[i].unentitled && data.userResponse[i].unentitled.indexOf(Config.entitlements.huron) !== -1) {
                  promise = HuronUser.delete(data.userResponse[i].uuid)
                    .catch(function (response) {
                      // If the user does not exist in Squared UC do not report an error
                      if (response.status !== 404) {
                        // Notify Huron error
                        Notification.errorResponse(response);
                      }
                    });
                  promises.push(promise);
                }
              } else if (userStatus === 409) {
                userResult.message = userResult.email + ' ' + data.userResponse[i].message;
                userResult.alertType = 'danger';
                isComplete = false;
              } else {
                userResult.message = $translate.instant('usersPage.onboardError', {
                  email: userResult.email,
                  status: userStatus
                });
                userResult.alertType = 'danger';
                isComplete = false;
              }
              $scope.results.resultList.push(userResult);
            }

            $q.all(promises).then(function () {
              //concatenating the results in an array of strings for notify function
              var successes = [];
              var errors = [];
              var count_s = 0;
              var count_e = 0;
              for (var idx in $scope.results.resultList) {
                if ($scope.results.resultList[idx].alertType === 'success') {
                  successes[count_s] = $scope.results.resultList[idx].message;
                  count_s++;
                } else {
                  errors[count_e] = $scope.results.resultList[idx].message;
                  count_e++;
                }
              }
              //Displaying notifications
              if (successes.length + errors.length === usersList.length) {
                angular.element('#btnOnboard').button('reset');
                Notification.notify(successes, 'success');
                Notification.notify(errors, 'error');
                deferred.resolve();
              }
              if (angular.isFunction($scope.$dismiss) && successes.length === usersList.length) {
                $scope.$dismiss();
              }
            });

          } else {
            Log.warn('Could not onboard the user', data);
            var error = null;
            if (status) {
              error = $translate.instant('usersPage.statusError', {
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
              Notification.notify(error, 'error');
            }
            Notification.notify([error], 'error');
            isComplete = false;
            angular.element('#btnOnboard').button('reset');
            deferred.reject();
          }

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (angular.isArray(usersList) && usersList.length > 0) {
          angular.element('#btnOnboard').button('loading');

          var i, temparray, chunk = Config.batchSize;
          for (i = 0; i < usersList.length; i += chunk) {
            temparray = usersList.slice(i, i + chunk);
            //update entitlements
            var entitleList = [];
            var licenseList = [];
            if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
              licenseList = getAccountLicenseIds();
            } else {
              entitleList = getEntitlements('add');
            }
            Userservice.onboardUsers(temparray, entitleList, licenseList, callback);
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

      var entitleUserCallback = function (data, status) {
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
              userResult.message = 'entitled successfully';
              userResult.alertType = 'success';
            } else if (userStatus === 404) {
              userResult.message = 'does not exist';
              userResult.alertType = 'danger';
              isComplete = false;
            } else if (userStatus === 409) {
              userResult.message = 'entitlement previously updated';
              userResult.alertType = 'danger';
              isComplete = false;
            } else {
              userResult.message = 'not entitled, status: ' + userStatus;
              userResult.alertType = 'danger';
              isComplete = false;
            }
            $scope.results.resultList.push(userResult);
            $scope.$dismiss();
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
              errors[count_e] = $scope.results.resultList[idx].email + ' ' + $scope.results.resultList[idx].message;
              count_e++;
            }
          }

          //Displaying notifications
          if (successes.length + errors.length === usersList.length) {
            angular.element('#btnOnboard').button('reset');
            angular.element('#btnSaveEnt').button('reset');
            Notification.notify(successes, 'success');
            Notification.notify(errors, 'error');
          }

        } else {
          Log.warn('Could not entitle the user', data);
          var error = null;
          if (status) {
            error = $translate.instant('usersPage.statusError', {
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
          Notification.notify([error], 'error');
          isComplete = false;
          angular.element('#btnOnboard').button('reset');
          angular.element('#btnSaveEnt').button('reset');
        }

        if (isComplete) {
          resetUsersfield();
        }

      };

      //radio group
      $scope.entitlements = {};
      var setEntitlementList = function () {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i].serviceId;

          $scope.entitlements[svc] = false;
          if (svc === 'webExSquared') {
            $scope.entitlements[svc] = true;
          }
        }
        $scope.entitlementsKeys = Object.keys($scope.entitlements).sort().reverse();
      };

      $scope.$on('AuthinfoUpdated', function () {
        if (undefined !== $rootScope.services && $rootScope.services.length === 0) {
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
          return deferred.promise;
        }

        if (invalidcount === 0) {
          deferred.resolve();
        } else {
          var error = [$translate.instant('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
          deferred.reject();
        }

        return deferred.promise;
      };
      // Wizard hook for save button
      $scope.assignServicesNext = function () {
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
        });
      };

      //set intitially when loading the page
      //on initial login the AuthinfoUpdated broadcast may not be caught if not on user page
      setEntitlementList();
      watchCheckboxes();
    }
  ]);
