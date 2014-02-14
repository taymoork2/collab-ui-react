'use strict';

angular.module('wx2AdminWebClientApp')
  .service('Log', function Log($rootScope, $location) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    //var Log = {};

    var enableLogging = function() {
      return $rootScope.debug && !$location.search().disableLogging;
    };

    Log.formatter = function(msg, data) {
      var stacktrace = null;

      try {
        //stacktrace = printStackTrace();
      } catch (exception) {
        stacktrace = exception;
      }

      var ret = {
        'msg': msg,
        'tstamp': new Date(),
        'stacktrace': stacktrace,
      };

      if (data) {
        ret.data = data;
      }
      return ret;
    };

    Log.debug = function(msg, data) {
      if (enableLogging()) {
        console.debug(Log.formatter(msg, data));
      }
    };

    Log.info = function(msg, data) {
      if (enableLogging()) {
        console.info(Log.formatter(msg, data));
      }
    };

    Log.warn = function(msg, data) {
      if (enableLogging()) {
        console.warn(Log.formatter(msg, data));
      }
    };

    Log.error = function(msg, data) {
      if (enableLogging()) {
        console.error(Log.formatter(msg, data));
      }
    };

    return Log;
  });
