(function () {
  'use strict';

  angular
    .module('Core')
    .controller('Devices2OverviewCtrl', Devices2OverviewCtrl);

  /* @ngInject */
  function Devices2OverviewCtrl($stateParams, $translate, Authinfo, DevicesService, Log) {
    /*jshint validthis: true */
    var vm = this;
    vm.currentEntity = $stateParams.currentEntity;
    vm.querydeviceslist = $stateParams.querydeviceslist;
    vm.active = false;
    vm.offline = true;
    vm.needsActivation = false;
    vm.diagEvents = [];

    function setActiveState() {
      vm.needsActivation = false;
      vm.active = false;
      vm.offline = false;
      vm.issuesDetected = false;
      if (vm.currentEntity.color === 'device-status-yellow') {
        vm.needsActivation = true;
      }
      if (vm.currentEntity.color === 'device-status-green') {
        vm.active = true;
      }
      if (vm.currentEntity.color === 'device-status-gray') {
        vm.offline = true;
      }
      if (vm.currentEntity.color === 'device-status-red') {
        vm.issuesDetected = true;
      }
    }

    setActiveState();

    function setupDiagnosticsDisplay() {
      vm.diagEvents = [];
      vm.software = '';
      vm.ip = '';
      if (vm.currentEntity.events && vm.currentEntity.events.length > 0) {
        for (var i = 0; i < vm.currentEntity.events.length; i++) {
          var event = vm.currentEntity.events[i];
          if (event.type.toLowerCase() === 'tcpfallback' && event.level.toLowerCase() != 'ok') {
            vm.diagEvents.push({
              'type': $translate.instant('spacesPage.videoQTitle'),
              'message': $translate.instant('spacesPage.videoQMsg')
            });
            vm.currentEntity.displayStatus = 'Issues Detected';
            vm.currentEntity.color = 'device-status-red';
          }
          if (event.type.toLowerCase() === 'software' && event.level.toLowerCase() === 'info') {
            vm.software = event.description;
          }
          if (event.type.toLowerCase() === 'ip' && event.level.toLowerCase() === 'info') {
            vm.ip = event.description;
          }
        }
      }
      setActiveState();
    }

    function getDiagnostics() {
      DevicesService.getEntity(vm.currentEntity.url, function (data, url, status, success) {
        if (success === true) {
          if (data.url === vm.currentEntity.url) {
            vm.currentEntity = data;
            if (vm.currentEntity.status !== undefined) {
              if (vm.currentEntity.status.connectionStatus === 'connected') {
                if (vm.currentEntity.status.level === 'ok') {
                  vm.currentEntity.color = 'device-status-green';
                  vm.currentEntity.displayStatus = 'online';
                } else {
                  vm.currentEntity.color = 'device-status-red';
                  vm.currentEntity.displayStatus = 'Issues Detected';
                }
              } else {
                vm.currentEntity.color = 'device-status-gray';
                vm.currentEntity.displayStatus = 'offline';
              }
            } else {
              vm.currentEntity.color = 'device-status-gray';
              vm.currentEntity.displayStatus = 'offline';
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
      getDiagnostics();
    }
  }
})();
