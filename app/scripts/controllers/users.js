'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('UsersCtrl', ['$scope', '$location', '$window', '$dialogs', 'Userservice', 'UserListService', 'Log', 'Authinfo', '$rootScope',
    function($scope, $location, $window, $dialogs, Userservice, UserListService, Log, Authinfo, $rootScope) {

      function Feature (name, state) {
        this.entitlementName = name;
        this.entitlementState = state? 'ACTIVE' : 'INACTIVE';
      }

      //email validation logic
      var validateEmail = function(input) {
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
      var checkPlaceholder = function() {
        if (angular.element('.token-label').length > 0) {
          angular.element('#usersfield-tokenfield').attr('placeholder', '');
        } else {
          angular.element('#usersfield-tokenfield').attr('placeholder', 'Enter email addresses separated by commas or semi-colons');
        }
      };

      var invalidcount = 0;

      //tokenfield setup - Should make it into a directive later.
      angular.element('#usersfield').tokenfield({
        delimiter: [',', ';'],
        createTokensOnBlur: true
      })
        .on('tokenfield:preparetoken', function(e) {
          //Removing anything in brackets from user data
          var value = e.token.value.replace(/\s*\([^)]*\)\s*/g, ' ');
          e.token.value = value;
        })
        .on('tokenfield:createtoken', function(e) {
          if (!validateEmail(e.token.value)) {
            angular.element(e.relatedTarget).addClass('invalid');
            invalidcount++;
          }
          if (invalidcount > 0) {
            angular.element('#btnAdd').prop('disabled', true);
            angular.element('#btnEntitle').prop('disabled', true);
          } else {
            angular.element('#btnAdd').prop('disabled', false);
            angular.element('#btnEntitle').prop('disabled', false);
          }
          checkPlaceholder();
        })
        .on('tokenfield:edittoken', function(e) {
          if (!validateEmail(e.token.value)) {
            invalidcount--;
          }
        })
        .on('tokenfield:removetoken', function(e) {
          if (!validateEmail(e.token.value)) {
            invalidcount--;
          }
          if (invalidcount > 0) {
            angular.element('#btnAdd').prop('disabled', true);
            angular.element('#btnEntitle').prop('disabled', true);
          } else {
            angular.element('#btnAdd').prop('disabled', false);
            angular.element('#btnEntitle').prop('disabled', false);
          }
          checkPlaceholder();
        });

      var getUsersList = function() {
        return $window.addressparser.parse(angular.element('#usersfield').tokenfield('getTokensList'));
      };

      var resetUsersfield = function() {
        angular.element('#usersfield').tokenfield('setTokens', ' ');
        checkPlaceholder();
        invalidcount = 0;
      };

      $scope.clearPanel = function() {
        resetUsersfield();
        $scope.results = null;
      };

      $scope.isAddEnabled = function() {
        return Authinfo.isAddUserEnabled();
      };

      $scope.addUsers = function() {
        $scope.results = {
          resultList: []
        };
        $scope.error = null;
        var isComplete = true;
        var usersList = getUsersList();
        Log.debug('Entitlements: ', usersList);
        var callback = function(data, status) {
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

          } else {
            Log.warn('Could not add the user', data);
            if (status) {
              $scope.error = 'Request failed with status: ' + status + '. Message: ' + data;
            } else {
              $scope.error = 'Request failed: ' + data;
            }
            isComplete = false;
          }

          if (isComplete) {
            resetUsersfield();
          }
          angular.element('#btnAdd').button('reset');

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnAdd').button('loading');
          Userservice.addUsers(usersList, getEntitlements(), callback);
        } else {
          console.log('No users entered.');
          var userResult = {
            message: 'Please enter valid user email(s).',
            alertType: 'danger'
          };
          $scope.results = {
            resultList: []
          };
          $scope.results.resultList.push(userResult);
        }

      };

      $scope.entitleUsers = function() {
        var usersList = getUsersList();
        $scope.error = null;
        Log.debug('Entitlements: ', usersList);
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        var callback = function(data, status) {
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
                userResult.message = 'updated successfully';
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
                userResult.message = 'not updated, status: ' + userStatus;
                userResult.alertType = 'danger';
                isComplete = false;
              }

              $scope.results.resultList.push(userResult);

            }

          } else {
            Log.warn('Could not update the user', data);
            if (status) {
              $scope.error = 'Request failed with status: ' + status + '. Message: ' + data;
            } else {
              $scope.error = 'Request failed: ' + data;
            }
            isComplete = false;
          }

          if (isComplete) {
            resetUsersfield();
          }
          angular.element('#btnEntitle').button('reset');

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnEntitle').button('loading');
          Userservice.updateUsers(usersList, getEntitlements(), callback);
        } else {
          console.log('No users entered.');
          var userResult = {
            message: 'Please enter valid user email(s).',
            alertType: 'danger'
          };
          $scope.results = {
            resultList: []
          };
          $scope.results.resultList.push(userResult);
        }

      };

      //radio group
      $scope.entitlements = {};
      $scope.entitlements.webExSquared = true;
      $scope.entitlements.squaredCallInitiation = false;

      var getEntitlements = function(){
        var entitleList = [];
        for (var key in $scope.entitlements) {
          entitleList.push(new Feature(key, $scope.entitlements[key]));
        }
        Log.debug(entitleList);
        return entitleList;
      };

    }
  ]);
