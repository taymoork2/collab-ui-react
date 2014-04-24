'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('ListUsersCtrl', ['$scope', '$location', '$window', '$dialogs', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Authinfo', 'Auth', 'Pagination', '$rootScope',
    function($scope, $location, $window, $dialogs, Userservice, UserListService, Log, Storage, Config, Authinfo, Auth, Pagination, $rootScope) {

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

      var usersperpage = Config.usersperpage;
      $scope.pagination = Pagination.init($scope, usersperpage);

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

      //Search users based on search criteria
      $scope.$on('SEARCH_ITEM', function(e, str) {
        Log.debug('got broadcast for search:' + str);
        $scope.pagination.page = 0;
        getUserList();
      });

      //list users when we have authinfo data back, or new users have been added/activated
      $scope.$on('AuthinfoUpdated', function() {
        getUserList();
      });

      //list is updated by adding or entitling a user
      $scope.$on('USER_LIST_UPDATED', function() {
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
            if(data.success) {
              getUserList();
              var userStatus = data.userResponse[0].status;
              $scope.entitleResult = {
                msg: null,
                type: 'null'
              };
              if (userStatus === 200) {
                $scope.entitleResult.msg = data.userResponse[0].email + '\'s entitlements were updated successfully.';
                $scope.entitleResult.type = 'success';
              } else if (userStatus === 404) {
                $scope.entitleResult.msg = 'Entitlements for ' + data.userResponse[0].email + ' do not exist.';
                $scope.entitleResult.type = 'danger';
              } else if (userStatus === 409) {
                $scope.entitleResult.msg = 'Entitlement(s) previously updated.';
                $scope.entitleResult.type = 'danger';
              } else {
                $scope.entitleResult.msg = data.userResponse[0].email + '\'s entitlements were not updated, status: ' + userStatus;
                $scope.entitleResult.type = 'danger';
              }
            } else {
              Log.error('Failed updating user with entitlements.');
              $scope.entitleResult = {
                msg: 'Failed to update ' + data.userResponse[0].email + '\'s entitlements.',
                type: 'danger'
              };
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

    }
  ]);
