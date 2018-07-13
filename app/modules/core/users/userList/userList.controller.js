require('./_user-list.scss');
var CsvDownloadService = require('modules/core/csvDownload/csvDownload.service').CsvDownloadService;
var KeyCodes = require('modules/core/accessibility').KeyCodes;

(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UserListCtrl', UserListCtrl);

  /* @ngInject */
  function UserListCtrl($q, $rootScope, $scope, $state, $timeout, $translate, Authinfo, Config, FeatureToggleService, GridService,
    Log, LogMetricsService, Notification, Orgservice, Userservice, UserListService, Utils, DirSyncService, UserOverviewService) {
    var vm = this;
    var DEFAULT_SORT = {
      by: 'name',
      order: 'ascending',
    };

    vm.$onInit = onInit;
    vm.configureGrid = configureGrid;

    $scope.$on('$destroy', onDestroy);

    //Initialize data variables
    $scope.allowLoadMoreData = false;
    $scope.page = 1;
    $scope.status = null;
    $scope.queryuserslist = [];
    $scope.gridRefresh = true;
    $scope.searchStr = '';
    $scope.timeoutVal = 1000;
    $scope.timer = 0;
    $scope.activeFilter = '';
    $scope.userList = {
      allUsers: [],
      adminUsers: [],
      partnerUsers: [],
    };
    $scope.tooManyUsers = false;
    $scope.currentUser = null;
    $scope.popup = Notification.popup;
    $scope.filterByAdmin = false;
    $scope.sort = _.cloneDeep(DEFAULT_SORT);
    initializeListFiltersAndPlaceholders();
    $scope.dirsyncEnabled = false;
    $scope.isCSB = Authinfo.isCSB();

    $scope.exportType = $rootScope.typeOfExport.USER;
    $scope.totalUsers = 0;
    $scope.obtainedTotalUserCount = false;
    $scope.isEmailStatusToggled = false;

    $scope.totalUsersExpected = Number.MAX_VALUE;
    $scope.totalAdminUsersExpected = Number.MAX_VALUE;
    $scope.obtainedPartners = false;
    $scope.obtainedOrgs = false;

    // Functions
    $scope.setFilter = setFilter;
    $scope.filterList = filterList;
    $scope.isSquaredEnabled = isSquaredEnabled;
    $scope.isHuronEnabled = isHuronEnabled;
    $scope.isOnlyAdmin = isOnlyAdmin;
    $scope.isOnlineBuyer = isOnlineBuyer;
    $scope.isProvisionAdmin = isProvisionAdmin;
    $scope.setDeactivateUser = setDeactivateUser;
    $scope.setDeactivateSelf = setDeactivateSelf;
    $scope.getUserLicenses = getUserLicenses;

    // graph appScope data and functions
    vm.userName = Authinfo.getUserName();
    vm.isHuronUser = Userservice.isHuronUser;
    vm.canShowActionsMenu = canShowActionsMenu;
    vm.keypressResendInvitation = keypressResendInvitation;
    vm.resendInvitation = resendInvitation;
    vm.canShowUserDelete = canShowUserDelete;
    vm.canShowResendInvite = canShowResendInvite;
    vm.keypressHandleDeleteUser = keypressHandleDeleteUser;
    vm.handleDeleteUser = handleDeleteUser;
    vm.firstOfType = firstOfType;
    vm.isValidThumbnail = Userservice.isValidThumbnail;
    vm.getUserPhoto = Userservice.getUserPhoto;
    vm.getImageAria = getImageAria;
    vm.showUserDetails = showUserDetails;
    vm.selectRow = selectRow;

    $scope.getUserList = getUserList;
    $scope.onManageUsers = onManageUsers;
    $scope.sortDirection = sortDirection;
    $scope.deselectRow = deselectRow;

    var eventListeners = [];

    function initializeListFiltersAndPlaceholders() {
      $scope.placeholder = {
        name: $translate.instant('common.all'),
        filterValue: '',
        count: 0,
      };
      $scope.filters = [{
        name: $translate.instant('usersPage.administrators'),
        filterValue: 'administrators',
        count: 0,
      }, {
        name: $translate.instant('usersPage.partners'),
        filterValue: 'partners',
        count: 0,
      }];

      if (Authinfo.isProvisionAdmin()) {
        $scope.placeholder = {};
        $scope.filters = _.reject($scope.filters, { filterValue: 'administrators' });
      }
    }

    ////////////////

    function onInit() {
      var promises = {
        atlasEmailStatus: FeatureToggleService.atlasEmailStatusGetStatus(),
        configureGrid: vm.configureGrid(),
      };

      $q.all(promises).then(function (results) {
        $scope.isEmailStatusToggled = results.atlasEmailStatus;

        bind();
        getUserList();
      });

      if ($state.params.preSelectedUserId) {
        UserOverviewService.getUser($state.params.preSelectedUserId)
          .then(function (response) {
            if (response && response.user) {
              $scope.currentUser = response.user;
              showUserDetails(response.user);
            }
          });
      }
    }

    function onDestroy() {
      while (!_.isEmpty(eventListeners)) {
        _.attempt(eventListeners.pop());
      }
    }

    function bind() {
      $timeout(function () {
        if ($state.params.showAddUsers === 'add') {
          $state.go('users.add.manual');
        }
      }, 0);

      // list users when we have authinfo data back, or new users have been added/activated
      $scope.$on('AuthinfoUpdated', function () {
        getUserList();
      });

      // list is updated by adding or entitling a user
      $scope.$on('USER_LIST_UPDATED', function () {
        getUserList();
      });

      // if the search string changes, then reget users based on that search string
      $scope.$watch('searchStr', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          getUserList();
        }
      });
    }

    function getUserList(startAt) {
      var startIndex = startAt || 0;

      if (startIndex === 0) {
        // clear out any old user list data since we are regetting from the start
        $scope.allowLoadMoreData = false;
        $scope.userList.allUsers = [];
        $scope.userList.adminUsers = [];
        $scope.totalUsersExpected = Number.MAX_VALUE;
        $scope.totalAdminUsersExpected = Number.MAX_VALUE;
        $scope.gridApi.infiniteScroll.resetScroll();
      } else if (!isMoreDataToLoad()) {
        // no more data to load, so don't waste time
        return $q.resolve();
      }

      $scope.gridRefresh = true; // show spinning icon
      $scope.currentUser = null;
      $scope.gridApi.infiniteScroll.saveScrollPercentage();

      var promises = {
        getAdmins: getAdmins(startIndex),
        getUsers: getUsers(startIndex),
        getPartners: getPartners(),
        getOrg: getOrg(),
        getDirSyncStatus: getDirSyncStatus(),
      };

      return $q.all(promises)
        .then(function () {
          $scope.gridApi.infiniteScroll.dataLoaded();
          $scope.allowLoadMoreData = isMoreDataToLoad();
        })
        .finally(function () {
          $scope.gridRefresh = false;
        });
    }

    function loadedAllAdmins() {
      return _.size($scope.userList.adminUsers) >= $scope.totalAdminUsersExpected;
    }

    function loadedAllUsers() {
      return (_.size($scope.userList.allUsers) >= $scope.totalUsersExpected);
    }

    // returns true if there is any more data to load from the server
    function isMoreDataToLoad() {
      return (!loadedAllUsers() || !loadedAllAdmins() || !$scope.obtainedPartners || !$scope.obtainedOrgs);
    }

    function getAdmins(startIndex) {
      //get the admin users
      var deferred = $q.defer();
      if (loadedAllAdmins()) {
        // already loaded all of the users in this search
        deferred.resolve();
      } else {
        UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order, function (data, status) {
          if (data.success) {
            Log.debug('Returned data.', data.Resources);
            var adminUsers = _.get(data, 'Resources', []);
            var totalAdminUsers = _.toNumber(_.get(data, 'totalResults', 0));
            _.find($scope.filters, { filterValue: 'administrators' }).count = totalAdminUsers;
            if (startIndex === 0) {
              $scope.userList.adminUsers = adminUsers;
              $scope.totalAdminUsersExpected = totalAdminUsers;
            } else if (adminUsers.length > 0) {
              $scope.userList.adminUsers = $scope.userList.adminUsers.concat(adminUsers);
            }
            $scope.setFilter($scope.activeFilter);
            deferred.resolve();
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
            deferred.reject(data);
          }
        }, $scope.searchStr, true);
      }
      return deferred.promise;
    }

    function getUsers(startIndex) {
      var deferred = $q.defer();
      if (loadedAllUsers()) {
        // already loaded all of the users in this search
        deferred.resolve();
      } else {
        //get the users I am searching for
        UserListService.listUsers(startIndex, Config.usersperpage, $scope.sort.by, $scope.sort.order,
          function (data, status, searchStr, fullResponse) {
            $scope.tooManyUsers = false;
            if (data.success) {
              if ($scope.searchStr === searchStr) {
                Log.debug('Returning results from search=: ' + searchStr + '  current search=' + $scope.searchStr);
                Log.debug('Returned data.', data.Resources);

                var allUsers = _.get(data, 'Resources', []);
                $scope.totalUsersExpected = _.toNumber(_.get(data, 'totalResults', 0));
                $scope.placeholder.count = $scope.totalUsersExpected;

                if (startIndex === 0) {
                  $scope.userList.allUsers = allUsers;
                } else if (allUsers.length > 0) {
                  $scope.userList.allUsers = $scope.userList.allUsers.concat(allUsers);
                }

                // get email status and user status here

                // todo - why are we looping through ALL users here, and not just the new ones?
                _.forEach($scope.userList.allUsers, function (user) {
                  // user status
                  var isActiveUser = UserOverviewService.getAccountActiveStatus(user);
                  user.userStatus = isActiveUser ? 'active' : 'pending';

                  // email status
                  if (!user.active && $scope.isEmailStatusToggled) {
                    Userservice.getUsersEmailStatus(Authinfo.getOrgId(), user.id).then(function (response) {
                      var eventStatus = _.get(response, 'data.items[0].event');
                      if (eventStatus === 'rejected' || eventStatus === 'failed') {
                        user.userStatus = 'error';
                      }
                    });
                  }
                });
                $scope.setFilter($scope.activeFilter);
              } else {
                Log.debug('Ignorning result from search=: ' + searchStr + '  current search=' + $scope.searchStr);
              }
              deferred.resolve();
            } else {
              var tooManyUsers, tooManyResults;
              if (data.status === 403) {
                var errors = data.Errors;
                tooManyUsers = !!errors && _.some(errors, {
                  errorCode: '100106',
                });
                tooManyResults = !!errors && _.some(errors, {
                  errorCode: '200045',
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
                Notification.errorWithTrackingId(fullResponse, 'usersPage.tooManyResultsError');
              } else {
                Log.debug('Query existing users failed. Status: ' + status);
                Notification.errorWithTrackingId(fullResponse, 'usersPage.userListError');
              }
              deferred.reject(data);
            }

            if (!$scope.obtainedTotalUserCount) {
              if (Authinfo.isCisco()) {
                // allow Cisco org (even > 10K) to export new CSV format
                $scope.totalUsers = CsvDownloadService.USER_EXPORT_THRESHOLD;
                $scope.obtainedTotalUserCount = true;
              } else {
                UserListService.getUserCount()
                  .then(function (count) {
                    $scope.totalUsers = count;
                    $scope.obtainedTotalUserCount = true;
                  })
                  .catch(function (response) {
                    Log.debug('Failed to get User Count. Status: ' + response);
                    // can't determine number of users, so assume over threshold
                    $scope.totalUsers = CsvDownloadService.USER_EXPORT_THRESHOLD;
                    $scope.obtainedTotalUserCount = false;
                  });
              }
            }
            deferred.resolve();
          }, $scope.searchStr);
      }
      return deferred.promise;
    }

    function getPartners() {
      var deferred = $q.defer();
      if ($scope.obtainedPartners) {
        deferred.resolve();
      } else {
        UserListService.listPartners(Authinfo.getOrgId(), function (data, status) {
          if (data.success) {
            Log.debug('Returned data.', data.partners);
            var partnerUsers = _.get(data, 'partners', []);
            _.find($scope.filters, { filterValue: 'partners' }).count = partnerUsers.length;
            // partner list does not have pagination or startIndex
            $scope.userList.partnerUsers = partnerUsers;
            $scope.setFilter($scope.activeFilter);
            $scope.obtainedPartners = true;
            deferred.resolve();
          } else {
            Log.debug('Query existing users failed. Status: ' + status);
            deferred.reject(data);
          }
        });
      }
      return deferred.promise;
    }

    function getOrg() {
      return $q(function (resolve, reject) {
        if ($scope.obtainedOrgs) {
          resolve();
        } else {
          Orgservice.getOrg(function (data, status) {
            if (data.success) {
              $scope.org = data;
              $scope.obtainedOrgs = true;
              resolve();
            } else {
              Log.debug('Get existing org failed. Status: ' + status);
              reject(data);
            }
          }, null, { showDirsyncAttributes: true });
        }
      });
    }

    function getDirSyncStatus() {
      var dirSyncPromise = (DirSyncService.requiresRefresh() ? DirSyncService.refreshStatus() : $q.resolve());
      return dirSyncPromise
        .finally(function () {
          $scope.dirsyncEnabled = DirSyncService.isDirSyncEnabled();
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

    function canShowActionsMenu(user) {
      return (user.userStatus === 'pending' || !$scope.dirsyncEnabled) &&
        (vm.canShowResendInvite(user) || vm.canShowUserDelete(user));
    }

    function canShowUserDelete(user) {
      if (!$scope.getUserLicenses(user)) {
        return false;
      }

      if ($scope.dirsyncEnabled) {
        return false;
      }

      return !$scope.isOnlyAdmin(user) && !_.includes($scope.userList.partnerUsers, user) &&
        !$scope.isOnlineBuyer(user);
    }

    function keypressHandleDeleteUser($event, user, isSelf) {
      if ($event.keyCode === KeyCodes.ENTER || $event.keyCode === KeyCodes.SPACE) {
        vm.handleDeleteUser($event, user, isSelf);
      } else {
        $event.stopPropagation();
      }
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
      // restrict filter to partner admin users for provisioning admins
      if (Authinfo.isProvisionAdmin()) {
        $scope.activeFilter = 'partners';
        $scope.gridOptions.data = $scope.userList.partnerUsers;
        return;
      }

      $scope.activeFilter = filter || 'all';
      if (filter === 'administrators') {
        $scope.gridOptions.data = $scope.userList.adminUsers;
      } else if (filter === 'partners') {
        $scope.gridOptions.data = $scope.userList.partnerUsers;
      } else {
        $scope.gridOptions.data = $scope.userList.allUsers;
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

    // cannot delete an online buyer
    function isOnlineBuyer(user) {
      return Authinfo.isOnline() && _.eq(user.userName, Authinfo.getCustomerAdminEmail());
    }

    function isProvisionAdmin() {
      return Authinfo.isProvisionAdmin();
    }

    function canShowResendInvite(user) {
      if ($scope.isCSB || $scope.dirsyncEnabled) {
        return false;
      } else {
        var isHuronUser = Userservice.isHuronUser(user.entitlements);
        return (user.userStatus === 'pending' || user.userStatus === 'error' || isHuronUser);
      }
    }

    function keypressResendInvitation($event, userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {
      if ($event.keyCode === KeyCodes.ENTER || $event.keyCode === KeyCodes.SPACE) {
        vm.resendInvitation($event, userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements);
      } else {
        $event.stopPropagation();
      }
    }

    function resendInvitation($event, userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {
      $event.stopPropagation();
      Userservice.resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements)
        .then(function () {
          Notification.success('usersPage.emailSuccess');
        })
        .catch(function (error) {
          Notification.errorResponse(error, 'usersPage.emailError');
        });
      angular.element('.open').removeClass('open');
    }

    function setDeactivateUser(deleteUserOrgId, deleteUserUuId, deleteUsername) {
      $state.go('users.delete', {
        deleteUserOrgId: deleteUserOrgId,
        deleteUserUuId: deleteUserUuId,
        deleteUsername: deleteUsername,
      });
    }

    function setDeactivateSelf(deleteUserOrgId, deleteUserUuId, deleteUsername) {
      $state.go('users.deleteSelf', {
        deleteUserOrgId: deleteUserOrgId,
        deleteUserUuId: deleteUserUuId,
        deleteUsername: deleteUsername,
      });
    }

    function configureGrid() {
      var deferred = $q.defer();

      var columnDefs = [{
        field: 'photos',
        displayName: '',
        enableSorting: false,
        cellTemplate: require('./templates/photoCell.tpl.html'),
        headerCellTemplate: '<div class="ui-grid-cell-contents" aria-label="{{:: \'usersPage.userImage\' | translate}}" tabindex="0"></div>',
        width: 70,
      }, {
        field: 'name.givenName',
        id: 'name',
        displayName: $translate.instant('usersPage.firstnameHeader'),
        cellTemplate: '<cs-grid-cell row="row" grid="grid" title="{{row.entity.name.givenName}}" cell-click-function="grid.appScope.showUserDetails(row.entity)" cell-value="row.entity.name.givenName"></cs-grid-cell>',
      }, {
        field: 'name.familyName',
        id: 'familyName',
        displayName: $translate.instant('usersPage.lastnameHeader'),
        cellTemplate: '<cs-grid-cell row="row" grid="grid" title="{{row.entity.name.familyName}}" cell-click-function="grid.appScope.showUserDetails(row.entity)" cell-value="row.entity.name.familyName"></cs-grid-cell>',
      }, {
        field: 'displayName',
        id: 'displayName',
        displayName: $translate.instant('usersPage.displayNameHeader'),
        cellTemplate: '<cs-grid-cell row="row" grid="grid" title="{{row.entity.displayName}}" cell-click-function="grid.appScope.showUserDetails(row.entity)" cell-value="row.entity.displayName"></cs-grid-cell>',
      }, {
        field: 'userName',
        id: 'userName',
        displayName: $translate.instant('usersPage.emailHeader'),
        cellTemplate: '<cs-grid-cell row="row" grid="grid" title="{{row.entity.userName}}" cell-click-function="grid.appScope.showUserDetails(row.entity)" cell-value="row.entity.userName"></cs-grid-cell>',
      }, {
        field: 'userStatus',
        id: 'userStatus',
        cellFilter: 'userListFilter',
        displayName: $translate.instant('usersPage.status'),
        cellTemplate: require('./templates/status.tpl.html'),
      }, {
        field: 'action',
        enableSorting: false,
        displayName: $translate.instant('usersPage.actionHeader'),
        cellTemplate: require('./templates/actions.tpl.html'),
      }];

      function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;

        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          // only load more data if we are allowed to
          if ($scope.allowLoadMoreData) {
            getUserList(_.size($scope.userList.allUsers) + 1);
          } else {
            $scope.allowLoadMoreData = isMoreDataToLoad();
          }
        });

        gridApi.core.on.sortChanged($scope, sortDirection);
        deferred.resolve();
      }

      $scope.gridOptions = {
        appScopeProvider: vm,
        rowHeight: 45,
        infiniteScrollDown: true,
        onRegisterApi: onRegisterApi,
        columnDefs: columnDefs,
      };

      return deferred.promise;
    }

    function deselectRow() {
      $scope.currentUser = null;
    }

    function getImageAria(user) {
      return user.displayName + ' ' + $translate.instant('usersPage.userImage');
    }

    function selectRow(grid, row) {
      GridService.selectRow(grid, row);
      vm.showUserDetails(row.entity);
    }

    function showUserDetails(user) {
      //Service profile
      $scope.entitlements = Utils.getSqEntitlements(user);
      $scope.currentUser = user;
      $scope.roles = user.roles;
      $scope.queryuserslist = $scope.gridOptions.data;
      $state.go('user-overview', {
        queryuserslist: $scope.queryuserslist,
        currentUserId: $scope.currentUser.id,
        orgInfo: $scope.org,
      });
    }

    // necessary because chrome and firefox prioritize :last-of-type, :first-of-type, and :only-of-type differently when applying css
    // should mark the first 2 users as 'first' to prevent the menu from disappearing under the grid titles
    function firstOfType(row) {
      return _.eq(_.get(row, 'entity.id'), _.get($scope.gridOptions.data, '[0].id')) || _.eq(_.get(row, 'entity.id'), _.get($scope.gridOptions.data, '[1].id'));
    }

    function sortDirection(scope, sortColumns) {
      if (isMoreDataToLoad()) {
        // sortColumns[0] will only be defined if a column is using asc/dsc sorting
        // when sortColumns[0] is undefined, the default sort should be the same as the initial call made on page loading
        if (_.isUndefined(_.get(sortColumns, '[0]'))) {
          $scope.sort = _.cloneDeep(DEFAULT_SORT);
        } else {
          var sortBy = sortColumns[0].colDef.id;
          var sortOrder = sortColumns[0].sort.direction === 'asc' ? 'ascending' : 'descending';
          if ($scope.sort.by !== sortBy || $scope.sort.order !== sortOrder) {
            $scope.sort.by = sortBy;
            $scope.sort.order = sortOrder.toLowerCase();
          }
        }

        getUserList();
      }
    }

    function onManageUsers() {
      $state.go('users.manage.org');
    }

    // TODO: If using states should be be able to trigger this log elsewhere?
    if ($state.current.name === 'users.list') {
      LogMetricsService.logMetrics('In users list page', LogMetricsService.getEventType('customerUsersListPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
    }
  }
})();
