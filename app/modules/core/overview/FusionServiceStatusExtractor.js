'use strict';

angular.module('Core')
  .service('ServiceStatusDecriptor', ['$http', 'ConfigService', 'Authinfo', '$q',
    function ServiceStatusDecriptor($http, config, Authinfo, $q) {

      var servicesInOrg = function (orgId) {
        return $http
          .get(config.getUrl() + '/organizations/' + orgId)
          .then(extractConnectors);
      };

      function extractConnectors(res) {

        if (res.data && res.data.clusters) {

          var result = {
            connectors: _.chain(res.data.clusters).pluck('connectors').flatten().value(),
            status: _.chain(res.data.clusters)
              .pluck('connectors')
              .flatten()
              .groupBy('type')
              .mapValues(
                function (v) {
                  return _.all(v, function (x) {
                    return x.operational;
                  });
                })
              .value()
          };

          return result;
        }
        return [];
      }

      var servicesInOrgWithStatus = function () {
        return servicesInOrg(Authinfo.getOrgId());
      };

      return {
        servicesInOrgWithStatus: servicesInOrgWithStatus
      };
    }
  ]);
