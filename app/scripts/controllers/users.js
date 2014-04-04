'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('UsersCtrl', ['$scope', '$location', '$window', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Authinfo', 'Auth', 'Pagination',
    function($scope, $location, $window, Userservice, UserListService, Log, Storage, Config, Authinfo, Auth, Pagination) {

      //Initialize variables
      $scope.status = null;
      $scope.results = null;
      $scope.sorts = {
        name: 'fa-sort-asc',
        email: 'fa-sort',
        date: 'fa-sort'
      };
      var invalidcount = 0;
      var usersperpage = Config.usersperpage;
      $scope.pagination = Pagination.init($scope, usersperpage);

      var getUserList = function() {
        UserListService.listUsers(0, usersperpage, function(data, status) {
          if (data.success) {
            Log.debug(data.Resources);
            $scope.totalResults = data.totalResults;
            $scope.queryuserslist = data.Resources;
            if(data.totalResults!==0&&data.totalResults!==null&&$scope.pagination.perPage!==0&&$scope.pagination.perPage!==null){
              $scope.pagination.numPages = Math.ceil(data.totalResults / $scope.pagination.perPage);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }
        });
      };

      var searchUsers = function(str) {
        UserListService.searchUsers(str, 0, usersperpage, function(data) {
          if (data.success) {
            Log.debug('found matches['+data.totalResults+']: ' + data.Resources);
            $scope.queryuserslist = data.Resources;
            if(data.totalResults!==0&&data.totalResults!==null&&$scope.pagination.perPage!==0&&$scope.pagination.perPage!==null){
              $scope.pagination.numPages = Math.ceil(data.totalResults / $scope.pagination.perPage);
            }
          } else {
            Log.debug('Search users failed for: ' + str);
          }
        });
      };

      //Populating authinfo data if empty.
      if (Authinfo.isEmpty()) {
        var token = Storage.get('accessToken');
        if (token) {
          Log.debug('Authorizing user... Populating admin data...');
          Auth.authorize(token, $scope);
        } else {
          Log.debug('No accessToken.');
        }
      } else { //Authinfo has data. Load up users.
        getUserList();
      }

      //list users when we have authinfo data back, or new users have been added/activated
      $scope.$on('AuthinfoUpdated', function() {
        getUserList();
      });

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
            getUserList();

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
            angular.element('#usersfield').tokenfield('setTokens', ' ');
          }
          angular.element('#btnAdd').button('reset');

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnAdd').button('loading');
          Userservice.addUsers(usersList, callback);
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
            Log.info('User successfully entitled', data);
            getUserList();

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
              } else {
                userResult.message = 'not entitled, status: ' + userStatus;
                userResult.alertType = 'danger';
                isComplete = false;
              }

              $scope.results.resultList.push(userResult);

            }

          } else {
            Log.warn('Could not entitle the user', data);
            if (status) {
              $scope.error = 'Request failed with status: ' + status + '. Message: ' + data;
            } else {
              $scope.error = 'Request failed: ' + data;
            }
            isComplete = false;
          }

          if (isComplete) {
            angular.element('#usersfield').tokenfield('setTokens', ' ');
          }
          angular.element('#btnEntitle').button('reset');

        };

        if (typeof usersList !== 'undefined' && usersList.length > 0) {
          angular.element('#btnEntitle').button('loading');
          Userservice.entitleUsers(usersList, callback);
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

      //Search users based on search criteria
      $scope.$on('SEARCH_ITEM', function(e, str) {
        Log.debug('got broadcast for search:' + str);
        if (str === '')
        {
          getUserList();
          $scope.pagination.mode = 'list';
          $scope.pagination.param = '';
        }
        else
        {
          searchUsers(str);
          $scope.pagination.mode = 'search';
          $scope.pagination.param = str;
        }
      });
    }
  ]);
