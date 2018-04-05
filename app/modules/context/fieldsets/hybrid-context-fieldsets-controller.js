require('../fields/_fields-list.scss');
var momentFilter = require('../filters/momentFilter').Moment;

(function () {
  'use strict';

  var dateTimeFormatString = 'LL';
  var AdminAuthorizationStatus = require('modules/context/services/context-authorization-service').AdminAuthorizationStatus;
  var PropertyConstants = require('modules/context/services/context-property-service').PropertyConstants;

  angular
    .module('Context')
    .controller('HybridContextFieldsetsCtrl', HybridContextFieldsetsCtrl);

  /* @ngInject */
  function HybridContextFieldsetsCtrl($scope, $rootScope, $state, $translate, Log, $q, ContextFieldsetsService, Notification, PropertyService, Authinfo, ContextAdminAuthorizationService) {
    //Initialize variables
    var vm = this;
    var eventListeners = [];

    vm.load = true;
    vm.fetchFailed = false;
    vm.currentDataPosition = 0;
    vm.gridRefresh = false;
    vm.noSearchesYet = true;
    vm.noSearchResults = false;
    vm.fieldsetsList = {
      allFieldsets: [],
    };

    vm.showNew = false;
    vm.maxFieldsetsAllowed = PropertyConstants.MAX_FIELDSETS_DEFAULT_VALUE;
    vm.newButtonTooltip = '';

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
          checkFieldsetsLimitAndSetTooltip();
          filterList(vm.searchStr);
        },
      });
    };

    vm.adminAuthorizationStatus = AdminAuthorizationStatus.UNKNOWN;

    $scope.$on('$destroy', onDestroy);

    init();

    function init() {
      var promises = {
        initializeGrid: initializeGrid(),
      };

      $q.all(promises).then(function () {
        initializeListeners();
        getFieldsetsList().catch(_.noop);
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
      // Find total number of fields and then subtract the inactive fields, to get the number of active fields.
      var totalNumberOfFields = (fieldset.fields) ? fieldset.fields.length : 0;
      fieldset.numOfFields = totalNumberOfFields - ((fieldset.inactiveFields) ? fieldset.inactiveFields.length : 0);

      var accessibleMap = {
        true: $translate.instant('context.dictionary.base'),
        false: Authinfo.getOrgName(),
      };

      fieldset.publiclyAccessibleUI = accessibleMap[fieldset.publiclyAccessible];
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
        });

      var promises = {
        getAndProcessFieldsetsPromise: getAndProcessFieldsetsPromise,
        getMaxFieldsetsAllowed: getMaxFieldsetsAllowed(),
        getAdminAuthorizationStatus: getAdminAuthorizationStatus(),
      };

      return $q.all(promises)
        .then(function () {
          vm.gridApi.infiniteScroll.dataLoaded();
          checkFieldsetsLimitAndSetTooltip();
        })
        .finally(function () {
          vm.gridRefresh = false;
          vm.load = false;
        });
    }

    function checkFieldsetsLimitAndSetTooltip() {
      var customFieldsets = vm.fieldsetsList.allFieldsets.filter(function (fieldset) {
        return _.get(fieldset, 'publiclyAccessibleUI', '').toLowerCase() !== 'cisco';
      });

      vm.showNew = customFieldsets.length < vm.maxFieldsetsAllowed && (vm.adminAuthorizationStatus === AdminAuthorizationStatus.AUTHORIZED);

      if (!vm.showNew) {
        switch (vm.adminAuthorizationStatus) {
          case AdminAuthorizationStatus.AUTHORIZED:
            vm.newButtonTooltip = $translate.instant('context.dictionary.fieldsetPage.limitReached');
            break;
          case AdminAuthorizationStatus.UNAUTHORIZED:
            vm.newButtonTooltip = $translate.instant('context.dictionary.fieldsetPage.notAuthorized');
            break;
          case AdminAuthorizationStatus.UNKNOWN:
            vm.newButtonTooltip = $translate.instant('context.dictionary.unknownAdminAuthorizationStatus');
            break;
          case AdminAuthorizationStatus.NEEDS_MIGRATION:
            vm.newButtonTooltip = $translate.instant('context.dictionary.fieldsetPage.needsMigration');
            break;
          default:
            break;
        }
      }
    }

    function initializeGrid() {
      var deferred = $q.defer();

      function onRegisterApi(gridApi) {
        vm.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $state.go('context-fieldsets-sidepanel', {
            adminAuthorizationStatus: vm.adminAuthorizationStatus,
            fieldset: row.entity,
            process: processFieldset,
            callback: function (updatedFieldset) {
              vm.gridRefresh = true;
              var index = _.findIndex(vm.fieldsetsList.allFieldsets, function (current) {
                return current.id === updatedFieldset.id;
              });
              if (index > -1) {
                var fieldsetCopy = processFieldset(_.cloneDeep(updatedFieldset));
                _.fill(vm.fieldsetsList.allFieldsets, fieldsetCopy, index, index + 1);
                vm.gridOptions.data = vm.fieldsetsList.allFieldsets;
                vm.gridApi.grid.modifyRows(vm.gridOptions.data);
                vm.gridApi.selection.selectRow(vm.gridOptions.data[index]);
                filterList(vm.searchStr);
              }
              vm.gridRefresh = false;
            },
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
        enableRowHashing: false,
        enableSorting: true,
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
          field: 'publiclyAccessibleUI',
          displayName: $translate.instant('context.dictionary.access'),
          maxWidth: 200,
        }, {
          field: 'lastUpdated',
          displayName: $translate.instant('context.dictionary.dateUpdated'),
          type: 'date',
          cellFilter: momentFilter.getDateFilter(dateTimeFormatString),
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
      var containSearchStr = function (fieldset) {
        var propertiesToCheck = ['id', 'description', 'numOfFields', 'lastUpdated', 'publiclyAccessibleUI'];
        return _.some(propertiesToCheck, function (property) {
          var value = _.get(fieldset, property);
          if (value === undefined) {
            return false;
          }
          switch (property) {
            case 'numOfFields':
              value = value.toString();
              break;
            case 'lastUpdated':
              value = value.trim();
              if (value === '') {
                // can't match against empty string because that will create a date based on "now"
                return false;
              }
              value = moment(value).format(dateTimeFormatString);
              break;
            default:
              break;
          }
          value = value.toLowerCase();
          return _.includes(value, lowerStr);
        });
      };
      return $q.resolve(fieldsetList.filter(containSearchStr));
    }

    function getMaxFieldsetsAllowed() {
      PropertyService.getProperty(PropertyConstants.MAX_FIELDSETS_PROP_NAME, Authinfo.getOrgId())
        .then(function (value) {
          vm.maxFieldsetsAllowed = value;
        })
        .catch(function (err) {
          Log.error('unable to get max fieldsets allowed property', err);
        })
        .then(function () {
          return vm.maxFieldsetsAllowed;
        });
    }

    function getAdminAuthorizationStatus() {
      return ContextAdminAuthorizationService.getAdminAuthorizationStatus()
        .then(function (value) {
          vm.adminAuthorizationStatus = value;
        })
        .catch(function (err) {
          Log.error('unable to get admin authorization status', err);
        });
    }
  }
}());
