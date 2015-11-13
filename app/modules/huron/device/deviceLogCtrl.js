(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DeviceLogCtrl', DeviceLogCtrl);

  /* @ngInject */
  function DeviceLogCtrl($scope, $q, $interval, $stateParams, $translate, Notification, DeviceLogService) {
    var vm = this;
    vm.logList = [];
    vm.currentUser = $stateParams.currentUser;
    vm.device = $stateParams.device;
    vm.retrieveLog = retrieveLog;
    vm.refreshLogList = refreshLogList;
    vm.viewPreviousLog = viewPreviousLog;
    vm.isPolling = isPolling;
    vm.interval = 5000; //5 seconds
    vm.timeout = 600000; //10 minutes
    vm.eventTimeout = 0;
    vm.active = false;
    vm.error = false;
    vm.loading = false;

    var LOG_SUCCESS = 'success';
    var EVT_SUCCESS = 'success';
    var TIMEOUT_PREFIX = 2 * vm.interval;

    var pollingList = [];

    ////////// Function Definitions ///////////////////////////////////////
    function retrieveLog() {
      resetState();
      vm.loading = true;
      //The eventTimeout is needed for multiple calls of this method.
      //Multiple calls without timeout will cause a false positive of the previous call
      vm.eventTimeout = TIMEOUT_PREFIX + Date.now();
      DeviceLogService.retrieveLog(vm.currentUser.id, vm.device.uuid)
        .then(function (response) {
          vm.active = true;
          return refreshLogList();
        })
        .catch(function (response) {
          Notification.errorResponse(response);
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    function viewPreviousLog() {
      vm.active = true;
      vm.eventTimeout = vm.interval + Date.now();
      refreshLogList();
    }

    function refreshLogList() {
      return DeviceLogService.getLogInformation(vm.currentUser.id, vm.device.uuid)
        .then(function (response) {
          vm.logList = [];
          //build log list
          var logs = response;
          if (!Array.isArray(logs) || logs.length < 1) {
            Notification.error('deviceDetailPage.errorLogInvaidMsg');
            return;
          }
          angular.forEach(logs, function (log) {
            if (vm.eventTimeout < Date.now()) {
              if (log.status === LOG_SUCCESS) {
                addLogList(log);
                removePolling(log.trackingId);
              } else {
                if (log.events.length === 0) {
                  Notification.error();
                  removePolling(log.trackingId);
                  resetState('deviceDetailPage.errorLogNotFound');
                }
              }
            } else {
              addPolling(log.trackingId);
            }
          });
        })
        .catch(function (response) {
          Notification.errorResponse(response);
          //stop polling
          removeAllPolling();
        });
    }

    function isPolling() {
      return (pollingList.length > 0);
    }

    function resetState() {
      vm.active = false;
      vm.error = false;
      vm.loading = false;
    }

    function getFilename(url) {
      var pathArray = url.split('/');
      if (Array.isArray(pathArray) && pathArray.length > 0 && pathArray[pathArray.length - 1].length > 0) {
        return pathArray[pathArray.length - 1];
      }
      return $translate.instant('deviceDetailPage.unknownFilename');
    }

    function addLogList(logEntry) {
      var log = findLogInLogList(logEntry.trackingId);
      if (!angular.isDefined(log)) {
        log = {};
        log.trackingId = logEntry.trackingId;

        var length = logEntry.events.length;
        for (var i = 0; i < length; i++) {
          var event = logEntry.events[i];
          if (event.status === EVT_SUCCESS) {
            log.uri = logEntry.results;
            log.name = event.date;
            log.filename = getFilename(log.uri);
            vm.logList.push(log);
            return;
          }
        }
      }
    }

    function findLogInLogList(trackingId) {
      var length = vm.logList.length;
      for (var i = 0; i < length; i++) {
        var log = vm.logList[i];
        if (log.trackingId === trackingId) {
          return log;
        }
      }
      return undefined;
    }

    function fnInterval(poll) {
      if (poll.timeout > Date.now()) {
        refreshLogList();
      } else {
        removePolling(poll.trackingId);
        vm.error = true;
      }
    }

    function addPolling(trackingId) {
      var length = pollingList.length;
      var poll;
      var now = Date.now();

      //verify tracking Id is not already polling
      for (var i = 0; i < length; i++) {
        poll = pollingList[i];
        if (poll.trackingId === trackingId) {
          return;
        }
      }

      poll = {};
      poll.trackingId = trackingId;
      poll.timeout = now + vm.timeout;
      poll.intervalId = $interval(function () {
        fnInterval(poll);
      }, vm.interval);
      pollingList.push(poll);
    }

    function removePolling(trackingId) {
      var length = pollingList.length;
      var poll;
      for (var i = 0; i < length; i++) {
        poll = pollingList[i];
        if (poll.trackingId === trackingId) {
          if (angular.isDefined(poll.intervalId)) {
            $interval.cancel(poll.intervalId);
          }
          pollingList.splice(i, 1);
          return;
        }
      }
    }

    function removeAllPolling() {
      var poll;
      while (pollingList.length !== 0) {
        poll = pollingList.pop();
        if (angular.isDefined(poll.intervalId)) {
          $interval.cancel(poll.intervalId);
        }
      }
    }

    $scope.$on('$destroy', function () {
      removeAllPolling();
    });

  }
})();
