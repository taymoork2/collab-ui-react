'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('UsersCtrl', ['$scope', '$location', '$window', '$dialogs', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Authinfo', 'Auth', 'Pagination', '$rootScope', 'Notification',
    function($scope, $location, $window, $dialogs, Userservice, UserListService, Log, Storage, Config, Authinfo, Auth, Pagination, $rootScope, Notification) {

      function Feature (name, state) {
        this.entitlementName = name;
        this.entitlementState = state? 'ACTIVE' : 'INACTIVE';
      }

      function squaredFeature(state) {
        return new Feature('webExSquared', state);
      }

      function callFeature(state) {
        return new Feature('squaredCallInitiation', state);
      }

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
      Notification.init($scope);
      $scope.popup = Notification.popup;

      var getUserList = function() {
        var startIndex = $scope.pagination.page * usersperpage + 1;
        UserListService.listUsers(startIndex, usersperpage, $scope.sort.by, $scope.sort.order, function(data, status, searchStr) {
          if (data.success) {
            if ($rootScope.searchStr === searchStr)
            {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
              Log.debug('Returned data.', data.Resources);
              $scope.totalResults = data.totalResults;
              $scope.queryuserslist = data.Resources;
              if (data.totalResults !== 0 && data.totalResults !== null && $scope.pagination.perPage !== 0 && $scope.pagination.perPage !== null) {
                $scope.pagination.numPages = Math.ceil(data.totalResults / $scope.pagination.perPage);
              }
            }
            else
            {
              Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
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
            Notification.notify(successes, 'success');
            Notification.notify(errors, 'error');

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
          var error = ['Please enter valid user email(s).'];
          Notification.notify(error, 'error');
        }

      };

      $scope.entitleUsers = function() {
        var usersList = getUsersList();
        Log.debug('Entitlements: ', usersList);
        $scope.results = {
          resultList: []
        };
        var isComplete = true;
        var callback = function(data, status) {
          if (data.success) {
            Log.info('User successfully updated', data);
            getUserList();

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
            Notification.notify(successes, 'success');
            Notification.notify(errors, 'error');

          } else {
            Log.warn('Could not update the user', data);
            var error = null;
            if (status) {
              error = ['Request failed with status: ' + status + '. Message: ' + data];
              Notification.notify(error, 'error');
            } else {
              error = ['Request failed: ' + data];
              Notification.notify(error, 'error');
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
          var error = 'Please enter valid user email(s).';
          Notification.notify(error, 'error');
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

      $scope.changeEntitlement = function(user) {
        var dlg = $dialogs.create('views/entitlements_dialog.html', 'entitlementDialogCtrl', user);
        dlg.result.then(function(entitlements){
          Log.debug('Entitling user.', user);
          Userservice.updateUsers([{
            'address': user.userName
          }], [squaredFeature(entitlements.webExSquared), callFeature(entitlements.squaredCallInitiation)], function(data){
            var entitleResult = {
                msg: null,
                type: 'null'
              };
            if(data.success) {
              getUserList();
              var userStatus = data.userResponse[0].status;
              if (userStatus === 200) {
                entitleResult.msg = data.userResponse[0].email + '\'s entitlements were updated successfully.';
                entitleResult.type = 'success';
              } else if (userStatus === 404) {
                entitleResult.msg = 'Entitlements for ' + data.userResponse[0].email + ' do not exist.';
                entitleResult.type = 'error';
              } else if (userStatus === 409) {
                entitleResult.msg = 'Entitlement(s) previously updated.';
                entitleResult.type = 'error';
              } else {
                entitleResult.msg = data.userResponse[0].email + '\'s entitlements were not updated, status: ' + userStatus;
                entitleResult.type = 'error';
              }
              Notification.notify([entitleResult.msg], entitleResult.type);
            } else {
              Log.error('Failed updating user with entitlements.');
              entitleResult = {
                msg: 'Failed to update ' + data.userResponse[0].email + '\'s entitlements.',
                type: 'error'
              };
              Notification.notify([entitleResult.msg], entitleResult.type);
            }
          });
        }, function() {
          console.log('canceled');
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
