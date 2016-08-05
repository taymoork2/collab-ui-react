'use strict';

describe('Service: Common  Metrics Graph Service', function () {
  var CommonMetricsGraphService;
  var responseData = getJSONFixture('mediafusion/json/metrics-graph-report/commonMetricsGraphServiceResponse.json');
  var COLUMN = 'column';
  var LINE = 'line';
  var AXIS = 'axis';
  var LEGEND = 'legend';
  var NUMFORMAT = 'numFormat';
  var SMOOTHLINED = 'smoothedLine';
  var GUIDEAXIS = 'guideaxis';
  var BALLOON = 'balloon';
  var EXPORT = 'export';
  var PREFIXES = 'prefixesOfBigNumbers';
  var dummyData = 'dummyData';

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_CommonMetricsGraphService_) {
    CommonMetricsGraphService = _CommonMetricsGraphService_;
  }));

  it('should exist', function () {
    expect(CommonMetricsGraphService).toBeDefined();
  });

  describe('service responses:', function () {
    it('getBaseVariable should return expected responses based on the key', function () {
      // correct key responses
      expect(CommonMetricsGraphService.getBaseVariable(COLUMN)).toEqual(responseData.baseVariables[COLUMN]);
      expect(CommonMetricsGraphService.getBaseVariable(LINE)).toEqual(responseData.baseVariables[LINE]);
      expect(CommonMetricsGraphService.getBaseVariable(AXIS)).toEqual(responseData.baseVariables[AXIS]);
      expect(CommonMetricsGraphService.getBaseVariable(LEGEND)).toEqual(responseData.baseVariables[LEGEND]);
      expect(CommonMetricsGraphService.getBaseVariable(NUMFORMAT)).toEqual(responseData.baseVariables[NUMFORMAT]);
      expect(CommonMetricsGraphService.getBaseVariable(BALLOON)).toEqual(responseData.baseVariables[BALLOON]);
      expect(CommonMetricsGraphService.getBaseVariable(EXPORT)).toEqual(responseData.baseVariables[EXPORT]);
      expect(CommonMetricsGraphService.getBaseVariable(PREFIXES)).toEqual(responseData.baseVariables[PREFIXES]);
      //expect(CommonMetricsGraphService.getBaseVariable(SMOOTHLINED)).toEqual(responseData.baseVariables[SMOOTHLINED]);
      //expect(CommonMetricsGraphService.getBaseVariable(GUIDEAXIS)).toEqual(responseData.baseVariables[GUIDEAXIS]);

      // incorrect key response
      expect(CommonMetricsGraphService.getBaseVariable('col')).toEqual({});
    });

    it('getBaseStackSerialGraph should return expected defaults for a column graph', function () {
      responseData.getBaseStackSerialGraph[BALLOON] = responseData.baseVariables[BALLOON];
      //responseData.getBaseStackSerialGraph[EXPORT] = responseData.baseVariables[EXPORT];
      responseData.getBaseStackSerialGraph[PREFIXES] = responseData.baseVariables[PREFIXES];
      expect(CommonMetricsGraphService.getBaseStackSerialGraph(dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData)).toEqual(responseData.getBaseStackSerialGraph);
    });

    it('getGanttGraph should return expected defaults for a pie chart', function () {
      //responseData.getGanttGraph[BALLOON] = responseData.baseVariables[BALLOON];
      responseData.getGanttGraph[EXPORT] = responseData.baseVariables[EXPORT];
      expect(CommonMetricsGraphService.getGanttGraph(dummyData, dummyData, dummyData)).toEqual(responseData.getGanttGraph);
    });
  });

});
