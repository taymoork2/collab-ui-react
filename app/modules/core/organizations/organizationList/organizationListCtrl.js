'use strict';
/* global $ */

angular.module('Core')
  .controller('ListOrganizationsCtrl', ['$scope', '$rootScope', '$state', '$dialogs', '$timeout', '$translate', 'Log', 'Config', 'Orgservice',
    function ($scope, $rootScope, $state, $dialogs, $timeout, $translate, Log, Config, Orgservice) {

      //Initialize variables
      $scope.load = true;
      $scope.page = 1;
      $scope.currentDataPosition = 0;

      $scope.searchStr = '';
      $scope.timeoutVal = 1000;
      $scope.timer = 0;
      $scope.noSearchesYet = true;
      $scope.noSearchResults = false;

      $scope.sort = {
        by: 'name',
        order: 'ascending'
      };

      // if the side panel is closing unselect the user
      $rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('organizations')) {
          if ($scope.gridOptions.$gridScope) {
            $scope.gridOptions.$gridScope.toggleSelectAll(false, true);
          }
        }
      });

      var getOrgList = function (startAt) {
        $scope.gridRefresh = true;
        $scope.noSearchesYet = false;
        var startIndex = startAt || 0;

        Orgservice.listOrgs($scope.searchStr).then(function (response) {
          var data = response.data;
          $scope.gridData = data.organizations;
          $scope.placeholder.count = data.organizations.length;
          $scope.noSearchResults = data.organizations.length === 0;
          $scope.gridRefresh = false;
        }).catch(function (err) {
          Log.debug('Get existing org failed. Status: ' + err);
          $scope.gridRefresh = false;
        });
      };

      var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showOrganizationDetails(row.entity)">' +
        '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
        '<div ng-cell></div>' +
        '</div>';

      var actionsTemplate = '<span dropdown>' +
        '<button id="actionsButton" class="btn--none btn--actions dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
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
          getOrgList($scope.currentDataPosition * Config.orgsPerPage + 1);
        }
      });

      $scope.showOrganizationDetails = function (currentOrganization) {
        $state.go('organization-overview', {
          currentOrganization: currentOrganization
        });
      };

      //list orgs when we have authinfo data back, or new orgs have been added/activated
      $scope.$on('AuthinfoUpdated', function () {
        getOrgList();
      });

      $scope.placeholder = {
        name: $translate.instant('organizationsPage.search'),
        filterValue: '',
        count: 0
      };

      // On click, wait for typing to stop and run search
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
