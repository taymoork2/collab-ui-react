'use strict';

angular.module('Squared')
  .controller('DevicesCleanupCtrl',

    /* @ngInject */
    function ($scope, $state, $window, $templateCache, DeviceFilter, CsdmCodeService, CsdmDeviceService, AddDeviceModal) {
      var dc = this;

      dc.codesListSubscription = CsdmCodeService.subscribe(angular.noop, {
        scope: $scope
      });

      dc.deviceListSubscription = CsdmDeviceService.subscribe(angular.noop, {
        scope: $scope
      });

      dc.updateList = function () {
        var filtered = _.chain({})
          .extend(CsdmDeviceService.getDeviceList())
          .extend(CsdmCodeService.getCodeList())
          .values()
          .value();
        return DeviceFilter.getFilteredList(filtered);
      };

      dc.deleteSelected = function () {
        _.each(dc.gridOptions.$gridScope.selectedItems, function (deviceOrCode) {
          if (deviceOrCode.needsActivation) {
            return CsdmCodeService.deleteCode(deviceOrCode);
          } else {
            return CsdmDeviceService.deleteDevice(deviceOrCode.url);
          }
        });
        dc.gridOptions.$gridScope.selectedItems.length = 0;
      };

      dc.exportToCsv = function () {
        var fields = ['cisUuid', 'displayName', 'needsActivation', 'readableState', 'readableActivationCode', 'ip', 'mac', 'serial', 'software'];
        var csv = fields.join(';') + '\r\n';
        _.each(dc.updateList(), function (item) {
          _.each(fields, function (field) {
            csv += (item[field] || '') + ';';
          });
          csv += '\r\n';
        });
        $window.open('data:text/csv;charset=utf-8,' + $window.encodeURIComponent(csv));
      };

      dc.gridOptions = {
        data: 'dc.updateList()',
        rowHeight: 75,
        showFilter: false,
        multiSelect: true,
        headerRowHeight: 44,
        sortInfo: {
          directions: ['asc'],
          fields: ['displayName']
        },
        rowTemplate: getTemplate('_rowTpl'),

        columnDefs: [{
          field: 'displayName',
          displayName: 'Belongs to',
          cellTemplate: getTemplate('_nameTpl'),
          sortFn: sortFn
        }, {
          field: 'readableState',
          displayName: 'Status',
          cellTemplate: getTemplate('_statusTpl'),
          sortFn: sortFn
        }, {
          field: 'product',
          displayName: 'Type',
          cellTemplate: getTemplate('_productTpl'),
          sortFn: sortFn
        }]
      };

      function getTemplate(name) {
        return $templateCache.get('modules/squared/devicesRedux/templates/' + name + '.html');
      }

      function sortFn(a, b) {
        if (a && a.localeCompare) {
          return a.localeCompare(b);
        }
        return 1;
      }

    }
  );
