(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserListCtrl', UserListCtrl);

  /* @ngInject */
  function UserListCtrl($location, $q, $rootScope, $scope, $state, $templateCache, $timeout, $translate, Authinfo, Config, FeatureToggleService, HuronUser, Log, LogMetricsService, Notification, Orgservice, Storage, Userservice, UserListService, Utils) {
    //Initialize data variables
    $scope.pageTitle = $translate.instant('usersPage.pageTitle');
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
    $scope.tooManyUsers = false;
    $scope.currentUser = null;
    $scope.popup = Notification.popup;
    $scope.filterByAdmin = false;
    $scope.userPreviewActive = false;
    $scope.userDetailsActive = false;
    $scope.sort = {
      by: 'name',
      order: 'ascending'
    };
    $scope.userName = Authinfo.getUserName();
    $scope.placeholder = {
      name: $translate.instant('usersPage.all'),
      filterValue: '',
      count: 0
    };
    $scope.filters = [{
      name: $translate.instant('usersPage.administrators'),
      filterValue: 'administrators',
      count: 0
    }, {
      name: $translate.instant('usersPage.partners'),
      filterValue: 'partners',
      count: 0
    }];
    $scope.dirsyncEnabled = false;
    $scope.isCSB = false;

    $scope.exportType = $rootScope.typeOfExport.USER;
    $scope.USER_EXPORT_THRESHOLD = 10000;
    $scope.totalUsers = 0;
    $scope.isCsvEnhancementToggled = false;
    $scope.obtainedTotalUserCount = false;

    // Functions
    $scope.setFilter = setFilter;
    $scope.filterList = filterList;
    $scope.isSquaredEnabled = isSquaredEnabled;
    $scope.isHuronEnabled = isHuronEnabled;
    $scope.isOnlyAdmin = isOnlyAdmin;
    $scope.resendInvitation = resendInvitation;
    $scope.setDeactivateUser = setDeactivateUser;
    $scope.setDeactivateSelf = setDeactivateSelf;
    $scope.showUserDetails = showUserDetails;
    $scope.getUserLicenses = getUserLicenses;
    $scope.canShowUserDelete = canShowUserDelete;
    $scope.handleDeleteUser = handleDeleteUser;
    $scope.getUserPhoto = getUserPhoto;
    $scope.firstOfType = firstOfType;
    $scope.isValidThumbnail = isValidThumbnail;
    $scope.startExportUserList = startExportUserList;
    $scope.isNotDirSyncOrException = false;

    $scope.getUserList = getUserList;

    $q.all([FeatureToggleService.supports(FeatureToggleService.features.csvEnhancement),
        FeatureToggleService.supports(FeatureToggleService.features.atlasTelstraCsb)
      ])
      .then(function (result) {
        $scope.isCsvEnhancementToggled = result[0];
        $scope.isCSB = Authinfo.isCSB() && result[1];
      });

    init();

    ////////////////

    function init() {
      checkOrg();
      bind();
      configureGrid();
      getUserList();
    }

    function checkOrg() {
      // Allow Cisco org to use the Circle Plus button
      // Otherwise, block the DirSync orgs from using it
      if (Authinfo.isCisco()) {
        $scope.isNotDirSyncOrException = true;
      } else {
        FeatureToggleService.supportsDirSync().then(function (enabled) {
          $scope.isNotDirSyncOrException = !enabled;
        });
      }
    }

    function bind() {
      $timeout(function () {
        if ($state.params.showAddUsers === 'add') {
          $state.go('users.add');
        }
      }, 0);

      // if the side panel is closing unselect the user
      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('users.list')) {
          $scope.currentUser = null;
          if ($scope.gridApi && $scope.gridApi.selection) {
            $scope.gridApi.selection.clearSelectedRows();
          }
        }
      });

      //list users when we have authinfo data back, or new users have been added/activated
      $scope.$on('AuthinfoUpdated', function () {
        getUserList();
      });

      //list is updated by adding or entitling a user
      $scope.$on('USER_LIST_UPDATED', function () {
        $scope.currentDataPosition = 0;
        $scope.gridApi.infiniteScroll.resetScroll();
        getUserList();
      });
    }

    function getTemplate(name) {
      return $templateCache.get('modules/core/users/userList/templates/' + name + '.html');
    }

    function getUserList(startAt) {
      var startIndex = startAt || 0;
      // show spinning icon
      $scope.gridRefresh = true;
      // clear currentUser if a new search begins
      $scope.currentUser = null;

      getAdmins(startIndex);
      getUsers(startIndex);
      getPartners();
      getOrg();
    }

    function getAdmins(startIndex) {
      //get the admin users
      UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order, function (data, status, searchStr) {
        if (data.success) {
          $timeout(function () {
            $scope.load = true;
          });
          Log.debug('Returned data.', data.Resources);
          var adminUsers = _.get(data, 'Resources', []);
          $scope.filters[0].count = _.get(data, 'totalResults', 0);
          if (startIndex === 0) {
            $scope.userList.adminUsers = adminUsers;
          } else {
            $scope.userList.adminUsers = $scope.userList.adminUsers.concat(adminUsers);
          }
          $scope.setFilter($scope.activeFilter);
        } else {
          Log.debug('Query existing users failed. Status: ' + status);
        }
      }, $scope.searchStr, true);
    }

    function getUsers(startIndex) {
      //get the users I am searching for
      UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order,
        function (data, status, searchStr) {
          $scope.gridRefresh = false;
          $scope.tooManyUsers = false;
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            if ($scope.searchStr === searchStr) {
              Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $scope.searchStr);
              Log.debug('Returned data.', data.Resources);

              var allUsers = _.get(data, 'Resources', []);
              var allUsersCount = _.get(data, 'totalResults', 0);
              $scope.placeholder.count = allUsersCount;
              if ($scope.searchStr === '') {
                $scope.totalUsers = allUsersCount;
                $scope.obtainedTotalUserCount = true;
              }
              if (startIndex === 0) {
                $scope.userList.allUsers = allUsers;
              } else {
                $scope.userList.allUsers = $scope.userList.allUsers.concat(allUsers);
              }

              $scope.setFilter($scope.activeFilter);

            } else {
              Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $scope.searchStr);
            }
          } else {
            var tooManyUsers, tooManyResults;
            if (data.status === 403) {
              var errors = data.Errors;
              tooManyUsers = !!errors && _.some(errors, {
                'errorCode': '100106'
              });
              tooManyResults = !!errors && _.some(errors, {
                'errorCode': '200045'
              });
            }

            if (tooManyUsers) {
              // clear out the current grid results
              $scope.placeholder.count = 0;
              $scope.userList.allUsers = [];
              $scope.setFilter($scope.activeFilter);
              // display search message
              $scope.tooManyUsers = tooManyUsers;
            } else if (tooManyResults) {
              Log.debug('Query existing users yielded too many search results. Status: ' + status);
              Notification.notify([$translate.instant('usersPage.tooManyResultsError')], 'error');
            } else {
              Log.debug('Query existing users failed. Status: ' + status);
              Notification.notify([$translate.instant('usersPage.userListError')], 'error');
            }
          }

          if (!$scope.obtainedTotalUserCount) {
            if (Authinfo.isCisco()) { // allow Cisco org (even > 10K) to export new CSV format
              $scope.totalUsers = $scope.USER_EXPORT_THRESHOLD;
              $scope.obtainedTotalUserCount = true;
            } else {
              UserListService.getUserCount().then(function (count) {
                if (_.isNull(count) || _.isNaN(count) || count === -1) {
                  count = $scope.USER_EXPORT_THRESHOLD + 1;
                }
                $scope.totalUsers = count;
                $scope.obtainedTotalUserCount = true;
              });
            }
          }
        }, $scope.searchStr);
    }

    function getPartners() {
      UserListService.listPartners(Authinfo.getOrgId(), function (data, status, searchStr) {
        if (data.success) {
          $timeout(function () {
            $scope.load = true;
          });
          Log.debug('Returned data.', data.partners);
          var partnerUsers = _.get(data, 'partners', []);
          $scope.filters[1].count = partnerUsers.length;
          // partner list does not have pagination or startIndex
          $scope.userList.partnerUsers = partnerUsers;
          $scope.setFilter($scope.activeFilter);
        } else {
          Log.debug('Query existing users failed. Status: ' + status);
        }
      });
    }

    function getOrg() {
      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          $scope.org = data;
          $scope.dirsyncEnabled = data.dirsyncEnabled;
        } else {
          Log.debug('Get existing org failed. Status: ' + status);
        }
      });
    }

    function getUserLicenses(user) {
      if ($scope.isCSB && _.isUndefined(user.licenseID)) {
        return true;
      } else if ($scope.isCSB && user.licenseID) {
        return false;
      }
      return true;
    }

    function canShowUserDelete(user) {
      if (!$scope.getUserLicenses(user)) {
        return false;
      }

      return !$scope.isOnlyAdmin(user);
    }

    function handleDeleteUser($event, user, isSelf) {
      $event.stopPropagation();
      if (isSelf) {
        setDeactivateSelf(user.meta.organizationID, user.id, user.userName);
      } else {
        setDeactivateUser(user.meta.organizationID, user.id, user.userName);
      }
    }

    function setFilter(filter) {
      $scope.activeFilter = filter || 'all';
      if (filter === 'administrators') {
        $scope.gridData = $scope.userList.adminUsers;
      } else if (filter === 'partners') {
        $scope.gridData = $scope.userList.partnerUsers;
      } else {
        $scope.gridData = $scope.userList.allUsers;
      }
    }

    // On click, filter user list and set active filter
    function filterList(str) {
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
    }

    function isSquaredEnabled() {
      return isEntitled(Config.entitlements.squared);
    }

    function isHuronEnabled() {
      return isEntitled(Config.entitlements.huron);
    }

    function isEntitled(ent) {
      if ($scope.currentUser && $scope.currentUser.entitlements) {
        for (var i = 0; i < $scope.currentUser.entitlements.length; i++) {
          var svc = $scope.currentUser.entitlements[i];
          if (svc === ent) {
            return true;
          }
        }
      }
      return false;
    }

    // if there is only one Admin in the org, the user should not be able to delete it
    function isOnlyAdmin(entity) {
      if ($scope.userList.adminUsers.length === 1) {
        return $scope.userList.adminUsers[0].userName === entity.userName;
      }
      return false;
    }

    function resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {
      Userservice.resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements)
        .then(function () {
          Notification.success('usersPage.emailSuccess');
        }).catch(function (error) {
          Notification.errorResponse(error, 'usersPage.emailError');
        });
      angular.element('.open').removeClass('open');
    }

    function setDeactivateUser(deleteUserOrgId, deleteUserUuId, deleteUsername) {
      $state.go('users.delete', {
        deleteUserOrgId: deleteUserOrgId,
        deleteUserUuId: deleteUserUuId,
        deleteUsername: deleteUsername
      });
    }

    function setDeactivateSelf(deleteUserOrgId, deleteUserUuId, deleteUsername) {
      $state.go('users.deleteSelf', {
        deleteUserOrgId: deleteUserOrgId,
        deleteUserUuId: deleteUserUuId,
        deleteUsername: deleteUsername
      });
    }

    function configureGrid() {

      var photoCellTemplate = '<img ng-if="grid.appScope.isValidThumbnail(row.entity)" class="user-img" ng-src="{{grid.appScope.getUserPhoto(row.entity)}}"/>' +
        '<span ng-if="!grid.appScope.isValidThumbnail(row.entity)" class="user-img">' +
        '<i class="icon icon-user"></i>' +
        '</span>';

      var actionsTemplate = '<span cs-dropdown class="actions-menu" ng-if="row.entity.userStatus === \'pending\' || !org.dirsyncEnabled">' +
        '<button cs-dropdown-toggle id="actionsButton" class="btn--none dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
        '<ul cs-dropdown-menu class="dropdown-menu dropdown-primary" role="menu" ng-class="{\'invite\': (row.entity.userStatus === \'pending\' || grid.appScope.isHuronUser(row.entity.entitlements)), \'delete\': (!org.dirsyncEnabled && (row.entity.displayName !== grid.appScope.userName || row.entity.displayName === grid.appScope.userName)), \'first\': grid.appScope.firstOfType(row)}">' +
        '<li ng-if="(row.entity.userStatus === \'pending\' || grid.appScope.isHuronUser(row.entity.entitlements)) && !grid.appScope.isCSB" id="resendInviteOption"><a ng-click="$event.stopPropagation(); grid.appScope.resendInvitation(row.entity.userName, row.entity.name.givenName, row.entity.id, row.entity.userStatus, org.dirsyncEnabled, row.entity.entitlements); "><span translate="usersPage.resend"></span></a></li>' +
        '<li ng-if="!org.dirsyncEnabled && row.entity.displayName !== grid.appScope.userName && grid.appScope.canShowUserDelete(row.entity)" id="deleteUserOption"><a data-toggle="modal" ng-click="grid.appScope.handleDeleteUser($event, row.entity, (row.entity.displayName === grid.appScope.userName))"><span translate="usersPage.deleteUser"></span></a></li>' +
        '<li ng-if="!org.dirsyncEnabled && row.entity.displayName === grid.appScope.userName && grid.appScope.canShowUserDelete(row.entity)" id="deleteUserOption"><a data-toggle="modal" ng-click="grid.appScope.handleDeleteUser($event, row.entity, (row.entity.displayName === grid.appScope.userName))"><span translate="usersPage.deleteUser"></span></a></li>' +
        '</ul>' +
        '</span>';

      $scope.gridOptions = {
        data: 'gridData',
        multiSelect: false,
        rowHeight: 45,
        enableRowHeaderSelection: false,
        enableColumnResize: true,
        enableColumnMenus: false,
        enableHorizontalScrollbar: 0,
        onRegisterApi: function (gridApi) {
          $scope.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            $scope.showUserDetails(row.entity);
          });
          gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
            if ($scope.load) {
              $scope.currentDataPosition++;
              $scope.load = false;
              getUserList($scope.currentDataPosition * Config.usersperpage + 1);
              $scope.gridApi.infiniteScroll.dataLoaded();
            }
          });
        },
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
          cellTemplate: getTemplate('status.tpl'),
          displayName: $translate.instant('usersPage.status')
        }, {
          field: 'action',
          displayName: $translate.instant('usersPage.actionHeader'),
          sortable: false,
          cellTemplate: actionsTemplate
        }]
      };
    }

    function showUserDetails(user) {
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
    }

    function getUserPhoto(user) {
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
    }

    // necessary because chrome and firefox prioritize :last-of-type, :first-of-type, and :only-of-type differently when applying css
    // should mark the first 2 users as 'first' to prevent the menu from disappearing under the grid titles
    function firstOfType(row) {
      return _.eq(_.get(row, 'entity.id'), _.get($scope.gridData, '[0].id')) || _.eq(_.get(row, 'entity.id'), _.get($scope.gridData, '[1].id'));
    }

    function isValidThumbnail(user) {
      var photos = _.get(user, 'photos', []);
      var thumbs = _.filter(photos, {
        type: 'thumbnail'
      });
      var validThumbs = _.filter(thumbs, function (thumb) {
        return !(_.startsWith(thumb.value, 'file:') || _.isEmpty(thumb.value));
      });
      return !_.isEmpty(validThumbs);
    }

    function startExportUserList() {
      if ($scope.totalUsers > $scope.USER_EXPORT_THRESHOLD) {
        $scope.$emit('csv-download-request', 'user', true);
      } else {
        $scope.$emit('csv-download-request', 'user');
      }
    }

    // TODO: If using states should be be able to trigger this log elsewhere?
    if ($state.current.name === "users.list") {
      LogMetricsService.logMetrics('In users list page', LogMetricsService.getEventType('customerUsersListPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
    }
  }
})();
