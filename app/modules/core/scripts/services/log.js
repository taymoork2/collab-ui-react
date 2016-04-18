'use strict';

/* eslint no-console:0 */

angular.module('Core')
  .service('Log', ['$rootScope', '$location', 'Config',
    function ($rootScope, $location, Config) {
      var logKeepOnNavigate = Config.logConfig.keepOnNavigate;
      var logLinesToAttach = Config.logConfig.linesToAttach;

      var Log = function (type, msg, data) {
        console.error(Config.isE2E());
        if (enableLogging()) {
          if (!type) {
            type = 'log';
          }

          console[type](Log.formatter(msg, data));
          this.keepArchive(type, msg, data);
        }
      };

      if (localStorage.logArchive && logKeepOnNavigate) {
        $rootScope.logArchiveLines = JSON.parse(localStorage.logArchive);
      } else {
        $rootScope.logArchiveLines = [];
      }

      function enableLogging() {
        return $rootScope.debug || Config.isE2E();
      }

      Log.keepArchive = function (level, msg, data) {
        if ($rootScope.logArchiveLines.length >= logLinesToAttach) {
          $rootScope.logArchiveLines = $rootScope.logArchiveLines.splice(1);
        }

        var strLogEntry = level + '\t' + msg;
        if (data) {
          //TODO: consider shortening the data
          strLogEntry += '\t' + JSON.stringify(data);
        }

        $rootScope.logArchiveLines.push(strLogEntry);

        if (logKeepOnNavigate) {
          localStorage.logArchive = JSON.stringify($rootScope.logArchiveLines);
        }
      };

      Log.getArchiveUrlencoded = function () {
        var s = '';
        $rootScope.logArchiveLines.forEach(function (line) {
          s += encodeURIComponent(line + '\r\n');
        });
        // s = s.substr(0,1024*8);
        return s;
      };

      Log.formatter = function (msg, data) {
        var stacktrace = null;

        var ret = {
          msg: msg,
          tstamp: new Date(),
          stacktrace: stacktrace,
        };

        if (data) {
          ret.data = data;
        }
        return ret;
      };

      _.each(['debug', 'info', 'log', 'warn', 'error'], function (type) {
        Log[type] = _.partial(Log, type);
      });

      return Log;
    }
  ]);
