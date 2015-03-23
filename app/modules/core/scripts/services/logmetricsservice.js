'use strict';
/* global moment */

angular.module('Core')
  .service('LogMetricsService', ['$rootScope', '$http', 'Authinfo', 'Config', 'Log', 'Storage', 'Auth',
    function ($rootScope, $http, Authinfo, Config, Log, Storage, Auth) {

      function LogMetricEvent(eventAction, eventType, status, elapsedTime, units) {
        this.logStatus = status;
        this.eventAction = eventAction;
        this.eventType = eventType;
        this.units = units;
        this.time = moment().utc().format();
        this.elapsedTime = elapsedTime;
      }

      return {
        eventAction: {
          buttonClick: 'BUTTONCLICK',
          pageLoad: 'PAGELOAD',
          keyInputs: 'KEYINPUTS'
        },

        eventType: {
          inviteUsers: 'INVITEUSERS',
          partnerLogin: 'PARTNERLOGIN',
          partnerCustomersPage: 'PARTNERCUSTOMERSPAGE',
          trialPage: 'TRIALPAGE',
          trialDidPage: 'TRIALDIDPAGE',
          trialDidEntered: 'TRIALDIDENTERED',
          trialStarted: 'TRIALSTARTED'
        },

        getEventAction: function (eAction) {
          return this.eventAction[eAction];
        },

        getEventType: function (eType) {
          return this.eventType[eType];
        },

        logMetrics: function (msg, eType, eAction, status, startLog, units) {
          var metricUrl = Config.getLogMetricsUrl();
          var events = [];
          Log.debug(msg);

          if (eType !== undefined && eAction !== undefined) {
            var endLog = moment();
            var timeDiff = moment(endLog, 'DD/MM/YYYY HH:mm:ss').diff(moment(startLog, 'DD/MM/YYYY HH:mm:ss'));
            var elapsedTime = moment().milliseconds(timeDiff).milliseconds();

            events[0] = new LogMetricEvent(eAction, eType, status, elapsedTime, units);
            var logsMetricEvent = {
              metrics: events
            };
            Log.debug(logsMetricEvent);

            if (Config.isProd()) {
              $http.post(metricUrl, logsMetricEvent);
            }
          } else {
            Log.error('Invalid eventAction/eventType.');
          }
        }

      };
    }
  ]);
