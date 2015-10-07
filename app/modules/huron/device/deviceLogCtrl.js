(function () {
  'use strict';

  angular
    .module('uc.device')
    .controller('DeviceLogCtrl', DeviceLogCtrl);

  /* @ngInject */
  function DeviceLogCtrl($scope, $q, $interval, $stateParams, DeviceLogService) {
    var dlc = this;
    dlc.logList = [];
    dlc.currentUser = $stateParams.currentUser;
    dlc.retrieveLog = retrieveLog;
    dlc.refreshLogList = refreshLogList;
    dlc.interval = 5000; //5 seconds
    dlc.timeout = 600000; //10 minutes

    var LOG_SUCCESS = 'complete';
    var EVT_SUCCESS = 'success';

    var pollingList = [];

    ////////// Function Definitions ///////////////////////////////////////
    function retrieveLog(customerId, userId, sipEndpointId) {
      DeviceLogService.retrieveLog(customerId, userId, sipEndpointId)
        .then(function (response) {
          refreshLogList(customerId, userId, sipEndpointId);
        })
        .catch(function (response) {
          //TODO: handle error with notification
        });
    }

    function refreshLogList(customerId, userId, sipEndpointId) {
      return DeviceLogService.getLogInformation(customerId, userId, sipEndpointId)
        .then(function (response) {
          //build log list
          var logs = response;
          if (logs.length < 1) {
            //TODO: handle error with notification
            return;
          }
          angular.forEach(logs, function (log) {
            if (log.status === LOG_SUCCESS) {
              addLogList(log);
              removePolling(log.trackingId);
            } else {
              addPolling(log.trackingId, customerId, userId, sipEndpointId);
            }
          });
        })
        .catch(function (response) {
          //TODO: handle error with notification
        });
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
            log.uri = event.uri;
            log.name = event.date;
            dlc.logList.push(log);
            return;
          }
        }
        //no event status success
        //TODO: Error or Start polling?
      }
    }

    function findLogInLogList(trackingId) {
      var length = dlc.logList.length;
      for (var i = 0; i < length; i++) {
        var log = dlc.logList[i];
        if (log.trackingId === trackingId) {
          return log;
        }
      }
      return undefined;
    }

    function fnInterval(poll) {
      if (poll.timeout > Date.now()) {
        refreshLogList(poll.customerId, poll.userId, poll.sipEndpointId);
      } else {
        removePolling(poll.trackingId);
      }
    }

    function addPolling(trackingId, customerId, userId, sipEndpointId) {
      var length = pollingList.length;
      var poll;

      //verify tracking Id is not already polling
      for (var i = 0; i < length; i++) {
        poll = pollingList[i];
        if (poll.trackingId === trackingId) {
          return;
        }
      }
      poll = {};
      poll.trackingId = trackingId;
      poll.customerId = customerId;
      poll.userId = userId;
      poll.sipEndpointId = sipEndpointId;
      poll.timeout = Date.now() + dlc.timeout;
      poll.intervalId = $interval(function () {
        fnInterval(poll);
      }, dlc.interval);
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
