'use strict';
/* global $ */

angular.module('Core')
  .controller('ListUsersCtrl', ['$scope', '$rootScope', '$state', '$location', '$dialogs', '$timeout', '$filter', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Notification',
    function ($scope, $rootScope, $state, $location, $dialogs, $timeout, $filter, Userservice, UserListService, Log, Storage, Config, Notification) {

      //Initialize variables
      $scope.load = true;
      $scope.page = 1;
      $scope.status = null;
      $scope.currentDataPosition = 0;
      $scope.queryuserslist = [];
      $scope.totalResults = 0;
      $scope.currentUser = null;
      $scope.popup = Notification.popup;

      $scope.userPreviewActive = false;
      $scope.userDetailsActive = false;

      var init = function () {
        if ($state.params.showAddUsers === 'add') {
          $scope.setupTokenfield();
          $('#addUsersDialog').modal('show');
        }
      };
      $timeout(init, 0);

      $scope.sort = {
        by: 'name',
        order: 'ascending'
      };

      Notification.init($scope);
      $scope.popup = Notification.popup;

      $scope.isSquaredEnabled = function () {
        return isEntitled(Config.entitlements.squared);
      };

      $scope.isHuronEnabled = function () {
        return isEntitled(Config.entitlements.huron);
      };

      var isEntitled = function (ent) {
        if ($scope.currentUser && $scope.currentUser.entitlements) {
          for (var i = 0; i < $scope.currentUser.entitlements.length; i++) {
            var svc = $scope.currentUser.entitlements[i];
            if (svc === ent) {
              return true;
            }
          }
        }
        return false;
      };

      var getUserList = function (startAt) {
        //clear currentUser if a new search begins
        $scope.currentUser = null;
        var startIndex = startAt || 0;
        UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order, function (data, status, searchStr) {
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            if ($rootScope.searchStr === searchStr) {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
              Log.debug('Returned data.', data.Resources);
              $scope.totalResults = data.totalResults;
              if (startIndex === 0) {
                $scope.queryuserslist = data.Resources;
              } else {
                $scope.queryuserslist = $scope.queryuserslist.concat(data.Resources);
              }
            } else {
              Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }
        });
      };

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showUserDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var photoCellTemplate = '<img ng-if="row.entity.photos" class="user-img" ng-src="{{getUserPhoto(row.entity)}}"/>' +
        '<span ng-if="!row.entity.photos" class="user-img">' +
        '<i class="icon icon-user"></i>' +
        '</span>';

      var actionsTemplate = '<span dropdown>' +
        '<button class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li><a href="#">Action</a></li>' +
        '<li><a href="#">Another action</a></li>' +
        '<li><a href="#">Something else here</a></li>' +
        '<li class="divider"></li>' +
        '<li><a href="#">Separated link</a></li>' +
        '</ul>' +
        '</span>';

      $scope.gridOptions = {
        data: 'queryuserslist',
        multiSelect: false,
        showFilter: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: true,

        columnDefs: [{
          field: 'photos',
          displayName: '',
          sortable: false,
          cellTemplate: photoCellTemplate,
          width: 70
        }, {
          field: 'name.givenName',
          displayName: $filter('translate')('usersPage.firstnameHeader')
        }, {
          field: 'name.familyName',
          displayName: $filter('translate')('usersPage.lastnameHeader')
        }, {
          field: 'userName',
          displayName: $filter('translate')('usersPage.emailHeader')
        }, {
          field: 'action',
          displayName: $filter('translate')('usersPage.actionHeader'),
          sortable: false,
          cellTemplate: actionsTemplate
        }]
      };

      $scope.$on('ngGridEventScroll', function () {
        var ngGridView = $scope.gridOptions.ngGrid.$viewport[0];
        var scrollTop = ngGridView.scrollTop;
        var scrollOffsetHeight = ngGridView.offsetHeight;
        var currentScroll = scrollTop + scrollOffsetHeight;
        var scrollHeight = ngGridView.scrollHeight;

        if ($scope.load) {
          $scope.currentDataPosition++;
          console.log($scope.currentDataPosition * Config.usersperpage + 1);
          $scope.load = false;
          getUserList($scope.currentDataPosition * Config.usersperpage + 1);
          console.log('Scrolled .. ');
        }
      });

      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('users.list.preview.*')) {
          $scope.userPreviewActive = true;
          $scope.userDetailsActive = true;
        } else if ($state.includes('users.list.preview')) {
          $scope.userPreviewActive = true;
          $scope.userDetailsActive = false;
        } else {
          $scope.userPreviewActive = false;
          $scope.userDetailsActive = false;
        }
      });

      // this event fires 3x when sorting is done, so watch for sortInfo change
      $scope.$on('ngGridEventSorted', function (event, sortInfo) {
        $scope.sortInfo = sortInfo;
      });

      $scope.$watch('sortInfo', function (newValue, oldValue) {
        // if newValue === oldValue then page is initializing, so ignore event,
        // otherwise getUserList() is called multiple times.
        if (newValue !== oldValue) {
          if ($scope.sortInfo) {
            switch ($scope.sortInfo.fields[0]) {
            case 'userName':
              $scope.sort.by = 'userName';
              break;
            case 'name.familyName':
            case 'name.givenName':
              $scope.sort.by = 'name';
              break;
            }

            if ($scope.sortInfo.directions[0] === 'asc') {
              $scope.sort.order = 'ascending';
            } else {
              $scope.sort.order = 'descending';
            }
          }
          getUserList();
        }
      }, true);

      $scope.showUserDetails = function (user) {
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
        $scope.currentUser = user;
        $state.go('users.list.preview');
      };

      $scope.getUserPhoto = function (user) {
        if (user && user.photos) {
          for (var i in user.photos) {
            if (user.photos[i].type === 'thumbnail') {
              $scope.currentUserPhoto = user.photos[i].value;
              break;
            }
          } //end for
        } //endif
        else {
          $scope.currentUserPhoto = null;
        }
        return $scope.currentUserPhoto;
      };

      getUserList();

      //Search users based on search criteria
      $scope.$on('SEARCH_ITEM', function (e, str) {
        Log.debug('got broadcast for search:' + str);
        getUserList();
      });

      //list users when we have authinfo data back, or new users have been added/activated
      $scope.$on('AuthinfoUpdated', function () {
        getUserList();
      });

      //list is updated by adding or entitling a user
      $scope.$on('USER_LIST_UPDATED', function () {
        getUserList();
      });

      $scope.updateUser = function () {
        angular.element('#btn-save').button('loading');
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

        Userservice.updateUserProfile($scope.currentUser.id, userData, function (data, status) {
          if (data.success) {
            var successMessage = [];
            successMessage.push($filter('translate')('profilePage.success'));
            Notification.notify(successMessage, 'success');
            angular.element('#btn-save').button('reset');
            $scope.user = data;
          } else {
            Log.debug('Update existing user failed. Status: ' + status);
            var errorMessage = [];
            errorMessage.push($filter('translate')('profilePage.error'));
            Notification.notify(errorMessage, 'error');
            angular.element('#btn-save').button('reset');
          }
        });
      };

      // TODO: reevalute this logic and remove is not needed.
      if ($rootScope.selectedSubTab === 'invite') {
        $scope.inviteTabActive = true;
      } else {
        $scope.userTabActive = true;
      }

      var setTab = function (tab) {
        if (tab === 'invite') {
          $scope.userTabActive = false;
          $scope.inviteTabActive = true;
        } else {
          $scope.userTabActive = true;
          $scope.inviteTabActive = false;
        }
        $rootScope.selectedSubTab = null;
      };

      $scope.changeTab = function (tab) {
        setTab(tab);
      };
      // end TODO

    }
  ]);
