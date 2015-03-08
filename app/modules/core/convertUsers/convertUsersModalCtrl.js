'use strict';
/* global moment */

angular.module('Core')
  .controller('ConvertUsersModalCtrl', ['$scope', '$filter', 'Userservice', 'Notification',
    function ($scope, $filter, Userservice, Notification) {

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

      var nameTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{getName(row.entity)}}">{{getName(row.entity)}}</p></div>';

      var emailTemplate = '<div class="ngCellText"><p class="hoverStyle" title="{{row.entity.userName}}">{{row.entity.userName}}</p></div>';

      $scope.gridOptions = {
        data: 'licenses.unlicensedUsersList',
        rowHeight: 45,
        headerRowHeight: 45,
        enableHorizontalScrollbar: 0,
        enableVerticalScrollbar: 2,
        showSelectionCheckbox: true,

        selectedItems: [],
        columnDefs: [{
          displayName: $filter('translate')('homePage.name'),
          width: 342,
          resizable: false,
          cellTemplate: nameTemplate,
          sortable: false
        }, {
          field: 'userName',
          displayName: $filter('translate')('homePage.emailAddress'),
          cellTemplate: emailTemplate,
          width: 405,
          resizable: false,
          sortable: false
        }]
      };

      $scope.gridOptions.enableHorizontalScrollbar = 0;

    }
  ]);
