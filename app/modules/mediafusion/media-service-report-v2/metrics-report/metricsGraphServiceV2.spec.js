'use strict';

describe('Service: Metrics Graph Service V2', function () {
  var MetricsGraphServiceV2;
  var chartColors;
  var callVolumeChart, availabilityChart;
  var validateService = {
    validate: function () {}
  };

  var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');
  var clusteravailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityGraphData.json');

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_MetricsGraphServiceV2_, _chartColors_) {
    MetricsGraphServiceV2 = _MetricsGraphServiceV2_;
    chartColors = _chartColors_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(MetricsGraphServiceV2).toBeDefined();
  });

  it('setCallVolumeGraph should exist', function () {
    expect(MetricsGraphServiceV2.setCallVolumeGraph).toBeDefined();
  });

  it('setAvailabilityGraph should exist', function () {
    expect(MetricsGraphServiceV2.setAvailabilityGraph).toBeDefined();
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
    var displayHistorical = true;
    var setAvailabilityGraphResponse = MetricsGraphServiceV2.setAvailabilityGraph(data, availabilityChart, selectedCluster, cluster, daterange, displayHistorical);
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
      colorTwo: chartColors.grayLightTwo
    }];
    var callVolumeChart = {
      dataProvider: [],
      graphs: [],
      startDuration: ""
    };
    var cluster = "All Clusters";
    var daterange = "Last 24 Hours";
    var displayHistorical = true;
    var setCallVolumeGraphResponse = MetricsGraphServiceV2.setCallVolumeGraph(data, callVolumeChart, cluster, daterange, displayHistorical);
    expect(setCallVolumeGraphResponse.dataProvider).toEqual(
      [{
        baloon: "true",
        colorTwo: chartColors.grayLightTwo
      }]);
  });
  it('setCallVolumeGraph should return an amchart object successfully when callVolumeChart is unavailable', function () {
    var data = [{
      baloon: "true"
    }];
    var callVolumeChart = null;
    var cluster = "All Clusters";
    var daterange = "Last 24 Hours";
    var displayHistorical = true;
    var setCallVolumeGraphResponse = MetricsGraphServiceV2.setCallVolumeGraph(data, callVolumeChart, cluster, daterange, displayHistorical);
    expect(setCallVolumeGraphResponse.dataProvider).toEqual(
      [{
        baloon: "true"
      }]);
  });
  it('setUtilizationGraph should return an amchart object successfully', function () {
    var data = [{
      baloon: "false",
      colorTwo: chartColors.grayLightTwo
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
    var displayHistorical = true;
    var setUtilizationGraphResponse = MetricsGraphServiceV2.setUtilizationGraph(data, graphs, utilizationChart, cluster, daterange, displayHistorical);
    expect(setUtilizationGraphResponse.dataProvider).toEqual(
      [{
        baloon: "false",
        colorTwo: chartColors.grayLightTwo
      }]);
  });
  it('setUtilizationGraph should return an amchart object successfully when utilizationChart is unavailable', function () {
    var data = [{
      baloon: "false",
      colorTwo: chartColors.grayLightTwo
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
    var displayHistorical = false;
    var setUtilizationGraphResponse = MetricsGraphServiceV2.setUtilizationGraph(data, graphs, utilizationChart, cluster, daterange, displayHistorical);
    expect(setUtilizationGraphResponse.dataProvider).toEqual(
      [{
        baloon: "false",
        colorTwo: chartColors.grayLightTwo
      }]);
  });
  xdescribe('Active Users graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': callVolumeData,
        validateData: validateService.validate
      });
      callVolumeChart = null;
      callVolumeChart = MetricsGraphServiceV2.setCallVolumeGraph(callVolumeData, callVolumeChart);
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(validateService.validate).not.toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      MetricsGraphServiceV2.setCallVolumeGraph(callVolumeData, callVolumeChart);
      expect(validateService.validate).toHaveBeenCalled();
    });
  });
  xdescribe('Active Users graph services', function () {
    beforeEach(function () {
      spyOn(AmCharts, 'makeChart').and.returnValue({
        'dataProvider': clusteravailabilityData
      });
      availabilityChart = null;
      availabilityChart = MetricsGraphServiceV2.setAvailabilityGraph(clusteravailabilityData, availabilityChart, 'All');
    });

    it('should have created a graph when setActiveUsersGraph is called the first time', function () {
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(MetricsGraphServiceV2.createAvailabilityGraph).toHaveBeenCalled();
    });

    it('should update graph when setActiveUsersGraph is called a second time', function () {
      MetricsGraphServiceV2.setCallVolumeGraph(clusteravailabilityData, availabilityChart);
    });
  });

});
