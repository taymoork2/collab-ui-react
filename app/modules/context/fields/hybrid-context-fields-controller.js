require('./_fields-list.scss');
var momentFilter = require('../filters/momentFilter').Moment;

(function () {
  'use strict';

  var PropertyConstants = require('modules/context/services/context-property-service').PropertyConstants;

  angular
    .module('Context')
    .controller('HybridContextFieldsCtrl', HybridContextFieldsCtrl);

  /* @ngInject */
  function HybridContextFieldsCtrl($scope, $rootScope, $state, $translate, Log, LogMetricsService, $q, ContextFieldsService, Notification, PropertyService, Authinfo, FieldUtils) {
    var dateTimeFormatString = 'LL';
    var vm = this;
    var eventListeners = [];

    vm.load = true;
    vm.fetchFailed = false;
    vm.currentDataPosition = 0;
    vm.gridRefresh = false;
    vm.noSearchesYet = true;
    vm.noSearchResults = false;
    vm.fieldsList = {
      allFields: [],
    };
    vm.showNew = false;
    vm.maxFieldsAllowed = PropertyConstants.MAX_FIELDS_DEFAULT_VALUE;
    vm.maxLimitReachedTooltip = $translate.instant('context.dictionary.fieldPage.limitReached');

    vm.filterBySearchStr = filterBySearchStr;
    vm.filterList = filterList;

    vm.placeholder = {
      name: $translate.instant('common.search'),
      filterValue: '',
      count: 0,
    };

    vm.searchStr = '';

    vm.createField = function () {
      LogMetricsService.logMetrics('Opened create field modal', LogMetricsService.getEventType('contextNewField'), LogMetricsService.getEventAction('buttonClick'), 200, moment(), 1);
      $state.go('context-field-modal', {
        existingFieldIds: _.map(vm.fieldsList.allFields, function (field) {
          return field.id;
        }),
        callback: function (newField) {
          var fieldCopy = _.cloneDeep(newField);
          vm.fieldsList.allFields.unshift(processField(fieldCopy));
          checkFieldsLimit();
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

      $q.all(promises)
        .then(function () {
          initializeListeners();
          return getFieldList();
        });
    }

    function initializeListeners() {
      // if the side panel is closing unselect the entry
      eventListeners.push($rootScope.$on('$stateChangeSuccess', function () {
        if ($state.includes('fields')) {
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

    function processField(field) {
      var searchableMap = {
        true: $translate.instant('common.yes'),
        false: $translate.instant('common.no'),
      };

      var classificationMap = {
        ENCRYPTED: $translate.instant('context.dictionary.fieldPage.encrypted'),
        UNENCRYPTED: $translate.instant('context.dictionary.fieldPage.unencrypted'),
        PII: $translate.instant('context.dictionary.fieldPage.piiEncrypted'),
      };

      // searchable is a string, so even "false" is truthy. if searchable has a value already, get boolean value
      // default to true if not provided
      if (_.isString(field.searchable)) {
        field.searchable = field.searchable.trim().toLowerCase() === 'true';
      } else if (_.isBoolean(field.searchable)) {
        field.searchable = field.searchable;
      } else {
        field.searchable = true;
      }
      field.searchableUI = searchableMap[field.searchable] || $translate.instant('common.yes');

      field.dataTypeUI = FieldUtils.getDataType(field);

      field.classificationUI = classificationMap[field.classification] || $translate.instant('context.dictionary.fieldPage.unencrypted');

      var accessibleMap = {
        true: $translate.instant('context.dictionary.base'),
        false: Authinfo.getOrgName(),
      };

      field.publiclyAccessibleUI = accessibleMap[field.publiclyAccessible];

      return field;
    }

    function processFieldList(fieldList) {
      return _.map(fieldList, processField);
    }

    function getFieldList() {
      if (!vm.load) {
        return $q.resolve();
      }
      vm.gridRefresh = true;
      vm.noSearchesYet = false;
      vm.fieldsList.allFields = [];
      var getAndProcessFieldsPromise = ContextFieldsService.getFields()
        .then(processFieldList)
        .then(function (processedFields) {
          vm.gridOptions.data = processedFields;
          vm.fieldsList.allFields = processedFields;
          vm.noSearchResults = processedFields.length === 0;
        })
        .catch(function (err) {
          Log.debug('CS fields search failed. Status: ' + err);
          Notification.error('context.dictionary.fieldPage.fieldReadFailed');
          vm.fetchFailed = true;
        });

      var promises = {
        getAndProcessFieldsPromise: getAndProcessFieldsPromise,
        getMaxFieldsAllowed: getMaxFieldsAllowed(),
      };

      return $q.all(promises)
        .then(function () {
          vm.gridApi.infiniteScroll.dataLoaded();
          checkFieldsLimit();
        })
        .finally(function () {
          vm.gridRefresh = false;
          vm.load = false;
        });
    }

    function checkFieldsLimit() {
      var customFields = vm.fieldsList.allFields.filter(function (field) {
        return _.get(field, 'publiclyAccessibleUI', '').toLowerCase() !== 'cisco';
      });

      vm.showNew = customFields.length < vm.maxFieldsAllowed;
    }

    function initializeGrid() {
      var deferred = $q.defer();

      function onRegisterApi(gridApi) {
        vm.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $state.go('context-fields-sidepanel', {
            field: row.entity,
            process: processField,
            callback: function (updatedField) {
              vm.gridRefresh = true;
              var index = _.findIndex(vm.fieldsList.allFields, function (current) {
                return current.id === updatedField.id;
              });
              if (index > -1) {
                var fieldCopy = processField(_.cloneDeep(updatedField));
                _.fill(vm.fieldsList.allFields, fieldCopy, index, index + 1);
                vm.gridOptions.data = vm.fieldsList.allFields;
                //need to select the row to reopen the side panel to update the view of side panel
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
            getFieldList();
          }
        });
        deferred.resolve();
      }

      vm.gridOptions = {
        // data: [], // is populated directly by the functions supplying the data.
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
          displayName: $translate.instant('context.dictionary.fieldPage.fieldId'),
          maxWidth: 300,
        }, {
          field: 'description',
          displayName: $translate.instant('common.description'),
        }, {
          field: 'dataTypeUI',
          displayName: $translate.instant('context.dictionary.fieldPage.dataType'),
          maxWidth: 200,
        }, {
          field: 'classificationUI',
          displayName: $translate.instant('context.dictionary.fieldPage.classification'),
          maxWidth: 200,
        }, {
          field: 'searchableUI',
          displayName: $translate.instant('context.dictionary.fieldPage.searchable'),
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
      vm.searchStr = str;
      return filterBySearchStr(vm.fieldsList.allFields, str)
        .then(function (processedFields) {
          vm.gridOptions.data = processedFields;
          vm.noSearchResults = processedFields.length === 0;
          vm.placeholder.count = processedFields.length;
        });
    }

    //filter out the list by the searchStr
    function filterBySearchStr(fieldList, str) {
      if (!str) {
        return $q.resolve(fieldList);
      }

      var lowerStr = str.toLowerCase();
      var containSearchString = function (field) {
        var propertiesToCheck = ['id', 'description', 'dataTypeUI', 'searchableUI', 'classificationUI', 'lastUpdated', 'publiclyAccessibleUI'];
        return _.some(propertiesToCheck, function (property) {
          var value = field[property];
          if (value === undefined) {
            return false;
          }

          if (property === 'lastUpdated') {
            value = value.trim();
            if (value === '') {
              // can't match against empty string because that will create a date based on "now"
              return false;
            }
            value = moment(value).format(dateTimeFormatString).toLowerCase();
          }
          value = value.toLowerCase();
          return _.includes(value, lowerStr);
        });
      };
      return $q.resolve(fieldList.filter(containSearchString));
    }

    function getMaxFieldsAllowed() {
      return PropertyService.getProperty(PropertyConstants.MAX_FIELDS_PROP_NAME, Authinfo.getOrgId())
        .then(function (value) {
          vm.maxFieldsAllowed = value;
        })
        .catch(function (err) {
          Log.error('unable to get max fields allowed property', err);
        })
        .then(function () {
          return vm.maxFieldsAllowed;
        });
    }
  }
}());
