'use strict';

/* global _ */

var getUrl = function () {
  var key = "hercules-url";
  var regex = new RegExp(key + "=([^&]*)");
  var match = window.location.search.match(regex);
  if (match && match.length == 2) {
    return decodeURIComponent(match[1]);
  } else {
    return 'https://hercules.hitest.huron-dev.com/v1/clusters';
  }
};

angular.module('Hercules')
  .service('ConnectorService', ['$http', 'ConnectorMock',
    function ConnectorService($http, mock) {

      var addMockData = window.location.href.indexOf('hercules-mock') != -1;

      var fetch = function (opts) {
        // return opts.success([]);
        // return opts.success(convertClusters(mock.mockData()));
        $http
          .get(getUrl())
          .success(function (data) {
            var converted = convertClusters(data);
            opts.success(converted);
          })
          .error(opts.error);
      };

      var convertConnectors = function (data) {
        return _.map(data, function (connector) {
          var c = _.cloneDeep(connector);

          c.status = c.status || {};
          c.status.state = c.status.state || 'unknown';

          if (c.status.alarms && c.status.alarms.length) {
            c.status.state = 'error';
          }

          switch (c.status.state) {
          case 'running':
            c.status_class = 'success';
            break;
          case 'disabled':
          case 'not_configured':
            c.status_class = 'default';
            break;
          default:
            c.status_class = 'danger';
          }
          return c;
        });
      };

      var upgradeSoftware = function (opts) {
        var url = getUrl() + '/' + opts.clusterId + '/services/' + opts.serviceType + '/upgrade';
        var data = JSON.stringify({
          tlp: opts.tlpUrl
        });
        $http
          .post(url, data)
          .success(opts.success)
          .error(opts.error);
      };

      var convertClusters = function (data) {
        var converted = _.map(data, function (origCluster) {
          var cluster = _.cloneDeep(origCluster);
          _.each(cluster.services, function (service) {
            service.running_hosts = 0;
            _.each(service.connectors, function (connector) {
              if ((connector.alarms && connector.alarms.length) || (connector.state != 'running' && connector.state != 'disabled')) {
                cluster.needs_attention = cluster.intially_open = true;
                service.needs_attention = true;
                service.is_disabled = false;
              }
              if (connector.state == 'disabled' && service.running_hosts == 0) {
                service.is_disabled = true;
              }
              if (connector.state == 'running') {
                service.is_disabled = false;
                service.running_hosts = ++service.running_hosts;
              }
            });
            if (cluster.provisioning_data && cluster.provisioning_data.not_approved_packages) {
              var not_approved_package = _.find(cluster.provisioning_data.not_approved_packages, function (pkg) {
                return pkg.service.service_type == service.service_type;
              });
              if (not_approved_package) {
                service.not_approved_package = not_approved_package;
              }
            }
          });
          cluster.services = _.sortBy(cluster.services, function (obj) {
            if (obj.needs_attention) return 1;
            if (obj.is_disabled) return 3;
            return 2;
          });
          return cluster;
        });
        return _.sortBy(converted, function (obj) {
          return !obj.needs_attention;
        });
      };

      return {
        /* public */
        fetch: fetch,
        upgradeSoftware: upgradeSoftware,

        /* private, for testing */
        _convertConnectors: convertConnectors,
        _convertClusters: convertClusters
      };
    }
  ]);
