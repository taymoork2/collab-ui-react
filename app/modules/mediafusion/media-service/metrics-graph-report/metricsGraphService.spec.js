'use strict';

describe('Service: Metrics Graph Service', function () {
  var MetricsGraphService;
  // var callVolumeChart, availabilityChart;
  var validateService = {
    validate: function () {}
  };

  // var callVolumeData = getJSONFixture('mediafusion/json/metrics-graph-report/callVolumeGraphData.json');
  // var callVolumeData = angular.copy(callVolumeData.graphData);
  // var clusteravailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityGraphData.json');
  // var clusteravailabilityData = angular.copy(clusteravailabilityData.data);

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_MetricsGraphService_) {
    MetricsGraphService = _MetricsGraphService_;

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

  /*describe('Active Users graph services', function () {
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
  });*/

  /* describe('Active Users graph services', function () {
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
   });*/

});
