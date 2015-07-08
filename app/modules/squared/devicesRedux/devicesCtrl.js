'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('DevicesCtrlRedux',

    /* @ngInject */
    function ($scope, $state, $templateCache, DeviceFilter, CodeListService, DeviceListService, CsdmCodeService, CsdmDeviceService) {
      var vm = this;

      vm.deviceFilter = DeviceFilter;

      vm.codesListSubscription = CodeListService.subscribe(angular.noop, {
        scope: $scope
      });

      vm.deviceListSubscription = DeviceListService.subscribe(angular.noop, {
        scope: $scope
      });

      vm.updateListAndFilter = function () {
        var filtered = _.chain({})
          .extend(CsdmDeviceService.getDeviceList())
          .extend(CsdmCodeService.getCodeList())
          .values()
          .uniq('cisUuid')
          .value();
        return DeviceFilter.getFilteredList(filtered);
      };

      vm.gridOptions = {
        data: 'sc.updateListAndFilter()',
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

      function getTemplate(name) {
        return $templateCache.get('modules/squared/devicesRedux/templates/' + name + '.html');
      }

    }
  );
