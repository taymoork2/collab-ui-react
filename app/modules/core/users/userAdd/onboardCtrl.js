'use strict';

angular.module('Core')
  .controller('OnboardCtrl', ['$scope', '$state', '$stateParams', '$location', '$window', 'Log', 'Authinfo', 'Storage', '$rootScope', '$filter', '$translate', 'LogMetricsService', 'Config', 'GroupService', 'Notification', 'Userservice', 'HuronUser', '$timeout', 'Utils',
    function ($scope, $state, $stateParams, $location, $window, Log, Authinfo, Storage, $rootScope, $filter, $translate, LogMetricsService, Config, GroupService, Notification, Userservice, HuronUser, $timeout, Utils) {

      $scope.hasAccount = Authinfo.hasAccount();

      function ServiceFeature(label, value, name, id, entitlements) {
        this.label = label;
        this.value = value;
        this.name = name;
        this.id = id;
        this.entitlements = entitlements;
      }

      var userEnts = null;
      $scope.messageFeatures = [];
      $scope.conferenceFeatures = [];
      $scope.communicationFeatures = [];
      $scope.messageFeatures.push(new ServiceFeature($filter('translate')('onboardModal.freeMsg'), 0, 'msgRadio', 'freeTeamRoom', Config.getDefaultEntitlements()));
      $scope.conferenceFeatures.push(new ServiceFeature($filter('translate')('onboardModal.freeConf'), 0, 'confRadio', 'freeConferencing', Config.getDefaultEntitlements()));
      $scope.communicationFeatures.push(new ServiceFeature($filter('translate')('onboardModal.freeComm'), 0, 'commRadio', 'advancedCommunication', Config.getDefaultEntitlements()));
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
        msgRadio: 0,
        confRadio: 0,
        commRadio: 0
      };

      if (userEnts) {
        for (var x = 0; x < userEnts.length; x++) {
          if (userEnts[x] === 'ciscouc') {
            $scope.radioStates.commRadio = 1;
          } else if (userEnts[x] === 'squared-syncup') {
            $scope.radioStates.confRadio = 1;
          } else if (userEnts[x] === 'squared-room-moderation') {
            $scope.radioStates.msgRadio = 1;
          }
        }
      }

      $scope.setRadio = function (val) {
        $scope.collabRadio = val;
      };
      $scope.setMsgRadio = function (val) {
        $scope.radioStates.msgRadio = val;
      };
      $scope.setConfRadio = function (val) {
        $scope.radioStates.confRadio = val;
      };
      $scope.setCommRadio = function (val) {
        $scope.radioStates.commRadio = val;
      };

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
        var entList = getEntitlements('add');
        if (entList.length > 0 && !isUCSelected(entList)) {
          inviteUsers();
        } else {
          if ($scope.isAddEnabled()) {
            addUsers();
          } else if ($scope.isEntitleEnabled()) {
            entitleUsers();
          } else {
            var error = [];
            error.push();
            Notification.notify(error, 'error');
          }
        }
      };

      var usersList = [];

      var getServiceEntitlements = function (list, service) {
        if (service.entitlements) {
          var features = service.entitlements;
          for (var f = 0; f < features.length; f++) {
            list.push(new Feature(getSqEntitlement(features[f]), 'ACTIVE'));
          }
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

      var getAccountEntitlements = function () {
        var entitleList = [];
        if (Authinfo.hasAccount()) {
          var selMsgService = $scope.messageFeatures[$scope.radioStates.msgRadio];
          var selConfService = $scope.conferenceFeatures[$scope.radioStates.confRadio];
          var selCommService = $scope.communicationFeatures[$scope.radioStates.commRadio];

          entitleList = getServiceEntitlements(entitleList, selMsgService);
          entitleList = getServiceEntitlements(entitleList, selConfService);
          entitleList = getServiceEntitlements(entitleList, selCommService);
        }
        return entitleList;
      };

      var getEntitlements = function (action) {
        var entitleList = [];
        if (Authinfo.hasAccount() && $scope.collabRadio === 1) {
          entitleList = getAccountEntitlements();
        } else {
          var state = null;
          for (var key in $scope.entitlements) {
            state = $scope.entitlements[key];
            if (action === 'add' || (action === 'entitle' && state)) {
              entitleList.push(new Feature(key, state));
            }
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
        //console.log('saving user license ' + $scope.currentUser.displayName);
        var entitleList = [];
        var entStrings = getEntitlementStrings(getAccountEntitlements());

        var orgServices = Authinfo.getServices();
        for (var n = 0; n < orgServices.length; n++) {
          var service = orgServices[n];
          if (entStrings.indexOf(service.sqService) !== -1) {
            entitleList.push(new Feature(service.sqService, true));
          } else {
            entitleList.push(new Feature(service.sqService, false));
          }
        }

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

        Userservice.updateUsers(user, entitleList, entitleUserCallback);
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

      var addUsers = function () {
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        usersList = getUsersList();
        Log.debug('Entitlements: ', usersList);
        var callback = function (data, status) {
          if (data.success) {
            Log.info('User add request returned:', data);
            $rootScope.$broadcast('USER_LIST_UPDATED');

            for (var i = 0; i < data.userResponse.length; i++) {
              var userResult = {
                email: data.userResponse[i].email,
                alertType: null
              };

              var userStatus = data.userResponse[i].status;

              if (userStatus === 200) {
                userResult.message = 'added successfully';
                userResult.alertType = 'success';
                if (data.userResponse[i].entitled && data.userResponse[i].entitled.indexOf(Config.entitlements.huron) !== -1) {
                  var userData = {
                    'email': data.userResponse[i].email
                  };
                  HuronUser.create(data.userResponse[i].uuid, userData);
                }
              } else if (userStatus === 409) {
                userResult.message = 'already exists';
                userResult.alertType = 'danger';
                isComplete = false;
              } else {
                userResult.message = 'not added, status: ' + userStatus;
                userResult.alertType = 'danger';
                isComplete = false;
              }
              $scope.results.resultList.push(userResult);
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
              Notification.notify(successes, 'success');
              Notification.notify(errors, 'error');
            }

          } else {
            Log.warn('Could not add the user', data);
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
            Userservice.addUsers(temparray, getEntitlements('add'), callback);
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

      var entitleUsers = function () {
        usersList = getUsersList();
        Log.debug('Entitlements: ', usersList);

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnOnboard').button('loading');

          var i, temparray, chunk = Config.batchSize;
          for (i = 0; i < usersList.length; i += chunk) {
            temparray = usersList.slice(i, i + chunk);
            //update entitlements
            Userservice.updateUsers(temparray, getEntitlements('entitle'), entitleUserCallback);
          }

        } else {
          Log.debug('No users entered.');
          var error = [$filter('translate')('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
        }

      };

      var inviteUsers = function () {
        usersList = getUsersList();
        Log.debug('Invite: ', usersList);
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        var callback = function (data, status) {

          if (data.success) {
            Log.info('User invitation sent successfully.', data.id);
            // var success = [$translate.instant('usersPage.successInvite', data)];
            // Notification.notify(success, 'success');
            for (var i = 0; i < data.inviteResponse.length; i++) {

              var userResult = {
                email: data.inviteResponse[i].email,
                alertType: null
              };

              var userStatus = data.inviteResponse[i].status;

              if (userStatus === 200) {
                userResult.alertType = 'success';
              } else {
                userResult.alertType = 'danger';
                isComplete = false;
              }
              userResult.status = userStatus;
              $scope.results.resultList.push(userResult);
            }

            //concatenating the results in an array of strings for notify function
            var successes = [];
            var errors = [];
            var count_s = 0;
            var count_e = 0;
            for (var idx in $scope.results.resultList) {
              if ($scope.results.resultList[idx].status === 200) {
                successes[count_s] = $translate.instant('usersPage.emailSent', $scope.results.resultList[idx]);
                count_s++;
              } else if ($scope.results.resultList[idx].status === 304) {
                errors[count_e] = $translate.instant('usersPage.entitled', $scope.results.resultList[idx]);
                count_e++;
              } else if ($scope.results.resultList[idx].status === 403) {
                errors[count_e] = $translate.instant('usersPage.forbidden', $scope.results.resultList[idx]);
                count_e++;
              } else {
                errors[count_e] = $translate.instant('usersPage.emailFailed', $scope.results.resultList[idx]);
                count_e++;
              }
            }
            //Displaying notifications
            if (successes.length + errors.length === usersList.length) {
              angular.element('#btnOnboard').button('reset');
              Notification.notify(successes, 'success');
              Notification.notify(errors, 'error');
            }

          } else {
            Log.error('Could not process invitation.  Status: ' + status, data);
            var error = [$translate.instant('usersPage.errInvite', data)];
            Notification.notify(error, 'error');
            isComplete = false;
            angular.element('#btnOnboard').button('reset');
          }

          var msg = 'inviting ' + usersList.length + ' users...';
          LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('inviteUsers'), LogMetricsService.getEventAction('buttonClick'), status, startLog, usersList.length);

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnOnboard').button('loading');

          startLog = moment();

          var i, temparray, chunk = Config.batchSize;
          for (i = 0; i < usersList.length; i += chunk) {
            temparray = usersList.slice(i, i + chunk);
            //update entitlements
            Userservice.inviteUsers(temparray, getEntitlements('add'), callback);
          }

        } else {
          Log.debug('No users entered.');
          var error = [$filter('translate')('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
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
