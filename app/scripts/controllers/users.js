'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('UsersCtrl', ['$scope', '$location', '$window', '$dialogs', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Authinfo', 'Auth', 'Pagination',
    function($scope, $location, $window, $dialogs, Userservice, UserListService, Log, Storage, Config, Authinfo, Auth, Pagination) {

      //Initialize variables
      $scope.status = null;
      $scope.results = null;
      $scope.sort = {
        by: 'name',
        order: 'ascending',
        icon: {
          name: 'fa-sort-asc',
          username: 'fa-sort',
          date: 'fa-sort'
        }
      };
      var invalidcount = 0;
      var usersperpage = Config.usersperpage;
      $scope.pagination = Pagination.init($scope, usersperpage);

      var getUserList = function() {
        var startIndex = $scope.pagination.page * usersperpage + 1;
        UserListService.listUsers(startIndex, usersperpage, $scope.sort.by, $scope.sort.order, function(data, status) {
          if (data.success) {
            Log.debug(data.Resources);
            $scope.totalResults = data.totalResults;
            $scope.queryuserslist = data.Resources;
            if (data.totalResults !== 0 && data.totalResults !== null && $scope.pagination.perPage !== 0 && $scope.pagination.perPage !== null) {
              $scope.pagination.numPages = Math.ceil(data.totalResults / $scope.pagination.perPage);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
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
            checkPlaceholder();
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
            checkPlaceholder();
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

      //Search users based on search criteria
      $scope.$on('SEARCH_ITEM', function(e, str) {
        Log.debug('got broadcast for search:' + str);
        $scope.pagination.page = 0;
        getUserList();
      });

      $scope.getEntitlementState = function(user) {
        if (!user.entitlements || user.entitlements.length === 0) {
          return false;
        } else {
          return (user.entitlements.indexOf('webex-squared') > -1);
        }

      };

      $scope.changeEntitlement = function(userEmail, isEntitle) {
        var dlg = $dialogs.confirm('Change Service Entitlement', 'Are you sure you want to ' + (isEntitle ? 'enable' : 'disable') + ' squared service for user ' + userEmail + '?');
        dlg.result.then(function() {
          $scope.confirmed = true;
          Userservice.updateUsers([{
            'address': userEmail
          }], getEntitlements(), function(data, status) {
            if (data.success) {
              // ToDo: parse result to determine if success for user[0]
              // ToDo: add result area to show success message
              getUserList();
            } else {
              console.log('Deactivate user failed for: ' + userEmail + ' Status:' + status);
            }
          });
        }, function() {
          console.log('User canceled deactivate for: ' + userEmail + ' Status:' + status);
          $scope.confirmed = false;
        });
      };

      //sorting function
      $scope.setSort = function(type) {
        switch (type) {
        case 'name':
          if ($scope.sort.by === 'userName') {
            $scope.sort.by = 'name';
            $scope.sort.order = 'ascending';
            $scope.sort.icon.name = 'fa-sort-asc';
            $scope.sort.icon.username = 'fa-sort';
            getUserList();
          } else if ($scope.sort.by === 'name') {
            if ($scope.sort.order === 'ascending') {
              $scope.sort.order = 'descending';
              $scope.sort.icon.name = 'fa-sort-desc';
              getUserList();
            } else {
              $scope.sort.order = 'ascending';
              $scope.sort.icon.name = 'fa-sort-asc';
              getUserList();
            }
          }
          break;

        case 'username':
          if ($scope.sort.by === 'name') {
            $scope.sort.by = 'userName';
            $scope.sort.order = 'ascending';
            $scope.sort.icon.username = 'fa-sort-asc';
            $scope.sort.icon.name = 'fa-sort';
            getUserList();
          } else if ($scope.sort.by === 'userName') {
            if ($scope.sort.order === 'ascending') {
              $scope.sort.order = 'descending';
              $scope.sort.icon.username = 'fa-sort-desc';
              getUserList();
            } else {
              $scope.sort.order = 'ascending';
              $scope.sort.icon.username = 'fa-sort-asc';
              getUserList();
            }
          }
          break;

        default:
          Log.debug('Sort type not recognized.');
        }
      };

      //accordian functionality
      $scope.oneAtATime = true;
      $scope.isopen = true;
      $scope.isAddOpen = true;

      //radio group
      $scope.entitlements = {};
      $scope.entitlements.webExSquared = 'ACTIVE';
      $scope.entitlements.squaredCallInitiation = 'INACTIVE';

      var getEntitlements = function(){
        var entitleList = [];
        for (var key in $scope.entitlements) {
          var ent = {};
          ent.entitlementName = key;
          ent.entitlementState = $scope.entitlements[key];
          entitleList.push(ent);
        }
        Log.debug(entitleList);
        return entitleList;
      };

    }
  ]);
