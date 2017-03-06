require('./_fields-list.scss');

(function () {
  'use strict';

  angular.module('Context')
    .controller('HybridContextFieldsCtrl', HybridContextFieldsCtrl);

  /* @ngInject */
  function HybridContextFieldsCtrl($scope, $rootScope, $filter, $state, $translate, Log, $q, ContextFieldsService, Notification) {
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
    $scope.fieldsList = {
      allFields: [],
    };

    // Functions
    $scope.getFieldList = getFieldList;

    var eventListeners = [];

    init();

    function init() {
      var promises = {
        initializeGrid: vm.initializeGrid(),
      };

      $q.all(promises).then(function () {
        initializeListeners();
        getFieldList();
      });
    }

    function initializeListeners() {
      // if the side panel is closing unselect the entry
      eventListeners.push($rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('fields')) {
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

    function processFieldList(fieldList) {
      var searchableMap = {
        true: $translate.instant('common.yes'),
        false: $translate.instant('common.no'),
      };

      var classificationMap = {
        ENCRYPTED: $translate.instant('context.dictionary.fieldPage.encrypted'),
        UNENCRYPTED: $translate.instant('context.dictionary.fieldPage.unencrypted'),
        PII: $translate.instant('context.dictionary.fieldPage.piiEncrypted'),
      };
      _.forEach(fieldList, function (field) {

        field.searchable = searchableMap[field.searchable] || $translate.instant('common.yes');

        if (field.dataType) {
          field.dataType = _.upperFirst(field.dataType.trim());
        }

        field.classification = classificationMap[field.classification] || $translate.instant('context.dictionary.fieldPage.unencrypted');

        if (field.lastUpdated) {
          field.lastUpdated = $filter('date')(field.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));
        }
      });
      return $q.resolve(fieldList);
    }

    function getFieldList() {
      if (!$scope.load) {
        return $q.resolve();
      }
      $scope.gridRefresh = true;
      $scope.noSearchesYet = false;
      $scope.fieldsList.allFields = [];
      var getAndProcessFieldsPromise = ContextFieldsService.getFields()
        .then(function (fields) {
          return processFieldList(fields);
        })
        .then(function (processedFields) {
          $scope.gridData = processedFields;
          $scope.noSearchResults = processedFields.length === 0;
          $scope.fieldsList.allFields = $scope.gridData;
          return $q.resolve();
        })
        .catch(function (err) {
          Log.debug('CS fields search failed. Status: ' + err);
          Notification.error('context.dictionary.fieldPage.fieldReadFailed');
          return $q.reject(err);
        });

      var promises = {
        getAndProcessFieldsPromise: getAndProcessFieldsPromise,
      };

      return $q.all(promises)
          .then(function () {
            $scope.gridApi.infiniteScroll.dataLoaded();
          })
          .finally(function () {
            $scope.gridRefresh = false;
            $scope.load = false;
          });

    }

    function initializeGrid() {
      var deferred = $q.defer();

      function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if ($scope.load) {
            $scope.currentDataPosition++;
            //Server side pagination is to be implemented
            getFieldList();
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
          displayName: $translate.instant('context.dictionary.fieldPage.fieldId'),
          maxWidth: 300,
        }, {
          field: 'description',
          displayName: $translate.instant('common.description'),
        }, {
          field: 'dataType',
          displayName: $translate.instant('context.dictionary.fieldPage.dataType'),
          maxWidth: 200,
        }, {
          field: 'classification',
          displayName: $translate.instant('context.dictionary.fieldPage.classification'),
          maxWidth: 200,
        }, {
          field: 'searchable',
          displayName: $translate.instant('context.dictionary.fieldPage.searchable'),
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
