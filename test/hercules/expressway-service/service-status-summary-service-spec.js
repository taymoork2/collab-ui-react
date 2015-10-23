'use strict';

describe('ServiceStatusSummaryService', function () {

  // load the service's module
  beforeEach(module('wx2AdminWebClientApp'));

  // instantiate service
  var Service;
  beforeEach(inject(function (_ServiceStatusSummaryService_) {
    Service = _ServiceStatusSummaryService_;
  }));

  it("internal cluster mock data is generated correctly", function () {
    var expected = {
      id: 0,
      services: [{
        service_type: "c_cal",
        connectors: [{
          state: "a"
        }, {
          state: "b"
        }, {
          state: "c"
        }]
      }]
    };

    var generated = createClusterMockWithConnectorStates("a", "b", "c");
    expect(JSON.stringify(expected) === JSON.stringify(generated)).toBe(true);
  });

  it("cluster state is 'running' when all hosts has service state 'running'", function () {
    var clusterMockData = createClusterMockWithConnectorStates("running", "running");
    var aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "running").toBe(true);
  });

  it("cluster state is 'alarm' if one or several hosts has service alarm", function () {
    var clusterMockData = {
      id: 0,
      services: [{
        service_type: "c_cal",
        connectors: [{
          state: "running"
        }, {
          alarms: [{
            alarm: "isRaised"
          }],
          state: "downloading"
        }, {
          state: "disabled"
        }]
      }]
    };
    var aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "alarm").toBe(true);
  });

  it('disabled higher pri than notconfigured', function () {
    var clusterMockData = createClusterMockWithConnectorStates("not_configured", "disabled");
    var aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "disabled").toBe(true);
    clusterMockData = createClusterMockWithConnectorStates("disabled", "not_configured");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "disabled").toBe(true);
  });

  it('notconfigured higher pri than software upgrade states', function () {
    var clusterMockData = createClusterMockWithConnectorStates("not_configured", "uninstalling");
    var aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "not_configured").toBe(true);
    clusterMockData = createClusterMockWithConnectorStates("not_configured", "downloading");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "not_configured").toBe(true);
    clusterMockData = createClusterMockWithConnectorStates("not_configured", "installing");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "not_configured").toBe(true);
    clusterMockData = createClusterMockWithConnectorStates("uninstalling", "not_configured");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "not_configured").toBe(true);
    clusterMockData = createClusterMockWithConnectorStates("downloading", "not_configured");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "not_configured").toBe(true);
    clusterMockData = createClusterMockWithConnectorStates("installing", "not_configured");
    aggregated = Service.clusterAggregatedStatus("c_cal", clusterMockData);
    expect(aggregated == "not_configured").toBe(true);
  });

  // Helper function to create cluster data
  var createClusterMockWithConnectorStates = function () {
    var connectorsArray = [];
    _.each(arguments, function (state) {
      connectorsArray.push({
        state: state
      });
    });

    return {
      id: 0,
      services: [{
        service_type: "c_cal",
        connectors: connectorsArray
      }]
    };
  };

});
