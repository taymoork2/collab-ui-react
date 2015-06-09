'use strict';
/* global moment, $ */

angular.module('Squared')
  .controller('DevicesCtrlRedux',

    /* @ngInject */
    function ($scope, $state, $templateCache, $filter, CsdmService, CsdmConverter, XhrNotificationService) {
      var vm = this;

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
        rowTemplate: $templateCache.get('modules/squared/devicesRedux/_rowTpl.html'),

        columnDefs: [{
          width: 260,
          field: 'product',
          displayName: $filter('translate')('spacesPage.kindHeader'),
          cellTemplate: $templateCache.get('modules/squared/devicesRedux/_deviceCellTpl.html')
        }, {
          field: 'displayName',
          displayName: $filter('translate')('spacesPage.nameHeader'),
          cellTemplate: $templateCache.get('modules/squared/devicesRedux/_roomTpl.html')
        }, {
          field: 'readableState',
          displayName: $filter('translate')('spacesPage.statusHeader'),
          cellTemplate: $templateCache.get('modules/squared/devicesRedux/_statusTpl.html')
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
