'use strict';

/* global moment */

angular.module('Core')
  .controller('UsersCtrl', ['$scope', '$state', '$location', '$window', 'Userservice', 'UserListService', 'Log', 'Authinfo', 'Storage', '$rootScope', 'Notification', '$filter', '$translate', 'LogMetricsService', 'Config', 'HuronUser',
    function ($scope, $state, $location, $window, Userservice, UserListService, Log, Authinfo, Storage, $rootScope, Notification, $filter, $translate, LogMetricsService, Config, HuronUser) {

      $scope.init = function () {
        setPlaceholder();
      };

      $scope.isSquaredInviter = function () {
        return Authinfo.isSquaredInviter();
      };

      $scope.openAddUserPanel = function () {
        $state.go('users.list.add');
      };

      var setPlaceholder = function () {
        var placeholder = $filter('translate')('usersPage.userInput');
        angular.element('#usersfield-tokenfield').css('width', '100%');
        angular.element('#usersfield-tokenfield').attr('placeholder', placeholder);
      };

      //Initialize
      Notification.init($scope);
      $scope.popup = Notification.popup;
      var invalidcount = 0;

      function Feature(name, state) {
        this.entitlementName = name;
        this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
      }

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

      //placeholder logic
      var checkPlaceholder = function () {
        if (angular.element('.token-label').length > 0) {
          angular.element('#usersfield-tokenfield').attr('placeholder', '');
        } else {
          setPlaceholder();
        }
      };

      var checkButtons = function () {
        if (invalidcount > 0) {
          angular.element('#btnAdd').prop('disabled', true);
          angular.element('#btnEntitle').prop('disabled', true);
          angular.element('#btnInvite').prop('disabled', true);
        } else {
          angular.element('#btnAdd').prop('disabled', false);
          angular.element('#btnEntitle').prop('disabled', false);
          angular.element('#btnInvite').prop('disabled', false);
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

      $scope.isAddEnabled = function () {
        return Authinfo.isAddUserEnabled();
      };

      $scope.isEntitleEnabled = function () {
        return Authinfo.isEntitleUserEnabled();
      };

      $scope.resetEntitlements = function () {
        for (var svc in $scope.entitlements) {
          $scope.entitlements[svc] = false;
        }
      };

      $scope.addUsers = function () {
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        var usersList = getUsersList();
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
                  HuronUser.create(data.userResponse[i].email, data.userResponse[i].uuid);
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
              angular.element('#btnAdd').button('reset');
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
            angular.element('#btnAdd').button('reset');
          }

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnAdd').button('loading');

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

      $scope.entitleUsers = function () {
        var usersList = getUsersList();
        Log.debug('Entitlements: ', usersList);
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        var callback = function (data, status) {
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
              angular.element('#btnEntitle').button('reset');
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
            angular.element('#btnEntitle').button('reset');
          }

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnEntitle').button('loading');

          var i, temparray, chunk = Config.batchSize;
          for (i = 0; i < usersList.length; i += chunk) {
            temparray = usersList.slice(i, i + chunk);
            //update entitlements
            Userservice.updateUsers(temparray, getEntitlements('entitle'), callback);
          }

        } else {
          Log.debug('No users entered.');
          var error = [$filter('translate')('usersPage.validEmailInput')];
          Notification.notify(error, 'error');
        }

      };

      var startLog;

      $scope.inviteUsers = function () {
        var usersList = getUsersList();
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
              angular.element('#btnInvite').button('reset');
              Notification.notify(successes, 'success');
              Notification.notify(errors, 'error');
            }

          } else {
            Log.error('Could not process invitation.  Status: ' + status, data);
            var error = [$translate.instant('usersPage.errInvite', data)];
            Notification.notify(error, 'error');
            isComplete = false;
            angular.element('#btnInvite').button('reset');
          }

          var msg = 'inviting ' + usersList.length + ' users...';
          LogMetricsService.logMetrics(msg, LogMetricsService.getEventType('inviteUsers'), LogMetricsService.getEventAction('buttonClick'), status, startLog, usersList.length);

          if (isComplete) {
            resetUsersfield();
          }

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnInvite').button('loading');

          startLog = moment();

          var i, temparray, chunk = Config.batchSize;
          for (i = 0; i < usersList.length; i += chunk) {
            temparray = usersList.slice(i, i + chunk);
            //update entitlements
            Userservice.inviteUsers(temparray, callback);
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
      };

      $scope.$on('AuthinfoUpdated', function () {
        if (undefined !== $rootScope.services && $rootScope.services.length === 0) {
          $rootScope.services = Authinfo.getServices();
        }
        setEntitlementList();
      });

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

      $scope.getServiceName = function (service) {
        for (var i = 0; i < $rootScope.services.length; i++) {
          var svc = $rootScope.services[i];
          if (svc.sqService === service) {
            return svc.displayName;
          }
        }
      };

      var isEntitled = function (ent) {
        if ($rootScope.services) {
          for (var i = 0; i < $rootScope.services.length; i++) {
            var svc = $rootScope.services[i].ciService;

            if (svc === ent) {
              return true;
            }
          }
        }
        return false;
      };

      $scope.isServiceAllowed = function (service) {
        return Authinfo.isServiceAllowed(service);
      };

      //set intitially when loading the page
      //on initial login the AuthinfoUpdated broadcast may not be caught if not on user page
      setEntitlementList();

    }
  ]);
