'use strict';

//Defining a utilizationService.
angular.module('Mediafusion')
  .service('MetricsService', MetricsService);

/* @ngInject */
function MetricsService($http, $rootScope, Config, Authinfo, Log, Utils, Auth, UrlConfig) {

  //Fetching the Base url form config.js file.
  var searchfilter = 'filter=%s';
  var baseUrl = UrlConfig.getMetricsServiceUrl();

  var metricsService = {

    queryMetricsList: function (pgNo, callback) {

      /*  var data = {};
        data.metrics = [{
          metrictype: "CollectD",
          hostname: "Bgl-1334",
          systemtype: "CMS",
          counters: "Cpu.nice"
        }, {
          metrictype: "rtmt",
          hostname: "bgl11.cisco.com",
          systemtype: "MF",
          counters: "Cpu.idle"
        }];

        data.success = true;
        callback(data, true);*/

      var metricsListUrl = Utils.sprintf(baseUrl + '/threshold/metrics', [Authinfo.getOrgId()]);

      //Actual rest call to get meeting info from server and also error case is handeled.
      $http.get(metricsListUrl)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          data.status = status;
          callback(data, status);
        })
        .error(function (data, status) {
          data = data || {};
          data.success = false;
          data.status = status;
          callback(data, status);
          var description = null;
          var errors = data.Errors;
          if (errors) {
            description = errors[0].description;
          }
        });
    }

  };

  return metricsService;

}
