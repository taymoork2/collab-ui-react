'use strict';

/* global $ */

angular.module('wx2AdminWebClientApp')
  .controller('ListUsersCtrl', ['$scope', '$location', '$window', '$dialogs', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Authinfo', 'Auth', 'Pagination', '$rootScope', 'Notification', '$filter', '$q',
    function($scope, $location, $window, $dialogs, Userservice, UserListService, Log, Storage, Config, Authinfo, Auth, Pagination, $rootScope, Notification, $filter, $q) {

      function Feature(name, state) {
        this.entitlementName = name;
        this.entitlementState = state ? 'ACTIVE' : 'INACTIVE';
      }

      function getFeature(service, state) {
        return new Feature(service, state);
      }

      //Initialize variables
      $scope.page = 1;
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
      //Notification.init($scope);
      $scope.popup = Notification.popup;

      var getUserList = function() {
        var startIndex = $scope.pagination.page * usersperpage + 1;
        UserListService.listUsers(startIndex, usersperpage, $scope.sort.by, $scope.sort.order, function(data, status, searchStr) {
          if (data.success) {
            if ($rootScope.searchStr === searchStr) {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
              Log.debug('Returned data.', data.Resources);
              $scope.queryuserslist = data.Resources;
            } else {
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
        var dlg = $dialogs.create('views/entitlements_dialog.html', 'entitlementDialogCtrl', user, Authinfo.getServices());
        dlg.result.then(function(entitlements) {
          Log.debug('Entitling user.', user);
          Userservice.updateUsers([{
            'address': user.userName
          }], getUserEntitlementList(entitlements), function(data) {
            var entitleResult = {
              msg: null,
              type: 'null'
            };
            if (data.success) {
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
              Log.error(data);
              entitleResult = {
                msg: 'Failed to update ' + user.userName + '\'s entitlements.',
                type: 'error'
              };
              Notification.notify([entitleResult.msg], entitleResult.type);
            }
          });
        }, function() {
          console.log('canceled');
        });
      };

      var getUserEntitlementList = function(entitlements) {
        var entList = [];
        for (var i = 0; i< $rootScope.services.length ; i++)
        {
          var service = $rootScope.services[i].sqService;
          entList.push(getFeature(service, entitlements[service]));
        }
        return entList;
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

      $scope.getStatus = function(status) {
        if (status === 'active') {
          return $filter('translate')('usersPage.active');
        } else {
          return $filter('translate')('usersPage.inactive');
        }
      };

      $scope.showUserProfile = function(user) {
        $location.path('/userprofile/' + user.id);
      };

      $scope.$on('PAGINATION_UPDATED', function() {
        $scope.page = $scope.pagination.page + 1;
        $('.pagination-current a').html($scope.page);
      });

      $scope.exportCSV = function() {

        var deferred = $q.defer();
        var users = [];
        var page = 0;
        var exportedUsers = [];

        var getUsersBatch = function(startIndex) {
          UserListService.listUsers(startIndex, 0, 'userName', 'ascending', function(data, status) {
            if (data.success) {
              users = users.concat(data.Resources);
              console.log(users);
              console.log(users.length);
              page++;
              getUsersBatch(page * 1000 + 1);
            } else if (status===500){
              Log.debug('No more users to return. Exporting to file... ');
              $('#export-icon').html('<i class=\'fa fa-file-text\'></i>');
              //formatting the data for export
              for(var i=0; i < users.length; i++){
                var exportedUser = {};
                var entitlements = '';

                exportedUser.userName = users[i].userName;

                if(users[i].hasOwnProperty('name') && users[i].name.familyName !== '' && users[i].name.givenName !== '' ){
                  exportedUser.name = users[i].name.givenName + ' ' + users[i].name.familyName;
                } else {
                  exportedUser.name = 'N/A';
                }

                for(var entitlement in users[i].entitlements){
                  entitlements += users[i].entitlements[entitlement] + ' ';
                }

                exportedUser.entitlements = entitlements;

                exportedUsers.push(exportedUser);
              }
              console.log(exportedUsers);
              deferred.resolve(exportedUsers);
            } else {
              Log.debug('Exporting users failed. Status ' + status );
              deferred.reject(status);
            }
          }, 'webex-squared');
        };

        $('#export-icon').html('<i class=\'fa fa-refresh fa-spin\'></i>');
        getUsersBatch(1);
        return deferred.promise;
      };

    }
  ]);
