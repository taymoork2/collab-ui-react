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
            if ($scope.gridApi.selection) {
              $scope.gridApi.selection.clearSelectedRows();
            }
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

        var actionsTemplate = '<span cs-dropdown class="actions-menu">' +
          '<button cs-dropdown-toggle id="actionsButton" class="btn--none dropdown-toggle" ng-click="$event.stopPropagation()" ng-class="dropdown-toggle">' +
          '<i class="icon icon-three-dots"></i>' +
          '</button>' +
          '</span>';

        $scope.gridOptions = {
          data: 'gridData',
          multiSelect: false,
          rowHeight: 44,
          enableColumnResize: true,
          enableRowHeaderSelection: false,
          enableColumnMenus: false,
          onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
              $scope.showOrganizationDetails(row.entity);
            });
            gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
              if ($scope.load) {
                $scope.currentDataPosition++;
                $scope.load = false;
                getOrgList($scope.currentDataPosition * Config.orgsPerPage + 1);
                $scope.gridApi.infiniteScroll.dataLoaded();
              }
            });
          },
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
