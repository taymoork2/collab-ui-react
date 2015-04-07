'use strict';

angular.module('Core')
  .controller('OnboardCtrl', ['$scope', '$state', '$stateParams', '$q', '$window', 'Log', 'Authinfo', 'Storage', '$rootScope', '$filter', '$translate', 'LogMetricsService', 'Config', 'GroupService', 'Notification', 'Userservice', 'HuronUser', '$timeout', 'Utils',
    function ($scope, $state, $stateParams, $q, $window, Log, Authinfo, Storage, $rootScope, $filter, $translate, LogMetricsService, Config, GroupService, Notification, Userservice, HuronUser, $timeout, Utils) {

      $scope.hasAccount = Authinfo.hasAccount();

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

      var userEnts = null;
      $scope.messageFeatures = [];
      $scope.conferenceFeatures = [];
      $scope.communicationFeatures = [];
      $scope.messageFeatures.push(new ServiceFeature($filter('translate')('onboardModal.freeMsg'), 0, 'msgRadio', new FakeLicense('freeTeamRoom')));
      $scope.conferenceFeatures.push(new ServiceFeature($filter('translate')('onboardModal.freeConf'), 0, 'confRadio', new FakeLicense('freeConferencing')));
      $scope.communicationFeatures.push(new ServiceFeature($filter('translate')('onboardModal.freeComm'), 0, 'commRadio', new FakeLicense('advancedCommunication')));
      $scope.currentUser = $stateParams.currentUser;
      if ($scope.currentUser) {
        userEnts = $scope.currentUser.entitlements;
      }

      var getAccountServices = function () {
        if (Authinfo.getMessageServices()) {
          $scope.messageFeatures = $scope.messageFeatures.concat(Authinfo.getMessageServices());
        }
        if (Authinfo.getConferenceServices()) {
          $scope.conferenceFeatures = $scope.conferenceFeatures.concat(Authinfo.getConferenceServices());
        }
        if (Authinfo.getCommunicationServices()) {
          $scope.communicationFeatures = $scope.communicationFeatures.concat(Authinfo.getCommunicationServices());
        }
      };

      if (Authinfo.isInitialized()) {
        getAccountServices();
      }

      $scope.groups = [];
      GroupService.getGroupList(function (data, status) {
        if (data.success === true) {
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
        label: $filter('translate')('onboardModal.enableCollab'),
        value: 1,
        name: 'collabRadio',
        id: 'collabRadio1'
      };

      $scope.collabRadio2 = {
        label: $filter('translate')('onboardModal.enableCollabGroup'),
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
          displayName: $filter('translate')('onboardModal.groupColHeader'),
          sortable: true
        }]
      };

      $scope.collabRadio = 1;
      $scope.radioStates = {
        msgRadio: false,
        confRadio: false,
        commRadio: false
      };

      if (userEnts) {
        for (var x = 0; x < userEnts.length; x++) {
          if (userEnts[x] === 'ciscouc') {
            $scope.radioStates.commRadio = true;
          } else if (userEnts[x] === 'squared-syncup') {
            $scope.radioStates.confRadio = true;
          } else if (userEnts[x] === 'squared-room-moderation') {
            $scope.radioStates.msgRadio = true;
          }
        }
      }

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

      $scope.onboardUsers = function () {
        onboardUsers();
      };

      var usersList = [];

      var getServiceLicenseIds = function (list, service) {
        if (service.licenseId) {
          list.push(service.license.licenseId);
        }
        return list;
      };

      var getSqEntitlement = function (key) {
        var sqEnt = null;
        var orgServices = Authinfo.getServices();
        for (var n = 0; n < orgServices.length; n++) {
          var service = orgServices[n];
          if (key === service.ciService) {
            return service.sqService;
          }
        }
        return sqEnt;
      };

      var getAccountLicenseIds = function () {
        var licenseIdList = [];
        if (Authinfo.hasAccount()) {
          var index = $scope.radioStates.msgRadio ? 1 : 0;
          var selMsgService = $scope.messageFeatures[index];

          index = $scope.radioStates.confRadio ? 1 : 0;
          var selConfService = $scope.conferenceFeatures[index];

          index = $scope.radioStates.commRadio ? 1 : 0;
          var selCommService = $scope.communicationFeatures[index];

          licenseIdList = getServiceLicenseIds(licenseIdList, selMsgService);
          licenseIdList = getServiceLicenseIds(licenseIdList, selConfService);
          licenseIdList = getServiceLicenseIds(licenseIdList, selCommService);
        }
        return licenseIdList;
      };

      var getEntitlements = function (action) {
        var entitleList = [];
        var state = null;
        for (var key in $scope.entitlements) {
          state = $scope.entitlements[key];
          if (action === 'add' || (action === 'entitle' && state)) {
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
          var userObj = {
            'address': $scope.currentUser.userName,
            'name': ''
          };
          user.push(userObj);
          usersList.push(user);
        }
        angular.element('#btnSaveEnt').button('loading');

        Userservice.updateUsers(user, getAccountLicenseIds(), [], entitleUserCallback);
      };

      //****************MODAL INIT FUNCTION FOR INVITE AND ADD***************
      //***
      //***
      //*********************************************************************

      function Feature(name, state) {
        this.entitlementName = name;
        this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
      }

      $scope.init = function () {
        setPlaceholder();
      };

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

      var checkButtons = function () {
        if (invalidcount > 0) {
          angular.element('#btnOnboard').prop('disabled', true);
        } else {
          angular.element('#btnOnboard').prop('disabled', false);
        }
      };

      $scope.setupTokenfield = function () {
        //tokenfield setup - Should make it into a directive later.
        angular.element('#usersfield').tokenfield({
            delimiter: [',', ';'],
            createTokensOnBlur: true
          })
          .on('tokenfield:createtoken', function (e) {
            //Removing anything in brackets from user data
            var value = e.attrs.value.replace(/\s*\([^)]*\)\s*/g, ' ');
            e.attrs.value = value;
          })
          .on('tokenfield:createdtoken', function (e) {
            if (!validateEmail(e.attrs.value)) {
              angular.element(e.relatedTarget).addClass('invalid');
              invalidcount++;
            }
            checkButtons();
            checkPlaceholder();
          })
          .on('tokenfield:edittoken', function (e) {
            if (!validateEmail(e.attrs.value)) {
              invalidcount--;
            }
          })
          .on('tokenfield:removetoken', function (e) {
            if (!validateEmail(e.attrs.value)) {
              invalidcount--;
            }
            checkButtons();
            checkPlaceholder();
          });

        angular.element('#usersfield-tokenfield').css('width', '100%');
      };

      var invalidcount = 0;
      var startLog;

      var setPlaceholder = function () {
        var placeholder = $filter('translate')('usersPage.userInput');
        angular.element('#usersfield-tokenfield').css('width', '100%');
        angular.element('#usersfield-tokenfield').attr('placeholder', placeholder);
      };

      //placeholder logic
      var checkPlaceholder = function () {
        if (angular.element('.token-label').length > 0) {
          angular.element('#usersfield-tokenfield').attr('placeholder', '');
        } else {
          setPlaceholder();
        }
      };

      var getUsersList = function () {
        return $window.addressparser.parse(angular.element('#usersfield').tokenfield('getTokensList'));
      };

      var resetUsersfield = function () {
        angular.element('#usersfield').tokenfield('setTokens', ' ');
        checkPlaceholder();
        invalidcount = 0;
      };

      $scope.clearPanel = function () {
        resetUsersfield();
        $scope.results = null;
      };

      var onboardUsers = function () {
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
                if (data.userResponse[i].entitled && data.userResponse[i].entitled.indexOf(Config.entitlements.huron) !== -1) {
                  var userData = {
                    'email': data.userResponse[i].email
                  };
                  var promise = HuronUser.create(data.userResponse[i].uuid, userData)
                    .catch(function (response) {
                      this.alertType = 'danger';
                      this.message = $translate.instant('usersPage.ciscoucError', this) + (response.data && response.data.errorMessage ? ' ' + response.data.errorMessage : '');
                    }.bind(userResult));
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
              }
            });

          } else {
            Log.warn('Could not onboard the user', data);
            var error = null;
            if (status) {
              error = ['Request failed with status: ' + status + '. Message: ' + data];
              Notification.notify(error, 'error');
            } else {
              error = ['Request failed: ' + data];
              Notification.notify(error, 'error');
            }
            isComplete = false;
            angular.element('#btnOnboard').button('reset');
          }

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
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
        } else {
          Log.debug('No users entered.');
          var error = [$filter('translate')('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
        }

      };

      var entitleUserCallback = function (data, status) {
        $scope.results = {
          resultList: []
        };
        var isComplete = true;

        if (data.success) {
          Log.info('User successfully updated', data);
          $rootScope.$broadcast('USER_LIST_UPDATED');

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
            error = ['Request failed with status: ' + status + '. Message: ' + data];
            Notification.notify(error, 'error');
          } else {
            error = ['Request failed: ' + data];
            Notification.notify(error, 'error');
          }
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
          var svc = $rootScope.services[i].sqService;

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

      $scope.isServiceAllowed = function (service) {
        return Authinfo.isServiceAllowed(service);
      };

      $scope.getServiceName = function (service) {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i];
          if (svc.sqService === service) {
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

      $scope.setupTokenfield();
      //set intitially when loading the page
      //on initial login the AuthinfoUpdated broadcast may not be caught if not on user page
      setEntitlementList();
      watchCheckboxes();

    }
  ]);
