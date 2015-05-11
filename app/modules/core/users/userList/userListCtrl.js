'use strict';
/* global $ */

angular.module('Core')
  .controller('ListUsersCtrl', ['$scope', '$rootScope', '$state', '$location', '$dialogs', '$timeout', '$translate', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Notification', 'Orgservice', 'Authinfo', 'LogMetricsService',
    function ($scope, $rootScope, $state, $location, $dialogs, $timeout, $translate, Userservice, UserListService, Log, Storage, Config, Notification, Orgservice, Authinfo, LogMetricsService) {

      //Initialize variables
      $scope.load = true;
      $scope.page = 1;
      $scope.status = null;
      $scope.currentDataPosition = 0;
      $scope.queryuserslist = [];
      $scope.gridRefresh = true;

      $scope.activeFilter = 'all';

      $scope.userList = {
        allUsers: [],
        adminUsers: [],
        partnerUsers: []
      };

      $scope.filterTotals = {
        all: 0,
        admin: 0,
        partner: 0
      };
      $scope.currentUser = null;
      $scope.popup = Notification.popup;
      $scope.filterByAdmin = false;

      $scope.userPreviewActive = false;
      $scope.userDetailsActive = false;

      var init = function () {
        if ($state.params.showAddUsers === 'add') {
          $state.go('users.add');
        }
      };
      $timeout(init, 0);

      $scope.sort = {
        by: 'name',
        order: 'ascending'
      };

      $scope.isSquaredEnabled = function () {
        return isEntitled(Config.entitlements.squared);
      };

      $scope.isHuronEnabled = function () {
        return isEntitled(Config.entitlements.huron);
      };

      $scope.setFilter = function (filter) {
        $scope.activeFilter = filter;
        if (filter === 'all') {
          $scope.gridData = $scope.userList.allUsers;
        } else if (filter === 'administrators') {
          $scope.gridData = $scope.userList.adminUsers;
        } else if (filter === 'partners') {
          $scope.gridData = $scope.userList.partnerUsers;
        }
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

      $scope.isHuronUser = function (allEntitlements) {
        if (allEntitlements) {
          for (var i = 0; i < allEntitlements.length; i++) {
            if (Config.entitlements.huron === allEntitlements[i]) {
              return true;
            }
          }
        }
        return false;
      };

      // if the side panel is closing unselect the user
      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('users.list')) {
          $scope.currentUser = null;
          if ($scope.gridOptions.$gridScope) {
            $scope.gridOptions.$gridScope.toggleSelectAll(false, true);
          }
        }
      });

      var getUserList = function (startAt) {
        $scope.gridRefresh = true;
        //clear currentUser if a new search begins
        var startIndex = startAt || 0;
        $scope.currentUser = null;

        UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order, function (data, status, searchStr) {
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            if ($rootScope.searchStr === searchStr) {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
              Log.debug('Returned data.', data.Resources);
              $scope.filterTotals.admin = data.totalResults;
              if (startIndex === 0) {
                $scope.userList.adminUsers = data.Resources;
              } else {
                $scope.userList.adminUsers = $scope.userList.adminUsers.concat(data.Resources);
              }
              $scope.setFilter($scope.activeFilter);
            } else {
              Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }
        }, true);

        UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order, function (data, status, searchStr) {
          $scope.gridRefresh = false;
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            if ($rootScope.searchStr === searchStr) {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
              Log.debug('Returned data.', data.Resources);
              // data.resources = getUserStatus(data.Resources);
              $scope.filterTotals.all = data.totalResults;
              if (startIndex === 0) {
                $scope.userList.allUsers = data.Resources;
              } else {
                $scope.userList.allUsers = $scope.userList.allUsers.concat(data.Resources);
              }
              $scope.setFilter($scope.activeFilter);
            } else {
              Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
            Notification.notify([$translate.instant('usersPage.userListError')], 'error');
          }
        });

        UserListService.listPartners(Authinfo.getOrgId(), function (data, status, searchStr) {
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            if ($rootScope.searchStr === searchStr) {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
              Log.debug('Returned data.', data.Resources);
              // data.resources = getUserStatus(data.Resources);
              $scope.filterTotals.partner = data.partners.length;
              if (startIndex === 0) {
                $scope.userList.partnerUsers = data.partners;
              } else {
                $scope.userList.partnerUsers = $scope.userList.partnerUsers.concat(data.Resources);
              }
              $scope.setFilter($scope.activeFilter);
            } else {
              Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $rootScope.searchStr);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }
        });

        Orgservice.getOrg(function (data, status) {
          if (data.success) {
            $scope.org = data;
          } else {
            Log.debug('Get existing org failed. Status: ' + status);
          }
        });
      };

      $scope.resendInvitation = function (userEmail, userName) {
        var userData = [{
          'address': userEmail,
          'name': userName
        }];

        Userservice.inviteUsers(userData, null, true, function (data) {

          if (data.success) {
            Notification.notify([$translate.instant('usersPage.emailSuccess')], 'success');
          } else {
            Log.debug('Resending failed. Status: ' + status);
            Notification.notify([$translate.instant('usersPage.emailError')], 'error');
            angular.element('#btnSave').button('reset');
          }
        });

        angular.element('.open').removeClass('open');

      };

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showUserDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var photoCellTemplate = '<img ng-if="row.entity.photos" class="user-img" ng-src="{{getUserPhoto(row.entity)}}"/>' +
        '<span ng-if="!row.entity.photos" class="user-img">' +
        '<i class="icon icon-user"></i>' +
        '</span>';

      var actionsTemplate = '<span dropdown ng-if="row.entity.userStatus === \'pending\'">' +
        '<button id="actionsButton" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li ng-if="row.entity.userStatus !== \'pending\'" id="resendActivateOption"><a ng-click="$event.stopPropagation(); resendInvitation(row.entity.userName, row.entity.name.givenName); "><span translate="usersPage.resendActivation"></span></a></li>' +
        '<li ng-if="row.entity.userStatus === \'pending\'" id="resendInviteOption"><a ng-click="$event.stopPropagation(); resendInvitation(row.entity.userName, row.entity.name.givenName); "><span translate="usersPage.resend"></span></a></li>' +
        '</ul>' +
        '</span>';

      $scope.gridOptions = {
        data: 'gridData',
        multiSelect: false,
        showFilter: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: false,

        columnDefs: [{
          field: 'photos',
          displayName: '',
          sortable: false,
          cellTemplate: photoCellTemplate,
          width: 70
        }, {
          field: 'name.givenName',
          displayName: $translate.instant('usersPage.firstnameHeader'),
          sortable: true
        }, {
          field: 'name.familyName',
          displayName: $translate.instant('usersPage.lastnameHeader'),
          sortable: true
        }, {
          field: 'displayName',
          displayName: $translate.instant('usersPage.displayNameHeader'),
          sortable: true
        }, {
          field: 'userName',
          displayName: $translate.instant('usersPage.emailHeader'),
          sortable: true
        }, {
          field: 'userStatus',
          cellFilter: 'userListFilter',
          sortable: false,
          displayName: $translate.instant('usersPage.status')
        }, {
          field: 'action',
          displayName: $translate.instant('usersPage.actionHeader'),
          sortable: false,
          cellTemplate: actionsTemplate
        }]
      };

      $scope.$on('ngGridEventScroll', function () {
        if ($scope.load) {
          $scope.currentDataPosition++;
          $scope.load = false;
          getUserList($scope.currentDataPosition * Config.usersperpage + 1);
        }
      });

      // // this event fires 3x when sorting is done, so watch for sortInfo change
      // $scope.$on('ngGridEventSorted', function (event, sortInfo) {
      //   $scope.sortInfo = sortInfo;
      // });

      // $scope.$watch('sortInfo', function (newValue, oldValue) {
      //   // if newValue === oldValue then page is initializing, so ignore event,
      //   // otherwise $scope.getUserList() is called multiple times.
      //   if (newValue !== oldValue) {
      //     if ($scope.sortInfo) {
      //       switch ($scope.sortInfo.fields[0]) {
      //       case 'displayName':
      //         $scope.sort.by = 'displayName';
      //         break;
      //       case 'userName':
      //         $scope.sort.by = 'userName';
      //         break;
      //       case 'name.familyName':
      //       case 'name.givenName':
      //         $scope.sort.by = 'name';
      //         break;
      //       }

      //       if ($scope.sortInfo.directions[0] === 'asc') {
      //         $scope.sort.order = 'ascending';
      //       } else {
      //         $scope.sort.order = 'descending';
      //       }
      //     }
      //     getUserList();
      //   }
      // }, true);

      $scope.showUserDetails = function (user) {
        //Service profile
        $scope.entitlements = {};
        for (var i = $rootScope.services.length - 1; i >= 0; i--) {
          var service = $rootScope.services[i].sqService;
          var ciService = $rootScope.services[i].ciService;
          if (user.entitlements && user.entitlements.indexOf(ciService) > -1) {
            $scope.entitlements[service] = true;
            $scope.entitlements.webExSquared = true;
          } else {
            $scope.entitlements[service] = false;
          }
        }
        $scope.currentUser = user;
        $scope.roles = user.roles;
        $scope.queryuserslist = $scope.gridData;
        $state.go('user-overview', {
          currentUser: $scope.currentUser,
          entitlements: $scope.entitlements,
          queryuserslist: $scope.queryuserslist
        });
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

      $scope.$on('cal-entitlement-updated', function () {
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
            successMessage.push($translate.instant('profilePage.success'));
            Notification.notify(successMessage, 'success');
            angular.element('#btn-save').button('reset');
            $scope.user = data;
          } else {
            Log.debug('Update existing user failed. Status: ' + status);
            var errorMessage = [];
            errorMessage.push($translate.instant('profilePage.error'));
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

      // Users Grid Filters
      $scope.filters = [{
        name: 'Active',
        search: 'active',
        count: $scope.filterTotals.all
      }, {
        name: 'Invite Pending',
        search: 'pending',
        count: $scope.filterTotals.all
      }];

      // On click, filter user list and set active filter
      $scope.filterList = function (str) {
        $rootScope.searchStr = str;
        $rootScope.$broadcast('SEARCH_ITEM', str);
      };

      $scope.isSearchFocused = false;

      $scope.searchFocus = function () {
        $scope.isSearchFocused = true;
      };
      $scope.searchBlur = function () {
        $scope.isSearchFocused = false;
      };

      if ($state.current.name === "users.list") {
        LogMetricsService.logMetrics('In users list page', LogMetricsService.getEventType('customerUsersListPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1);
      }
    }
  ]);
