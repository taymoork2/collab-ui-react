'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('DevicesCtrlRedux',

    /* @ngInject */
    function ($scope, $state, $templateCache, $filter, CsdmPoller, CsdmConverter, XhrNotificationService) {
      var vm = this;

      // filter stuff

      $scope.currentFilter = '';

      $scope.filters = [{
        count: 0,
        name: 'All',
        filterValue: 'all'
      }, {
        count: 0,
        name: 'Active',
        filterValue: 'devices'
      }, {
        count: 0,
        name: 'Inactive',
        filterValue: 'codes'
      }];

      $scope.placeholder = {
        count: 0,
        name: 'All',
        filterValue: ''
      };

      $scope.count = '';

      $scope.search = function (query) {
        $scope.currentSearch = query.toLowerCase();
        updateListAndFilter();
      };

      $scope.setFilter = function (filter) {
        $scope.currentFilter = filter.toLowerCase();
        updateListAndFilter();
      };

      // todo: this file is untested!!

      var getTemplate = function (name) {
        return $templateCache.get('modules/squared/devicesRedux/templates/' + name + '.html');
      };

      var updateListAndFilter = function (data) {
        var converted = CsdmConverter.convert(data || CsdmPoller.listCodesAndDevices());

        vm.roomData = getFilteredList(converted);

        $scope.filters[1].count = _.filter(converted, function (item) {
          return !item.needsActivation && matchesSearch(item);
        }).length;

        $scope.filters[2].count = _.filter(converted, function (item) {
          return item.needsActivation && matchesSearch(item);
        }).length;

        $scope.filters[0].count = $scope.filters[1].count + $scope.filters[2].count;
      };

      var getFilteredList = function (data) {
        return _.filter(data, function (item) {
          return matchesSearch(item) && matchesFilter(item);
        });
      };

      var matchesSearch = function (item) {
        return item.displayName.toLowerCase().indexOf($scope.currentSearch || '') != -1;
      };

      var matchesFilter = function (item) {
        switch ($scope.currentFilter) {
        case 'all':
          return true;
        case 'codes':
          return item.needsActivation;
        case 'devices':
          return !item.needsActivation;
        default:
          return true;
        }
      };

      CsdmPoller.startPolling(function (err, data) {
        vm.dataLoaded = true;
        if (err) return XhrNotificationService.notify(err);
      });

      $scope.$on('$destroy', function () {
        CsdmPoller.stopPolling();
      });

      $scope.$watchCollection(CsdmPoller.listCodesAndDevices, function (data) {
        updateListAndFilter(data);
      });

      vm.gridOptions = {
        data: 'sc.roomData',
        rowHeight: 75,
        showFilter: false,
        multiSelect: false,
        headerRowHeight: 44,
        sortInfo: {
          directions: ['asc'],
          fields: ['displayStatus']
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
        // fixme: this state is needed by modals... :/
        vm.currentDevice = device;

        $state.go('device-overview-redux', {
          currentDevice: device
        });
      };

    }
  );
