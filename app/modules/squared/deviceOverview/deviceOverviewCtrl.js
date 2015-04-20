(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceOverviewCtrl', DeviceOverviewCtrl);

  /* @ngInject */
  function DeviceOverviewCtrl($stateParams, $translate, Authinfo, SpacesService, Log) {
    /*jshint validthis: true */
    var vm = this;
    vm.currentDevice = $stateParams.currentDevice;
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

    if (vm.currentDevice.status === 'Active') {
      setActiveState();
    }

    if (vm.currentDevice.status === 'Needs Activation') {
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
      if (vm.currentDevice.events && vm.currentDevice.events.length > 0) {
        for (var i = 0; i < vm.currentDevice.events.length; i++) {
          var event = vm.currentDevice.events[i];
          if (event.type.toLowerCase() === 'tcpfallback' && event.level.toLowerCase() != 'ok') {
            vm.diagEvents.push({
              'type': $translate.instant('spacesPage.videoQTitle'),
              'message': $translate.instant('spacesPage.videoQMsg')
            });
            vm.currentDevice.status = 'Issues Detected';
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
      SpacesService.getDeviceStatus(vm.currentDevice.deviceUuid, 0, function (data, i, status) {
        if (data.success === true) {
          if (data.cisUuid === vm.currentDevice.deviceUuid) {
            vm.currentDevice.events = data.events;
            if (data.status === 'reachable') {
              vm.currentDevice.status = 'Active';
              setActiveState();
            } else {
              vm.currentDevice.status = 'Offline';
              setOffline();
            }
            setupDiagnosticsDisplay();
          } else {
            Log.error('wrong response');
          }
        } else {
          Log.error('Error getting device status. Status: ' + status);
        }
      });
    }

    if (!vm.needsActivation) {
      getDiagnosticsDevice();
    }
  }
})();
