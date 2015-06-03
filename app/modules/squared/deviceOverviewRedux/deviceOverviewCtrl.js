(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrlRedux', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($stateParams, $translate, Authinfo, CsdmService, Log) {
    /*jshint validthis: true */
    var vm = this;
    vm.currentDevice = $stateParams.currentDevice;
    vm.currentDeviceFormatted = JSON.stringify(vm.currentDevice, null, 2);
    vm.querydeviceslist = $stateParams.querydeviceslist;
    vm.active = false;
    vm.offline = true;
    vm.needsActivation = false;
    vm.diagEvents = [];
    setupDiagnosticsDisplay();

    function setActiveState() {
      vm.needsActivation = false;
      vm.active = true;
      vm.offline = false;
      vm.issuesDetected = false;
      vm.currentDevice.color = 'device-status-green';
    }

    function setActivation() {
      vm.needsActivation = true;
      vm.active = false;
      vm.offline = false;
      vm.issuesDetected = false;
      vm.currentDevice.color = 'device-status-yellow';
    }

    function setOffline() {
      vm.needsActivation = false;
      vm.active = false;
      vm.offline = true;
      vm.issuesDetected = false;
      vm.currentDevice.color = 'device-status-gray';
    }

    function setIssues() {
      vm.needsActivation = false;
      vm.active = false;
      vm.offline = false;
      vm.issuesDetected = true;
      vm.currentDevice.color = 'device-status-red';
    }

    if (vm.currentDevice.stateFormatted === 'Active') {
      setActiveState();
    }

    if (vm.currentDevice.stateFormatted === 'Needs Activation') {
      setActivation();
    }

    // TBD : merge with deviceCtrl.js to get one method for both pages
    function setupDiagnosticsDisplay() {
      vm.diagEvents = [];
      vm.software = '';
      vm.ip = '';
      if (vm.currentDevice.code && vm.currentDevice.code !== '') {
        setActivation();
      }
      if (vm.currentDevice.status && vm.currentDevice.status.events && vm.currentDevice.status.events.length > 0) {
        for (var i = 0; i < vm.currentDevice.status.events.length; i++) {
          var event = vm.currentDevice.status.events[i];
          if (event.type.toLowerCase() === 'tcpfallback' && event.level.toLowerCase() != 'ok') {
            vm.diagEvents.push({
              'type': $translate.instant('spacesPage.videoQTitle'),
              'message': $translate.instant('spacesPage.videoQMsg')
            });
            vm.currentDevice.stateFormatted = 'Issues Detected';
            setIssues();
          }
          if (event.type.toLowerCase() === 'software' && event.level.toLowerCase() === 'info') {
            vm.software = event.description;
          }
          if (event.type.toLowerCase() === 'ip' && event.level.toLowerCase() === 'info') {
            vm.ip = event.description;
          }
        }
      }
    }

    function getDiagnosticsDevice() {
      CsdmService.getDeviceStatus(vm.currentDevice.url, function (err, data) {
        if (err) {
          return Log.error('Error getting device status. Status: ' + err);
        }
        if (data.cisUuid === vm.currentDevice.deviceUuid) {
          vm.currentDevice.events = data.events;
          if (data.status === 'reachable') {
            vm.currentDevice.stateFormatted = 'Active';
            setActiveState();
          } else {
            vm.currentDevice.stateFormatted = 'Offline';
            setOffline();
          }
          setupDiagnosticsDisplay();
        } else {
          Log.error('Wrong response LOL');
        }
      });
    }

    if (!vm.needsActivation) {
      getDiagnosticsDevice();
    }
  }
})();
