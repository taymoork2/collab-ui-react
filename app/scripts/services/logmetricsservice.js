'use strict';

angular.module('wx2AdminWebClientApp')
  .service('LogMetricsService', ['$http', 'Authinfo', 'Config', 'Log', 'Storage',
    function($http, Authinfo, Config, Log, Storage) {

      var token = Storage.get('accessToken');

      function LogMetricEvent(eventAction, eventType, status, elapsedTime, units) {
        this.logStatus = status;
        this.eventAction = eventAction;
        this.eventType = eventType;
        this.units = units;
        this.time = moment().utc().format();
        this.elapsedTime = elapsedTime;
      }

      return {
        eventAction: {buttonClick:'BUTTONCLICK',
                      pageLoad:'PAGELOAD'},
                      
        eventType: {inviteUsers:'INVITEUSERS'},

        getEventAction: function(eAction){
          return this.eventAction[eAction];
        },

        getEventType: function(eType){
          return this.eventType[eType];
        },

        logMetrics : function(msg, eType, eAction, status, startLog, units) {
          var metricUrl = Config.getLogMetricsUrl();
          var events = [];
          Log.debug(msg);

          if (eType !== undefined && eAction !== undefined) {
            var endLog = moment();
            var timeDiff = moment(endLog,"DD/MM/YYYY HH:mm:ss").diff(moment(startLog,"DD/MM/YYYY HH:mm:ss"));
            var elapsedTime = moment().milliseconds(timeDiff).milliseconds();

            events[0] = new LogMetricEvent(eAction, eType, status, elapsedTime, units);
            var logsMetricEvent = {metrics: events};
            Log.debug(logsMetricEvent);

            if (Config.isProd()) {
              $http.defaults.headers.common.Authorization = 'Bearer ' + token;
              $http.post(metricUrl, logsMetricEvent)
                .success(function(data, status) {
                  data.success = true;
                  data.status = status;
                })
                .error(function(data, status) {
                  data.success = false;
                  data.status = status;
                });
            }
          }
          else {
            Log.error("Invalid eventAction/eventType.");
          }
        }

      };
    }
  ]);
