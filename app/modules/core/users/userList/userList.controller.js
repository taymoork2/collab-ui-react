 (function () {
   'use strict';

   angular
     .module('Core')
     .controller('UserListCtrl', UserListCtrl);

   /* @ngInject */
   function UserListCtrl($scope, $rootScope, $state, $templateCache, $location, $dialogs, $timeout, $translate, Userservice, UserListService, Log, Storage, Config, Notification, Orgservice, Authinfo, LogMetricsService, Utils, HuronUser) {
     //Initialize data variables
     $scope.pageTitle = $translate.instant('usersPage.manageUsers');
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

     $scope.exportType = $rootScope.typeOfExport.USER;

     // Functions
     $scope.setFilter = setFilter;
     $scope.filterList = filterList;
     $scope.isSquaredEnabled = isSquaredEnabled;
     $scope.isHuronEnabled = isHuronEnabled;
     $scope.isHuronUser = isHuronUser;
     $scope.resendInvitation = resendInvitation;
     $scope.setDeactivateUser = setDeactivateUser;
     $scope.setDeactivateSelf = setDeactivateSelf;
     $scope.showUserDetails = showUserDetails;
     $scope.getUserPhoto = getUserPhoto;

     init();

     ////////////////

     function init() {
       bind();
       configureGrid();
       getUserList();
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
           if ($scope.gridApi.selection) {
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
       getPartners(startIndex);
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
         }, $scope.searchStr);
     }

     function getPartners(startIndex) {
       UserListService.listPartners(Authinfo.getOrgId(), function (data, status, searchStr) {
         if (data.success) {
           $timeout(function () {
             $scope.load = true;
           });
           Log.debug('Returned data.', data.Resources);
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

     function setFilter(filter) {
       $scope.activeFilter = filter || 'all';
       if (filter === 'administrators') {
         $scope.gridData = $scope.userList.adminUsers;
         $scope.searchStr = 'administrators';
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

     function isHuronUser(allEntitlements) {
       if (allEntitlements) {
         for (var i = 0; i < allEntitlements.length; i++) {
           if (Config.entitlements.huron === allEntitlements[i]) {
             return true;
           }
         }
       }
       return false;
     }

     function resendInvitation(userEmail, userName, uuid, userStatus, dirsyncEnabled, entitlements) {
       if (userStatus === 'pending' && !$scope.isHuronUser(entitlements)) {
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
     }

     function sendSparkWelcomeEmail(userEmail, userName) {
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
           $scope.btnSaveLoad = false;
         }
       });
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

       var photoCellTemplate = '<img ng-if="row.entity.photos" class="user-img" ng-src="{{grid.appScope.getUserPhoto(row.entity)}}"/>' +
         '<span ng-if="!row.entity.photos" class="user-img">' +
         '<i class="icon icon-user"></i>' +
         '</span>';

       var actionsTemplate = '<span cs-dropdown ng-if="row.entity.userStatus === \'pending\' || !org.dirsyncEnabled">' +
         '<button cs-dropdown-toggle id="actionsButton" class="btn--none dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
         '<i class="icon icon-three-dots"></i>' +
         '</button>' +
         '<ul cs-dropdown-menu class="dropdown-menu dropdown-primary" role="menu">' +
         '<li ng-if="row.entity.userStatus === \'pending\' || grid.appScope.isHuronUser(row.entity.entitlements)" id="resendInviteOption"><a ng-click="$event.stopPropagation(); grid.appScope.resendInvitation(row.entity.userName, row.entity.name.givenName, row.entity.id, row.entity.userStatus, org.dirsyncEnabled, row.entity.entitlements); "><span translate="usersPage.resend"></span></a></li>' +
         '<li ng-if="!org.dirsyncEnabled && row.entity.displayName !== grid.appScope.userName" id="deleteUserOption"><a data-toggle="modal" ng-click="$event.stopPropagation(); grid.appScope.setDeactivateUser(row.entity.meta.organizationID, row.entity.id, row.entity.userName); "><span translate="usersPage.deleteUser"></span></a></li>' +
         '<li ng-if="!org.dirsyncEnabled && row.entity.displayName === grid.appScope.userName" id="deleteUserOption"><a data-toggle="modal" ng-click="$event.stopPropagation(); grid.appScope.setDeactivateSelf(row.entity.meta.organizationID, row.entity.id, row.entity.userName); "><span translate="usersPage.deleteUser"></span></a></li>' +
         '</ul>' +
         '</span>';
       $scope.gridOptions = {
         data: 'gridData',
         multiSelect: false,
         rowHeight: 45,
         enableRowHeaderSelection: false,
         enableColumnResize: true,
         enableColumnMenus: false,
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
           cellTemplate: getTemplate('_statusTpl'),
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

     // TODO: If using states should be be able to trigger this log elsewhere?
     if ($state.current.name === "users.list") {
       LogMetricsService.logMetrics('In users list page', LogMetricsService.getEventType('customerUsersListPage'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1, null);
     }
   }
 })();
