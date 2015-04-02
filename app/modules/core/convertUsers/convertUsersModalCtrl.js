'use strict';

angular.module('Core')
  .controller('ConvertUsersModalCtrl', ['$scope', '$filter', 'Userservice', 'Notification', '$log', '$translate',
    function ($scope, $filter, Userservice, Notification, $log, $translate) {
      $log.log($scope.licenses.unlicensedUsersList);
      $scope.convertUsers = function () {
        Userservice.migrateUsers($scope.gridOptions.$gridScope.selectedItems, function (data, status) {
          if (data.success) {
            var successMessage = [];
            successMessage.push('Users successfully converted.');
            Notification.notify(successMessage, 'success');
          } else {
            var errorMessage = ['Converting users failed. Status: ' + status];
            errorMessage.push();
            Notification.notify(errorMessage, 'error');
          }
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
