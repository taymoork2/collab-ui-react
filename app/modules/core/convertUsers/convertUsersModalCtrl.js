// 'use strict';

// angular.module('Core')
//   .controller('ConvertUsersModalCtrl', ['$scope', '$filter', 'Userservice', 'Notification', '$log', '$translate', 'Orgservice',
//     function ($scope, $filter, Userservice, Notification, $log, $translate, Orgservice) {

      // $scope.convertUsers = function () {
      //   Userservice.migrateUsers($scope.gridOptions.$gridScope.selectedItems, function (data, status) {
      //     var errorMessages = [];
      //     var successMessages = [];
      //     for (var i = 0; i < data.userResponse.length; i++) {
      //       if (data.userResponse[i].status !== 200) {
      //         errorMessages.push(data.userResponse[i].email + ' could not be converted. Contact support for assistance converting this user.');
      //       } else {
      //         successMessages.push(data.userResponse[i].email + ' ' + $translate.instant('usersPage.convertUserSuccess'));
      //       }
      //     }

      //     Notification.notify(errorMessages, 'error');
      //     Notification.notify(successMessages, 'success');
      //   });
      //   $scope.convertModalInstance.close();
      // };

      // var getUnlicensedUsers = function () {
      //   Orgservice.getUnlicensedUsers(function (data) {
      //     $scope.unlicensed = 0;
      //     $scope.unlicensedUsersList = null;
      //     if (data.success) {
      //       if (data.totalResults) {
      //         $scope.unlicensed = data.totalResults;
      //         $scope.unlicensedUsersList = data.resources;
      //       }
      //     }
      //   });
      // };

      // getUnlicensedUsers();

      // var givenNameTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{row.entity.name.givenName}}">{{row.entity.name.givenName}}</p></div>';
      // var familyNameTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{row.entity.name.familyName}}">{{row.entity.name.familyName}}</p></div>';
      // var emailTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{row.entity.userName}}">{{row.entity.userName}}</p></div>';

      // $scope.gridOptions = {
      //   data: 'unlicensedUsersList',
      //   rowHeight: 45,
      //   headerRowHeight: 45,
      //   enableHorizontalScrollbar: 0,
      //   enableVerticalScrollbar: 2,
      //   showSelectionCheckbox: true,
      //   sortInfo: {
      //     fields: ['userName'],
      //     directions: ['desc']
      //   },
      //   selectedItems: [],
      //   columnDefs: [{
      //     field: 'name.givenName',
      //     displayName: $translate.instant('usersPage.firstnameHeader'),
      //     cellTemplate: givenNameTemplate,
      //     resizable: false,
      //     sortable: true
      //   }, {
      //     field: 'name.familyName',
      //     displayName: $translate.instant('usersPage.lastnameHeader'),
      //     cellTemplate: familyNameTemplate,
      //     resizable: false,
      //     sortable: true
      //   }, {
      //     field: 'userName',
      //     displayName: $filter('translate')('homePage.emailAddress'),
      //     cellTemplate: emailTemplate,
      //     resizable: false,
      //     sortable: true
      //   }]
      // };

  //   }
  // ]);
