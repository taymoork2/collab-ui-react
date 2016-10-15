'use strict';

describe('Service: Metrics Graph Service', function () {
  var MetricsGraphService;
  var chartColors;
  var callVolumeChart, availabilityChart;
  var validateService = {
    validate: function () {}
  };

  var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');
  //var callVolumeData = angular.copy(callVolumeData.graphData);
  var clusteravailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityGraphData.json');
  //var clusteravailabilityData = angular.copy(clusteravailabilityData.data);

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_MetricsGraphService_, _chartColors_) {
    MetricsGraphService = _MetricsGraphService_;
    chartColors = _chartColors_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(MetricsGraphService).toBeDefined();
  });

  it('setCallVolumeGraph should exist', function () {
    expect(MetricsGraphService.setCallVolumeGraph).toBeDefined();
  });

  it('setAvailabilityGraph should exist', function () {
    expect(MetricsGraphService.setAvailabilityGraph).toBeDefined();
  });

  it('setAvailabilityGraph should return an amchart object successfully', function () {
    var data = {
      data: [
        {
          period: "mm",
          clusterCategories: [
            {
              category: "Seong_Cluster",
              segments: []
            }
          ],
          startTime: "2016-09-20T10:20:14Z",
          endTime: "2016-09-21T10:20:14Z"
        }
      ]
    };
    var availabilityChart = {
      period: "",
      startDate: ""
    };
    var selectedCluster = "All Clusters";
    var cluster = "All Clusters";
    var daterange = "Last 24 Hours";
    var setAvailabilityGraphResponse = MetricsGraphService.setAvailabilityGraph(data, availabilityChart, selectedCluster, cluster, daterange);
    expect(setAvailabilityGraphResponse.dataProvider).toEqual(
      [
        {
          "category": "Seong_Cluster",
          "segments": []
        }
      ]);
  });

  it('setCallVolumeGraph should return an amchart object successfully', function () {
    var data = [{
      baloon: "true",
      colorTwo: chartColors.dummyGray
    }];
    var callVolumeChart = {
      dataProvider: [],
      graphs: [],
      startDuration: ""
    };
    var cluster = "All Clusters";
    var daterange = "Last 24 Hours";
    var setCallVolumeGraphResponse = MetricsGraphService.setCallVolumeGraph(data, callVolumeChart, cluster, daterange);
    expect(setCallVolumeGraphResponse.dataProvider).toEqual(
      [{
        baloon: "true",
        colorTwo: chartColors.dummyGray
      }]);
  });
  it('setCallVolumeGraph should return an amchart object successfully when callVolumeChart is unavailable', function () {
    var data = [{
      baloon: "true"
    }];
    var callVolumeChart = null;
    var cluster = "All Clusters";
    var daterange = "Last 24 Hours";
    var setCallVolumeGraphResponse = MetricsGraphService.setCallVolumeGraph(data, callVolumeChart, cluster, daterange);
    expect(setCallVolumeGraphResponse.dataProvider).toEqual(
      [{
        baloon: "true"
      }]);
  });
  it('setUtilizationGraph should return an amchart object successfully', function () {
    var data = [{
      baloon: "false",
      colorTwo: chartColors.dummyGray
    }];
    var graphs = [{
      title: "graphTitle",
      valueField: "graphValue"
    }];
    var utilizationChart = {
      dataProvider: [],
      graphs: [],
      startDuration: "",
      balloon: {
        enabled: false
      },
      chartCursor: {
        valueLineBalloonEnabled: false,
        valueLineEnabled: false,
        categoryBalloonEnabled: false
      },
      validateData: function () {
        return true;
      }
    };
    var cluster = "All Clusters";
    var daterange = {
      label: "Last 24 Hours",
      value: "0"
    };
    var setUtilizationGraphResponse = MetricsGraphService.setUtilizationGraph(data, graphs, utilizationChart, cluster, daterange);
    expect(setUtilizationGraphResponse.dataProvider).toEqual(
      [{
        baloon: "false",
        colorTwo: chartColors.dummyGray
      }]);
  });
  it('setUtilizationGraph should return an amchart object successfully when utilizationChart is unavailable', function () {
    var data = [{
      baloon: "false",
      colorTwo: chartColors.dummyGray
    }];
    var graphs = [{
      title: "graphTitle",
      valueField: "graphValue"
    }];
    var utilizationChart = null;
    var cluster = "All Clusters";
    var daterange = {
      label: "Last 24 Hours",
      value: "0"
    };
    var setUtilizationGraphResponse = MetricsGraphService.setUtilizationGraph(data, graphs, utilizationChart, cluster, daterange);
    expect(setUtilizationGraphResponse.dataProvider).toEqual(
      [{
        baloon: "false",
        colorTwo: chartColors.dummyGray
      }]);
  });
  xdescribe('Active Users graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': callVolumeData,
        validateData: validateService.validate
      });
      callVolumeChart = null;
      callVolumeChart = MetricsGraphService.setCallVolumeGraph(callVolumeData, callVolumeChart);
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      MetricsGraphService.setCallVolumeGraph(callVolumeData, callVolumeChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });
  xdescribe('Active Users graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': clusteravailabilityData
           //validateData: validateService.validate
      });
      availabilityChart = null;
      availabilityChart = MetricsGraphService.setAvailabilityGraph(clusteravailabilityData, availabilityChart, 'All');
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(MetricsGraphService.createAvailabilityGraph).toHaveBeenCalled();
       //expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      MetricsGraphService.setCallVolumeGraph(clusteravailabilityData, availabilityChart);
       //expect(validateService.validate).toHaveBeenCalled();
    });
  });

});
