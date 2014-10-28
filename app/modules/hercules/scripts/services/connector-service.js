'use strict';

/* global _ */

var HERCULES_CONNECTOR_URL = 'http://hercules.cfa-hitest.huron-alpha.com/v1/connectors';

angular.module('Hercules')
  .service('ConnectorService', ['$http',
    function ConnectorService($http) {

      var addMockData = window.location.href.indexOf('hercules-mock') != -1;

      var fetch = function(opts) {
        $http
          .get(HERCULES_CONNECTOR_URL)
          .success(function (data) {
            if (addMockData) {
              data = data.concat(mockData);
            }
            var decorated = convert(data);
            opts.success(decorated);
          })
          .error(opts.error);
      };

      var convert = function(data) {
        return _.map(data, function(connector) {
          var c = _.cloneDeep(connector);
          c.status = c.status || {};
          c.version = c.version || 'unknown';
          c.cluster_id = c.cluster_id || 'unknown';
          c.status.state = c.status.state || 'unknown';
          c.display_name = c.display_name || c.connector_type;
          if (c.status.alerts && c.status.alerts.length) {
            c.status.status = 'error';
          }
          c.status_code = c.status.status;
          switch (c.status.status) {
            case 'ok':      c.status_class = 'success'; break;
            case 'warning': c.status_class = 'warning'; break;
            default:        c.status_class = 'danger';
          }
          return c;
        });
      };

      var aggregateStatus = function(data) {
        var aggregated_status = {};
        _.each(data, function(c) {
          aggregated_status[c.status_class] = ++aggregated_status[c.status_class] || 1;
        });
        return aggregated_status;
      };

      return {
        /* public */
        fetch: fetch,
        aggregateStatus: aggregateStatus,

        /* private, for testing */
        _convert: convert
      };
    }
  ]);

var mockData = [
  {
    "id": 228,
    "cluster_id": "foo",
    "serial": "1111",
    "host_name": "localhost",
    "connector_type": "expressway_csi",
    "provisioning_url": null,
    "display_name": "Telephony",
    "status_url": "https://hercules.ladidadi.org/v1/connector_statuses/95",
    "organization_id": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
    "created_at": "2014-09-26T10:20:32.887Z",
    "updated_at": "2014-09-26T10:20:32.947Z",
    "registered_by": null,
    "status": {
      "state": "running",
      "status": "ok"
    }
  },
  {
    "id": 249,
    "cluster_id": "example3.com",
    "serial": "12345",
    "host_name": "hostname2.cisco.com",
    "version": "1.9.8",
    "display_name": "Fusion Management Service",
    "connector_type": "expressway_management_connector",
    "provisioning_url": "https://hercules.ladidadi.org/v1/management_connectors/22",
    "status_url": "https://hercules.ladidadi.org/v1/connector_statuses/116",
    "organization_id": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
    "created_at": "2014-10-13T07:19:39.234Z",
    "updated_at": "2014-10-13T07:19:39.447Z",
    "registered_by": null,
    "status": null
  },
  {
    "id": 226,
    "cluster_id": "no cluster id",
    "serial": "0974F8FD",
    "host_name": "gwydlvm1186",
    "version": "69",
    "display_name": "Fusion Management Service",
    "connector_type": "expressway_management_connector",
    "provisioning_url": "https://hercules.ladidadi.org/v1/management_connectors/18",
    "status_url": "https://hercules.ladidadi.org/v1/connector_statuses/93",
    "organization_id": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
    "created_at": "2014-09-26T10:10:19.235Z",
    "updated_at": "2014-09-26T10:10:19.287Z",
    "registered_by": null,
    "status": {
      "state": "stopped",
      "status": "error"
    }
  },
  {
    "id": 227,
    "cluster_id": "no cluster id",
    "serial": "0974F8FD",
    "host_name": "gwydlvm1186",
    "version": "8.5-1.0",
    "connector_type": "expressway_csi",
    "display_name": "Telephony",
    "provisioning_url": null,
    "status_url": "https://hercules.ladidadi.org/v1/connector_statuses/94",
    "organization_id": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
    "created_at": "2014-09-26T10:10:23.362Z",
    "updated_at": "2014-09-26T10:10:23.411Z",
    "registered_by": null,
    "status": {
      "state": "installed",
      "status": "ok",
      "alerts": [{}]
    }
  }
];
