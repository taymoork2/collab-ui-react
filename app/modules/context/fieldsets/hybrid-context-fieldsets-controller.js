require('../fields/_fields-list.scss');

(function () {
  'use strict';

  angular
    .module('Context')
    .controller('HybridContextFieldsetsCtrl', HybridContextFieldsetsCtrl);

  /* @ngInject */
  function HybridContextFieldsetsCtrl($scope, $rootScope, $filter, $state, $translate, Log, $q, ContextFieldsetsService, Notification) {
    //Initialize variables
    var vm = this;

    vm.init = init;
    vm.initializeGrid = initializeGrid;

    $scope.$on('$destroy', onDestroy);

    $scope.load = true;
    $scope.currentDataPosition = 0;

    $scope.gridRefresh = false;
    $scope.noSearchesYet = true;
    $scope.noSearchResults = false;
    $scope.fieldsetsList = {
      allFields: [],
    };

    // Functions
    $scope.getFieldsetsList = getFieldsetsList;

    var eventListeners = [];

    init();

    function init() {
      var promises = {
        initializeGrid: vm.initializeGrid(),
      };

      $q.all(promises).then(function () {
        initializeListeners();
        getFieldsetsList();
      });
    }

    function initializeListeners() {
      // if the side panel is closing unselect the entry
      eventListeners.push($rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('fieldsets')) {
          if ($scope.gridApi && $scope.gridApi.selection) {
            $scope.gridApi.selection.clearSelectedRows();
          }
        }
      }));
    }

    function onDestroy() {
      while (!_.isEmpty(eventListeners)) {
        _.attempt(eventListeners.pop());
      }
    }

    function processFieldsetsList(fieldsetsList) {

      _.forEach(fieldsetsList, function (fieldset) {

        if (fieldset.lastUpdated) {
          fieldset.lastUpdated = $filter('date')(fieldset.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));
        }

        fieldset.numOfFields = (fieldset.fields) ? fieldset.fields.length : 0;

      });
      return $q.resolve(fieldsetsList);
    }

    function getFieldsetsList() {
      if (!$scope.load) {
        return $q.resolve();
      }
      $scope.gridRefresh = true;
      $scope.noSearchesYet = false;
      $scope.fieldsetsList.allFields = [];
      var getAndProcessFieldsetsPromise = ContextFieldsetsService.getFieldsets()
        .then(function (fieldsets) {
          return processFieldsetsList(fieldsets);
        })
        .then(function (processedFieldsets) {
          $scope.gridData = processedFieldsets;
          $scope.noSearchResults = processedFieldsets.length === 0;
          $scope.fieldsetsList.allFields = $scope.gridData;
          $scope.load = false;
          return $q.resolve();
        })
        .catch(function (err) {
          Log.debug('CS fieldsets search failed. Status: ' + err);
          Notification.error('context.dictionary.fieldsetPage.fieldsetReadFailed');
          return $q.reject(err);
        });

      var promises = {
        getAndProcessFieldsetsPromise: getAndProcessFieldsetsPromise,
      };

      return $q.all(promises)
        .then(function () {
          $scope.gridApi.infiniteScroll.dataLoaded();
        })
        .finally(function () {
          $scope.gridRefresh = false;
        });

    }

    function initializeGrid() {
      var deferred = $q.defer();

      function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if ($scope.load) {
            $scope.currentDataPosition++;
            $scope.load = false;
            //Server side pagination is to be implemented
            getFieldsetsList();
          }
        });
        deferred.resolve();
      }

      $scope.gridOptions = {
        data: 'gridData',
        multiSelect: false,
        rowHeight: 44,
        enableColumnResize: true,
        enableRowHeaderSelection: false,
        enableColumnMenus: false,
        onRegisterApi: onRegisterApi,
        columnDefs: [{
          field: 'id',
          displayName: $translate.instant('context.dictionary.fieldsetPage.fieldsetId'),
          maxWidth: 300,
        }, {
          field: 'description',
          displayName: $translate.instant('common.description'),
        }, {
          field: 'numOfFields',
          displayName: $translate.instant('context.dictionary.fieldsetPage.numOfFields'),
          type: 'number',
          maxWidth: 200,
        }, {
          field: 'lastUpdated',
          displayName: $translate.instant('context.dictionary.fieldPage.lastUpdated'),
          maxWidth: 300,
        }],
      };
      return deferred.promise;
    }
  }
}());
