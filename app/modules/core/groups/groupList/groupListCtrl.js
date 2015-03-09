'use strict';

angular.module('Core')
  .controller('ListGroupsCtrl', ['$scope', '$rootScope', '$state', '$location', '$dialogs', '$timeout', '$filter', 'GroupService', 'Log',
    function ($scope, $rootScope, $state, $location, $dialogs, $timeout, $filter, GroupService, Log) {

      //Initialize variables
      $scope.load = true;
      $scope.groupListData = [];
      $scope.activeFilter = 'all';
      $scope.filterTotals = {
        all: 0,
        needAttention: 0
      };
      $scope.currentGroup = null;
      $scope.groupPreviewActive = false;

      var getGroupList = function () {
        //clear currentGroup if a new search begins
        $scope.currentGroup = null;
        GroupService.getGroupList(function (data, status) {
          if (data.success) {
            $timeout(function () {
              $scope.load = true;
            });
            $scope.groupListData = data.groups;
            $scope.filterTotals.all = data.totalResults;
            console.log(data);
          } else {
            Log.debug('Query groups failed. Status: ' + status);
          }
        });
      };

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showGroupDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      $scope.gridOptions = {
        data: 'groupListData',
        multiSelect: false,
        showFilter: false,
        rowHeight: 44,
        rowTemplate: rowTemplate,
        headerRowHeight: 44,
        useExternalSorting: true,

        columnDefs: [{
          field: 'displayName',
          displayName: $filter('translate')('groupsPage.groupNameHeader')
        }, {
          field: 'members.length',
          displayName: $filter('translate')('groupsPage.membersCountHeader')
        }]
      };

      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('groups.list.preview.*')) {
          $scope.groupPreviewActive = true;
        } else if ($state.includes('groups.list.preview')) {
          $scope.groupPreviewActive = true;
        } else {
          $scope.groupPreviewActive = false;
        }
      });

      $scope.showGroupDetails = function (group) {
        $scope.currentGroup = group;
        $state.go('groups.list.preview');
      };

      getGroupList();

      $scope.setFilter = function (filter) {
        $scope.activeFilter = filter;
      };
    }
  ]);
