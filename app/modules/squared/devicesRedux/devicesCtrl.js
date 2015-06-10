'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('DevicesCtrlRedux',

    /* @ngInject */
    function ($scope, $state, $templateCache, $filter, CsdmService, CsdmConverter, XhrNotificationService) {
      var vm = this;

      var getTemplate = function (name) {
        return $templateCache.get('modules/squared/devicesRedux/templates/' + name + '.html');
      };

      CsdmService.fillCodesAndDevicesCache(function (err, data) {
        vm.dataLoaded = true;
        if (err) return XhrNotificationService.notify(err);
      });

      $scope.$watchCollection(CsdmService.listCodesAndDevices, function (data) {
        vm.roomData = CsdmConverter.convert(data) || [];
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
