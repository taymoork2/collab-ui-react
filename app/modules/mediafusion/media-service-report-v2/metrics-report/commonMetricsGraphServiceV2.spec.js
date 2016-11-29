'use strict';

describe('Service: Common  Metrics Graph Service V2', function () {
  var CommonMetricsGraphServiceV2;
  var responseData = getJSONFixture('mediafusion/json/metrics-graph-report/newCommonMetricsGraphServiceResponse.json');
  var COLUMN = 'column';
  var LINE = 'line';
  var AXIS = 'axis';
  var LEGEND = 'legend';
  var NUMFORMAT = 'numFormat';
  var BALLOON = 'balloon';
  var EXPORT = 'export';
  var PREFIXES = 'prefixesOfBigNumbers';
  var dummyData = 'dummyData';
  var CHARTSCROLLBAR = 'chartScrollbar';
  var VALUESCROLLBAR = 'valueScrollbar';

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_CommonMetricsGraphServiceV2_) {
    CommonMetricsGraphServiceV2 = _CommonMetricsGraphServiceV2_;
  }));

  it('should exist', function () {
    expect(CommonMetricsGraphServiceV2).toBeDefined();
  });

  describe('service responses:', function () {
    it('getBaseVariable should return expected responses based on the key', function () {
      // correct key responses
      expect(CommonMetricsGraphServiceV2.getBaseVariable(COLUMN)).toEqual(responseData.baseVariables[COLUMN]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(LINE)).toEqual(responseData.baseVariables[LINE]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(AXIS)).toEqual(responseData.baseVariables[AXIS]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(LEGEND)).toEqual(responseData.baseVariables[LEGEND]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(NUMFORMAT)).toEqual(responseData.baseVariables[NUMFORMAT]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(BALLOON)).toEqual(responseData.baseVariables[BALLOON]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(EXPORT)).toEqual(responseData.baseVariables[EXPORT]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(PREFIXES)).toEqual(responseData.baseVariables[PREFIXES]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(CHARTSCROLLBAR)).toEqual(responseData.baseVariables[CHARTSCROLLBAR]);
      expect(CommonMetricsGraphServiceV2.getBaseVariable(VALUESCROLLBAR)).toEqual(responseData.baseVariables[VALUESCROLLBAR]);

      // incorrect key response
      expect(CommonMetricsGraphServiceV2.getBaseVariable('col')).toEqual({});
    });

    it('getBaseStackSerialGraph should return expected defaults for a column graph', function () {
      responseData.getBaseStackSerialGraph[BALLOON] = responseData.baseVariables[BALLOON];
      responseData.getBaseStackSerialGraph[PREFIXES] = responseData.baseVariables[PREFIXES];
      expect(CommonMetricsGraphServiceV2.getBaseStackSerialGraph(dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData)).toEqual(responseData.getBaseStackSerialGraph);
    });

    it('getGanttGraph should return expected defaults for a pie chart', function () {
      expect(CommonMetricsGraphServiceV2.getGanttGraph(dummyData, dummyData, dummyData, dummyData, dummyData)).toEqual(responseData.getGanttGraph);
    });
  });

});
