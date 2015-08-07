'use strict';
/* global $ */

angular.module('Core')
  .controller('ListUsersCtrl', ['$scope', '$rootScope', '$state', '$location', '$dialogs', '$timeout', '$translate', 'Userservice', 'UserListService', 'Log', 'Storage', 'Config', 'Notification', 'Orgservice', 'Authinfo', 'LogMetricsService', 'Utils', 'HuronUser',
    function ($scope, $rootScope, $state, $location, $dialogs, $timeout, $translate, Userservice, UserListService, Log, Storage, Config, Notification, Orgservice, Authinfo, LogMetricsService, Utils, HuronUser) {

      //Initialize variables
      $scope.load = true;
      $scope.page = 1;
      $scope.status = null;
      $scope.currentDataPosition = 0;
      $scope.queryuserslist = [];
      $scope.gridRefresh = true;
      $scope.searchStr = '';
      $scope.timeoutVal = 1000;
      $scope.timer = 0;

      $scope.activeFilter = '';

      $scope.userList = {
        allUsers: [],
        adminUsers: [],
        partnerUsers: []
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
        if ((filter === '') || (filter === 'all')) {
          $scope.gridData = $scope.userList.allUsers;
        } else if (filter === 'administrators') {
          $scope.gridData = $scope.userList.adminUsers;
          $scope.searchStr = 'administrators';
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

        //get the admin users
        UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order, function (data, status, searchStr) {
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            Log.debug('Returned data.', data.Resources);
            $scope.filters[0].count = data.totalResults;
            if (startIndex === 0) {
              $scope.userList.adminUsers = data.Resources;
            } else {
              $scope.userList.adminUsers = $scope.userList.adminUsers.concat(data.Resources);
            }
            $scope.setFilter($scope.activeFilter);
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
          }
        }, $scope.searchStr, true);

        //get the users I am searching for
        UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order, function (data, status, searchStr) {
          $scope.gridRefresh = false;
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            if ($scope.searchStr === searchStr) {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $scope.searchStr);
              Log.debug('Returned data.', data.Resources);
              // data.resources = getUserStatus(data.Resources);

              $scope.placeholder.count = data.totalResults;
              if (startIndex === 0) {
                $scope.userList.allUsers = data.Resources;
              } else {
                $scope.userList.allUsers = $scope.userList.allUsers.concat(data.Resources);
              }

              $scope.setFilter($scope.activeFilter);

            } else {
              Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $scope.searchStr);
            }
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
            Notification.notify([$translate.instant('usersPage.userListError')], 'error');
          }
        }, $scope.searchStr);

        UserListService.listPartners(Authinfo.getOrgId(), function (data, status, searchStr) {
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            Log.debug('Returned data.', data.Resources);
            // data.resources = getUserStatus(data.Resources);
            $scope.filters[1].count = data.partners.length;
            if (startIndex === 0) {
              $scope.userList.partnerUsers = data.partners;
            } else {
              $scope.userList.partnerUsers = $scope.userList.partnerUsers.concat(data.Resources);
            }
            $scope.setFilter($scope.activeFilter);
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

      $scope.resendInvitation = function (userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {

        if (userStatus === 'pending') {
          sendSparkWelcomeEmail(userEmail, userName);
        } else if ($scope.isHuronUser(entitlements) && !dirsyncEnabled) {
          HuronUser.sendWelcomeEmail(userEmail, userName, uuid, Authinfo.getOrgId(), false)
            .then(function () {
              Notification.notify([$translate.instant('usersPage.emailSuccess')], 'success');
            }, function (error) {
              Notification.errorResponse(error, 'usersPage.emailError');
            });
        }

        angular.element('.open').removeClass('open');

      };

      var sendSparkWelcomeEmail = function (userEmail, userName) {
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

      };

      $scope.setDeactivateUser = function (deleteUserOrgId, deleteUserUuId, deleteUsername) {
        $state.go('users.delete', {
          deleteUserOrgId: deleteUserOrgId,
          deleteUserUuId: deleteUserUuId,
          deleteUsername: deleteUsername
        });
      };

      $scope.setDeactivateSelf = function (deleteUserOrgId, deleteUserUuId, deleteUsername) {
        $state.go('users.deleteSelf', {
          deleteUserOrgId: deleteUserOrgId,
          deleteUserUuId: deleteUserUuId,
          deleteUsername: deleteUsername
        });
      };

      $scope.userName = Authinfo.getUserName();
      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showUserDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var photoCellTemplate = '<img ng-if="row.entity.photos" class="user-img" ng-src="{{getUserPhoto(row.entity)}}"/>' +
        '<span ng-if="!row.entity.photos" class="user-img">' +
        '<i class="icon icon-user"></i>' +
        '</span>';

      var actionsTemplate = '<span dropdown ng-if="row.entity.userStatus === \'pending\' || !org.dirsyncEnabled">' +
        '<button id="actionsButton" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul class="dropdown-menu dropdown-primary" role="menu">' +
        '<li ng-if="row.entity.userStatus === \'pending\' || isHuronUser(row.entity.entitlements)" id="resendInviteOption"><a ng-click="$event.stopPropagation(); resendInvitation(row.entity.userName, row.entity.name.givenName, row.entity.id, row.entity.userStatus, org.dirsyncEnabled, row.entity.entitlements); "><span translate="usersPage.resend"></span></a></li>' +
        '<li ng-if="!org.dirsyncEnabled && row.entity.displayName !== userName" id="deleteUserOption"><a data-toggle="modal" ng-click="$event.stopPropagation(); setDeactivateUser(row.entity.meta.organizationID, row.entity.id, row.entity.userName); "><span translate="usersPage.deleteUser"></span></a></li>' +
        '<li ng-if="!org.dirsyncEnabled && row.entity.displayName === userName" id="deleteUserOption"><a data-toggle="modal" ng-click="$event.stopPropagation(); setDeactivateSelf(row.entity.meta.organizationID, row.entity.id, row.entity.userName); "><span translate="usersPage.deleteUser"></span></a></li>' +
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
        $scope.entitlements = Utils.getSqEntitlements(user);
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

      //list users when we have authinfo data back, or new users have been added/activated
      $scope.$on('AuthinfoUpdated', function () {
        getUserList();
      });

      //list is updated by adding or entitling a user
      $scope.$on('USER_LIST_UPDATED', function () {
        getUserList();
      });

      $scope.placeholder = {
        name: $translate.instant('usersPage.all'),
        filterValue: '',
        count: 0
      };
      // Users Grid Filters
      $scope.filters = [{
        name: $translate.instant('usersPage.administrators'),
        filterValue: 'administrators',
        count: 0
      }, {
        name: $translate.instant('usersPage.partners'),
        filterValue: 'partners',
        count: 0
      }];

      // On click, filter user list and set active filter
      $scope.filterList = function (str) {
        if ($scope.timer) {
          $timeout.cancel($scope.timer);
          $scope.timer = 0;
        }

        $scope.timer = $timeout(function () {

          //CI requires search strings to be at least three characters
          if (str.length >= 3 || str === '') {
            $scope.searchStr = str;
            getUserList();
          }
        }, $scope.timeoutVal);

      };

      if ($state.current.name === "users.list") {
        LogMetricsService.logMetrics('In users list page', LogMetricsService.getEventType('customerUsersListPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
      }
    }
  ]);
