'use strict';

angular.module('Squared').service('CsdmPoller',

  /* @ngInject  */
  function ($interval, CsdmService) {

    var pollPromise, shouldPoll, pollDelay = 5000;

    var startPolling = function (callback) {
      shouldPoll = true;
      poll(callback);
    };

    var stopPolling = function () {
      shouldPoll = false;
      $interval.cancel(pollPromise);
    };

    var poll = function (callback) {
      if (pollPromise) $interval.cancel(pollPromise);
      if (!shouldPoll) return;

      CsdmService.fillCodesAndDevicesCache(function (err, devices) {
        if (callback) callback(err, devices);
        pollPromise = $interval(poll, pollDelay, 1);
      });
    };

    return {
      startPolling: startPolling,
      stopPolling: stopPolling,
      listCodesAndDevices: CsdmService.listCodesAndDevices
    };

  }
);
