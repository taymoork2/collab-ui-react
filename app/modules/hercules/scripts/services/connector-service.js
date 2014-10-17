'use strict';

/* global _ */

var HERCULES_CONNECTOR_URL = 'https://hercules.ladidadi.org/v1/connectors';

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
            var decorated = decorate(data);
            opts.success(decorated);
          })
          .error(opts.error);
      };

      var decorate = function(data) {
        _.each(data, function(c) {
          c.status = c.status || {};
          c.status.state = c.status.state || 'unknown';
          if (c.status.alerts && c.status.alerts.length) {
            c.status.status = 'error';
          }
          c.status_code = c.status.status;
          switch (c.status.status) {
            case 'ok':      c.status_class = 'success'; break;
            case 'warning': c.status_class = 'warning'; break;
            default:        c.status_class = 'danger';
          }
        });
        return data;
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
        _decorate: decorate
      };
    }
  ]);

var mockData = [
  {
    "id": 228,
    "cluster_id": "foo",
    "serial": "1111",
    "host_name": "localhost",
    "version": "2.0.1",
    "connector_type": "expressway_csi",
    "provisioning_url": null,
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
