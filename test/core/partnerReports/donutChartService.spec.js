'use strict';

describe('Service: Donut Chart Service', function () {
  var DonutChartService;
  var donutChart = null;
  var validateService = {
    validateNow: function (varOne, varTwo) {}
  };
  var processedCallMetricsData = {
    dataProvider: [{
      "callCondition": "Fail",
      "numCalls": 1
    }, {
      "callCondition": "Poor Media",
      "numCalls": 6
    }, {
      "callCondition": "Successful",
      "numCalls": 93
    }],
    labelData: {
      "numTotalCalls": 100,
      "numTotalMinutes": 299
    }
  };

  beforeEach(module('Core'));

  beforeEach(inject(function (_DonutChartService_) {
    DonutChartService = _DonutChartService_;

    spyOn(AmCharts, 'makeChart').and.returnValue({
      'dataProvider': processedCallMetricsData,
      validateNow: validateService.validateNow
    });
    spyOn(validateService, 'validateNow');
  }));

  it('should exist', function () {
    expect(DonutChartService).toBeDefined();
  });

  describe('Call Metrics', function () {
    beforeEach(function () {
      donutChart = DonutChartService.createCallMetricsDonutChart(processedCallMetricsData);
    });

    it('should have created a donut chart', function () {
      expect(donutChart).not.toBe(null);
      expect(donutChart.dataProvider).not.toBe(null);
      expect(donutChart.allLabels).not.toBe(null);
    });

    it('should update with the same data', function () {
      DonutChartService.updateCallMetricsDonutChart(processedCallMetricsData, donutChart);
      expect(donutChart).not.toBe(null);
      expect(donutChart.dataProvider).not.toBe(null);
      expect(donutChart.allLabels).not.toBe(null);
    });
  });

});
