'use strict';
/* global $ */

angular.module('Core')
  .controller('ListOrganizationsCtrl', ['$scope', '$rootScope', '$state', '$location', '$dialogs', '$timeout', '$translate', 'UserListService', 'Log', 'Storage', 'Config', 'Notification', 'Orgservice', 'Authinfo', 'LogMetricsService', 'Utils',
    function ($scope, $rootScope, $state, $location, $dialogs, $timeout, $translate, UserListService, Log, Storage, Config, Notification, Orgservice, Authinfo, LogMetricsService, Utils) {

      //Initialize variables
      $scope.load = true;
      $scope.page = 1;
      $scope.status = null;
      $scope.currentDataPosition = 0;
      $scope.queryuserslist = [];
      $scope.searchStr = '';
      $scope.timeoutVal = 1000;
      $scope.timer = 0;

      $scope.popup = Notification.popup;

      $scope.organizationPreviewActive = false;
      $scope.organizationDetailsActive = false;

      $scope.sort = {
        by: 'name',
        order: 'ascending'
      };

      // if the side panel is closing unselect the user
      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('users.list')) {
          if ($scope.gridOptions.$gridScope) {
            $scope.gridOptions.$gridScope.toggleSelectAll(false, true);
          }
        }
      });

      var getOrgList = function (startAt) {
        $scope.gridRefresh = true;
        var startIndex = startAt || 0;

        Orgservice.listOrgs($scope.searchStr, function (data, status) {
          $scope.gridRefresh = false;
          if (data.success) {
            $scope.gridData = data.organizations;
            $scope.placeholder.count = data.organizations.length;
          } else {
            Log.debug('Get existing org failed. Status: ' + status);
          }
        });
      };

      $scope.userName = Authinfo.getUserName();
      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showCustomerDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var actionsTemplate = '<span dropdown ng-if="row.entity.userStatus === \'pending\' || !org.dirsyncEnabled">' +
        '<button id="actionsButton" class="btn-icon btn-actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
        '<i class="icon icon-three-dots"></i>' +
        '</button>' +
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
          field: 'displayName',
          displayName: $translate.instant('organizationsPage.displayName'),
          sortable: true
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
          getOrgList($scope.currentDataPosition * Config.usersperpage + 1);
        }
      });

      $scope.showCustomerDetails = function (currentOrganization) {
        $state.go('organization-overview', {
          currentOrganization: currentOrganization
        });
      };

      //list users when we have authinfo data back, or new users have been added/activated
      $scope.$on('AuthinfoUpdated', function () {
        getOrgList();
      });

      $scope.placeholder = {
        name: $translate.instant('organizationsPage.search'),
        filterValue: '',
        count: 0
      };

      // On click, filter user list and set active filter
      $scope.filterList = function (str) {
        if (!str || str.length <= 3 || $scope.searchStr === str) {
          return;
        }

        if ($scope.timer) {
          $timeout.cancel($scope.timer);
          $scope.timer = 0;
        }

        $scope.timer = $timeout(function () {
          $scope.searchStr = str;
          getOrgList();
        }, $scope.timeoutVal);
      };
    }
  ]);
