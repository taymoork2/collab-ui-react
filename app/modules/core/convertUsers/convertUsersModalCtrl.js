'use strict';

angular.module('Core')
  .controller('ConvertUsersModalCtrl', ['$scope', '$filter', 'Userservice', 'Notification', '$log', '$translate',
    function ($scope, $filter, Userservice, Notification, $log, $translate) {
      $log.log($scope.licenses.unlicensedUsersList);
      $scope.convertUsers = function () {
        Userservice.migrateUsers($scope.gridOptions.$gridScope.selectedItems, function (data, status) {
          var errorMessages = [];
          var successMessages = [];
          for (var i = 0; i < data.userResponse.length; i++) {
            if (data.userResponse[i].status !== 200) {
              errorMessages.push(data.userResponse[i].message.replace(/user/gi, data.userResponse[i].email) + '.');
            } else {
              successMessages.push(data.userResponse[i].email + ' ' + $translate.instant('usersPage.convertUserSuccess'));
            }
          }

          Notification.notify(errorMessages, 'error');
          Notification.notify(successMessages, 'success');
        });
        $scope.convertModalInstance.close();
      };

      $scope.gridOptions = {
        data: 'licenses.unlicensedUsersList',
        rowHeight: 45,
        headerRowHeight: 45,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 2,
        showSelectionCheckbox: true,
        sortInfo: {
          fields: ['userName'],
          directions: ['desc']
        },
        selectedItems: [],
        columnDefs: [{
          field: 'name.givenName',
          displayName: $translate.instant('usersPage.firstnameHeader'),

          resizable: false,
          sortable: true
        }, {
          field: 'name.familyName',
          displayName: $translate.instant('usersPage.lastnameHeader'),

          resizable: false,
          sortable: true
        }, {
          field: 'userName',
          displayName: $filter('translate')('homePage.emailAddress'),

          resizable: false,
          sortable: true
        }]
      };

    }
  ]);
