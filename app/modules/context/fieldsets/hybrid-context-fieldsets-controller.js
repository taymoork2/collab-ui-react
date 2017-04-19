require('../fields/_fields-list.scss');

(function () {
  'use strict';

  angular
    .module('Context')
    .controller('HybridContextFieldsetsCtrl', HybridContextFieldsetsCtrl);

  /* @ngInject */
  function HybridContextFieldsetsCtrl($scope, $rootScope, $filter, $state, $translate, Log, $q, ContextFieldsetsService, Notification, hasContextDictionaryEditFeatureToggle) {
    //Initialize variables
    var vm = this;
    var eventListeners = [];

    vm.hasContextDictionaryEditFeatureToggle = hasContextDictionaryEditFeatureToggle;
    vm.load = true;
    vm.fetchFailed = false;
    vm.currentDataPosition = 0;
    vm.gridRefresh = false;
    vm.noSearchesYet = true;
    vm.noSearchResults = false;
    vm.fieldsetsList = {
      allFieldsets: [],
    };

    vm.filterBySearchStr = filterBySearchStr;
    vm.filterList = filterList;

    vm.placeholder = {
      name: $translate.instant('common.search'),
      filterValue: '',
      count: 0,
    };

    vm.searchStr = '';

    vm.createFieldset = function () {
      $state.go('context-fieldset-modal', {
        existingFieldsetIds: _.map(vm.fieldsetsList.allFieldsets, function (fieldset) {
          return fieldset.id;
        }),
        callback: function (newFieldset) {
          var fieldsetCopy = _.cloneDeep(newFieldset);
          vm.fieldsetsList.allFieldsets.unshift(processFieldset(fieldsetCopy));
          filterList(vm.searchStr);
        },
      });
    };

    $scope.$on('$destroy', onDestroy);

    init();

    function init() {
      var promises = {
        initializeGrid: initializeGrid(),
      };

      $q.all(promises).then(function () {
        initializeListeners();
        return getFieldsetsList();
      });
    }

    function initializeListeners() {
      // if the side panel is closing unselect the entry
      eventListeners.push($rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('fieldsets')) {
          if (vm.gridApi && vm.gridApi.selection) {
            vm.gridApi.selection.clearSelectedRows();
          }
        }
      }));
    }

    function onDestroy() {
      while (!_.isEmpty(eventListeners)) {
        _.attempt(eventListeners.pop());
      }
    }

    function processFieldset(fieldset) {

      if (fieldset.lastUpdated) {
        fieldset.lastUpdated = $filter('date')(fieldset.lastUpdated, $translate.instant('context.dictionary.fieldPage.dateFormat'));
      }

      fieldset.numOfFields = (fieldset.fields) ? fieldset.fields.length : 0;
      return fieldset;
    }

    function processFieldsetsList(fieldsetList) {
      return _.map(fieldsetList, processFieldset);
    }

    function getFieldsetsList() {
      if (!vm.load) {
        return $q.resolve();
      }
      vm.gridRefresh = true;
      vm.noSearchesYet = false;
      vm.fieldsetsList.allFieldsets = [];
      var getAndProcessFieldsetsPromise = ContextFieldsetsService.getFieldsets()
        .then(function (fieldsets) {
          return processFieldsetsList(fieldsets);
        })
        .then(function (processedFieldsets) {
          vm.gridOptions.data = processedFieldsets;
          vm.fieldsetsList.allFieldsets = processedFieldsets;
          vm.noSearchResults = processedFieldsets.length === 0;
          return $q.resolve();
        })
        .catch(function (err) {
          Log.debug('CS fieldsets search failed. Status: ' + err);
          Notification.error('context.dictionary.fieldsetPage.fieldsetReadFailed');
          vm.fetchFailed = true;
          return $q.reject(err);
        });

      var promises = {
        getAndProcessFieldsetsPromise: getAndProcessFieldsetsPromise,
      };

      return $q.all(promises)
        .then(function () {
          vm.gridApi.infiniteScroll.dataLoaded();
        })
        .finally(function () {
          vm.gridRefresh = false;
          vm.load = false;
        });

    }

    function initializeGrid() {
      var deferred = $q.defer();

      function onRegisterApi(gridApi) {
        vm.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $state.go('context-fieldsets-sidepanel', {
            fieldset: row.entity,
          });
        });
        gridApi.infiniteScroll.on.needLoadMoreData($scope, function () {
          if (vm.load) {
            vm.currentDataPosition++;
            //Server side pagination is to be implemented
            getFieldsetsList();
          }
        });
        deferred.resolve();
      }

      vm.gridOptions = {
        //data: [],
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

    // On click, wait for typing to stop and run search
    function filterList(str) {

      return filterBySearchStr(vm.fieldsetsList.allFieldsets, str)
        .then(function (processedFieldsets) {
          vm.gridOptions.data = processedFieldsets;
          vm.noSearchResults = processedFieldsets.length === 0;
          vm.placeholder.count = processedFieldsets.length;
        });
    }

    //filter out the list by the searchStr
    function filterBySearchStr(fieldsetList, str) {
      vm.searchStr = str;
      if (!str) {
        return $q.resolve(fieldsetList);
      }

      var lowerStr = str.toLowerCase();
      return $q.resolve(fieldsetList.filter(function (fieldset) {
        return (_.has(fieldset, 'id') ? (fieldset.id.toLowerCase().indexOf(lowerStr) !== -1) : false) ||
          (_.has(fieldset, 'description') ? (fieldset.description.toLowerCase().indexOf(lowerStr) !== -1) : false) ||
          (_.has(fieldset, 'numOfFields') ? (fieldset.numOfFields.toString().indexOf(lowerStr) !== -1) : false) ||
          (_.has(fieldset, 'lastUpdated') ? (fieldset.lastUpdated.toLowerCase().indexOf(lowerStr) !== -1) : false);
      }));
    }

  }
}());
