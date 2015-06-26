'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('DevicesCtrlRedux',

    /* @ngInject */
    function ($scope, $state, $templateCache, $filter, CsdmEventStream, CsdmConverter, XhrNotificationService, DeviceFilter) {
      var vm = this;

      // todo: this file is untested!!

      $scope.count = '';
      $scope.currentFilter = '';
      $scope.filters = DeviceFilter.getFilters();

      $scope.search = function (query) {
        DeviceFilter.setCurrentSearch(query);
        updateListAndFilter();
      };

      $scope.setFilter = function (filter) {
        DeviceFilter.setCurrentFilter(filter);
        updateListAndFilter();
      };

      var updateListAndFilter = function (data) {
        var converted = CsdmConverter.convert(data);
        vm.roomData = DeviceFilter.getFilteredList(converted);
        vm.dataLoaded = true;
      };

      vm.subscription = CsdmEventStream.subscribe(updateListAndFilter, {
        scope: $scope
      });

      var getTemplate = function (name) {
        return $templateCache.get('modules/squared/devicesRedux/templates/' + name + '.html');
      };

      vm.gridOptions = {
        data: 'sc.roomData',
        rowHeight: 75,
        showFilter: false,
        multiSelect: false,
        headerRowHeight: 44,
        sortInfo: {
          directions: ['asc'],
          fields: ['readableState', 'displayName']
        },
        rowTemplate: getTemplate('_rowTpl'),

        columnDefs: [{
          width: 260,
          field: 'displayName',
          displayName: 'Belongs to',
          cellTemplate: getTemplate('_nameTpl')
        }, {
          field: 'readableState',
          displayName: 'Status',
          cellTemplate: getTemplate('_statusTpl')
        }, {
          field: 'product',
          displayName: 'Type',
          cellTemplate: getTemplate('_productTpl')
        }]
      };

      vm.showDeviceDetails = function (device) {
        vm.currentDevice = device; // fixme: modals depend on state set here
        $state.go('device-overview-redux', {
          currentDevice: device
        });
      };

    }
  );
