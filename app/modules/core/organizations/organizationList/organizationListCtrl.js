'use strict';

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

      $scope.placeholder = {
        name: $translate.instant('organizationsPage.search'),
        filterValue: '',
        count: 0
      };

      $scope.filters = [];
      $scope.gridData = [];

      $scope.showOrganizationDetails = showOrganizationDetails;
      $scope.filterList = filterList;

      init();
      ////////////////

      function init() {
        initializeListeners();
        initializeGrid();
      }

      function initializeListeners() {
        // if the side panel is closing unselect the user
        $rootScope.$on('$stateChangeSuccess', function () {
          if ($state.includes('organizations')) {
            if ($scope.gridOptions.$gridScope) {
              $scope.gridOptions.$gridScope.toggleSelectAll(false, true);
            }
          }
        });

        $scope.$on('ngGridEventScroll', function () {
          if ($scope.load) {
            $scope.currentDataPosition++;
            $scope.load = false;
            getOrgList($scope.currentDataPosition * Config.orgsPerPage + 1);
          }
        });

        //list orgs when we have authinfo data back, or new orgs have been added/activated
        $scope.$on('AuthinfoUpdated', function () {
          getOrgList();
        });
      }

      function getOrgList() {
        $scope.gridRefresh = true;
        $scope.noSearchesYet = false;

        Orgservice.listOrgs($scope.searchStr).then(function (response) {
          var orgs = response.data.organizations;
          $scope.gridData = orgs;
          $scope.placeholder.count = orgs.length;
          $scope.noSearchResults = orgs.length === 0;
        }).catch(function (err) {
          Log.debug('Get existing org failed. Status: ' + err);
        }).finally(function () {
          $scope.gridRefresh = false;
        });
      }

      function initializeGrid() {
        $scope.sort = {
          by: 'displayName',
          order: 'ascending'
        };

        var rowTemplate = '<div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell {{col.cellClass}}" ng-click="showOrganizationDetails(row.entity)">' +
          '<div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }">&nbsp;</div>' +
          '<div ng-cell></div>' +
          '</div>';

        var actionsTemplate = '<span dropdown>' +
          '<button id="actionsButton" class="btn--none dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
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
          enableColumnResize: true,

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
      }

      function showOrganizationDetails(currentOrganization) {
        $state.go('organization-overview', {
          currentOrganization: currentOrganization
        });
      }

      // On click, wait for typing to stop and run search
      function filterList(str) {
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
      }
    }
  ]);
