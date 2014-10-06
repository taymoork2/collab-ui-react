'use strict';

describe('Service: ConnectorConverter', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Grouper;
  beforeEach(inject(function (_ConnectorGrouper_) {
    Grouper = _ConnectorGrouper_;
  }));

  var apiData = [
    {
      id: 228,
      cluster_id: null,
      serial: "1111",
      host_name: "localhost",
      version: "2.0.1",
      connector_type: "expressway_csi",
      display_name: "UCM Connector",
      provisioning_url: null,
      status_url: "https://hercules.ladidadi.org/v1/connector_statuses/95",
      organization_id: "1eb65fdf-9643-417f-9974-ad72cae0e10f",
      created_at: "2014-09-26T10:20:32.887Z",
      updated_at: "2014-09-26T10:20:32.947Z"
    },
    {
      id: 226,
      cluster_id: "no cluster id",
      serial: "0974F8FD",
      host_name: "gwydlvm1186",
      version: "X8.5PreAlpha0 (Test SW)",
      connector_type: "expressway_management_connector",
      display_name: "Management Connector",
      provisioning_url: "https://hercules.ladidadi.org/v1/management_connectors/18",
      status_url: "https://hercules.ladidadi.org/v1/connector_statuses/93",
      organization_id: "1eb65fdf-9643-417f-9974-ad72cae0e10f",
      created_at: "2014-09-26T10:10:19.235Z",
      updated_at: "2014-09-26T10:10:19.287Z"
    },
    {
      id: 227,
      cluster_id: "no cluster id",
      serial: "0974F8FD",
      host_name: "gwydlvm1186",
      version: "8.5-1.0",
      connector_type: "expressway_csi",
      display_name: "UCM Connector",
      provisioning_url: null,
      status_url: "https://hercules.ladidadi.org/v1/connector_statuses/94",
      organization_id: "1eb65fdf-9643-417f-9974-ad72cae0e10f",
      created_at: "2014-09-26T10:10:23.362Z",
      updated_at: "2014-09-26T10:10:23.411Z"
    }
  ]

  it('should convert connector data', function () {
    var converted = Grouper.groupBy(apiData, 'connector_type');
    expect(!!converted).toBe(true);
    expect(_.size(converted)).toBe(2);
    expect(_.size(converted.expressway_csi)).toBe(2);
    expect(_.size(converted.expressway_management_connector)).toBe(1);
  });

});
