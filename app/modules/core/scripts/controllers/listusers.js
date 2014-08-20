'use strict';

/* global $ */

angular.module('Core')
  .controller('ListUsersCtrl', ['$scope', '$location', '$window', '$dialogs', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Pagination', '$rootScope', 'Notification', '$filter', 'Auth', 'Authinfo',
    function($scope, $location, $window, $dialogs, Userservice, UserListService, Log, Storage, Config, Pagination, $rootScope, Notification, $filter, Auth, Authinfo) {

      $scope.userPreview = false;
      $scope.conversationsPanel = false;
      $scope.currentUser = null;

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
      

      $scope.showConversationPanel = function(){
        $scope.conversationsPanel = true;
      };

      var usersperpage = Config.usersperpage;
      $scope.pagination = Pagination.init($scope, usersperpage);
      //Notification.init($scope);
      $scope.popup = Notification.popup;

      var getUserList = function() {
        //clear currentUser if a new search begins
        $scope.currentUser = null;
        var startIndex = $scope.pagination.page * usersperpage + 1;
        UserListService.listUsers(startIndex, usersperpage, $scope.sort.by, $scope.sort.order, function(data, status, searchStr) {
          if (data.success) {
            if ($rootScope.searchStr === searchStr) {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
              Log.debug('Returned data.', data.Resources);
              $scope.queryuserslist = data.Resources;
              $rootScope.$broadcast('PAGINATION_UPDATED');
            } else {
              Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }
        });
      };

      $scope.getUserPhoto = function(user) {
        var photo;
        if (user.photos) {
          for (var i in user.photos) {
            if (user.photos[i].type === 'thumbnail') {
              photo = user.photos[i].value;
              break;
            }
          } //end for
        } //endif
        return photo;
      };

      //Populating authinfo data if empty.
      if (Auth.isAuthorized($scope)) {
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

      $scope.getStatusIcon = function(status) {
        if (status === 'active') {
          return $filter('translate')('usersPage.active');
        } else {
          return $filter('translate')('usersPage.inactive');
        }
      };

      var currentClass;

      $scope.closePreview = function(){
        $scope.userPreview = false;
        $scope.conversationsPanel = false;
      };

      $scope.showUserDetails = function(user) {
        $scope.userPreview = true;

        //remove selected class on previous user
        if ($scope.currentUser) {
          angular.element('#' + $scope.currentUser.id).removeClass('selected');
          angular.element('#' + $scope.currentUser.id).addClass(currentClass);
        }
        $scope.currentUser = user;
        angular.element('#' + user.id).addClass('selected');
        currentClass = angular.element('#' + user.id).hasClass('odd') ? 'odd' : 'even';
        angular.element('#' + user.id).removeClass(currentClass);

        //Service profile
        $scope.entitlements = {};
        for (var i = 0; i < $rootScope.services.length; i++) {
          var service = $rootScope.services[i].sqService;
          var ciService = $rootScope.services[i].ciService;
          if (user.entitlements && user.entitlements.indexOf(ciService) > -1) {
            $scope.entitlements[service] = true;
          } else {
            $scope.entitlements[service] = false;
          }
        }

        //User profile
        $scope.photoPath = '//:0';
        $scope.orgName = Authinfo.getOrgName();
        Userservice.getUser($scope.currentUser.id, function(data, status) {
          if (data.success) {
            if (data.photos) {
              for (var i in data.photos) {
                if (data.photos[i].type === 'thumbnail') {
                  $scope.photoPath = data.photos[i].value;
                }
              } //end for
            } //endif
          } else {
            Log.debug('Get existing user failed. Status: ' + status);
          }
        });

      };

      $scope.updateUser = function() {
        angular.element('#btnSave').button('loading');
        var userData = {
          'schemas': Config.scimSchemas,
          'title': $scope.currentUser.title,
          'name': {
            'givenName': $scope.currentUser.name.givenName,
            'familyName': $scope.currentUser.name.familyName
          },
        };

        Log.debug('Updating user: ' + $scope.currentUser.id + ' with data: ');
        Log.debug(userData);

        Userservice.updateUserProfile($scope.currentUser.id, userData, function(data, status) {
          if (data.success) {
            var successMessage = [];
            successMessage.push($filter('translate')('profilePage.success'));
            Notification.notify(successMessage, 'success');
            angular.element('#btnSave').button('reset');
            $scope.user = data;
          } else {
            Log.debug('Update existing user failed. Status: ' + status);
            var errorMessage = [];
            errorMessage.push($filter('translate')('profilePage.error'));
            Notification.notify(errorMessage, 'error');
            angular.element('#btnSave').button('reset');
          }
        });
      };

      $scope.$on('PAGINATION_UPDATED', function() {
        $scope.page = $scope.pagination.page + 1;
        $('.pagination-current a').html($scope.page);
      });

      $scope.exportBtn = {
        disabled: false
      };
      $scope.exportCSV = function() {
        var promise = UserListService.exportCSV($scope);
        promise.then(null, function(error) {
          Notification.notify(Array.new(error), 'error');
        });

        return promise;
      };

      if ($rootScope.exporting === true) {
        $scope.exportBtn.disabled = true;
      }

      $scope.$on('EXPORT_FINISHED', function() {
        $scope.exportBtn.disabled = false;
      });

    }
  ]);
