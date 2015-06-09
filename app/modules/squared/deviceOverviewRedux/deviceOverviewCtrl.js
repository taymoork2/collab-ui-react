(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrlRedux', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($stateParams, $translate, Authinfo, CsdmService, Log) {
    var vm = this;

    vm.currentDevice = $stateParams.currentDevice;

    // todo: port stuff below

    // // TBD : merge with deviceCtrl.js to get one method for both pages
    // function setupDiagnosticsDisplay() {
    //   vm.diagEvents = [];
    //   vm.software = '';
    //   vm.ip = '';
    //   if (vm.currentDevice.code && vm.currentDevice.code !== '') {
    //     setActivation();
    //   }
    //   if (vm.currentDevice.status && vm.currentDevice.status.events && vm.currentDevice.status.events.length > 0) {
    //     for (var i = 0; i < vm.currentDevice.status.events.length; i++) {
    //       var event = vm.currentDevice.status.events[i];
    //       if (event.type.toLowerCase() === 'tcpfallback' && event.level.toLowerCase() != 'ok') {
    //         vm.diagEvents.push({
    //           'type': $translate.instant('spacesPage.videoQTitle'),
    //           'message': $translate.instant('spacesPage.videoQMsg')
    //         });
    //         vm.currentDevice.readableState = 'Issues Detected';
    //         setIssues();
    //       }
    //       if (event.type.toLowerCase() === 'software' && event.level.toLowerCase() === 'info') {
    //         vm.software = event.description;
    //       }
    //       if (event.type.toLowerCase() === 'ip' && event.level.toLowerCase() === 'info') {
    //         vm.ip = event.description;
    //       }
    //     }
    //   }
    // }

    // todo: is this different from the status in the list?

    // function getDiagnosticsDevice() {
    //   CsdmService.getDeviceStatus(vm.currentDevice.url, function (err, data) {
    //     if (err) {
    //       return Log.error('Error getting device status. Status: ' + err);
    //     }
    //     if (data.cisUuid === vm.currentDevice.deviceUuid) {
    //       vm.currentDevice.events = data.events;
    //       if (data.status === 'reachable') {
    //         vm.currentDevice.readableState = 'Active';
    //         setActiveState();
    //       } else {
    //         vm.currentDevice.readableState = 'Offline';
    //         setOffline();
    //       }
    //       setupDiagnosticsDisplay();
    //     } else {
    //       Log.error('Wrong response LOL');
    //     }
    //   });
    // }

    // if (!vm.needsActivation) {
    //   // todo: needed? 
    //   // getDiagnosticsDevice();
    // }
  }
})();
