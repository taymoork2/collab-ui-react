'use strict';

describe('Service: Common Graph Service', function () {
  var CommonGraphService;
  var responseData = getJSONFixture('core/json/partnerReports/commonCustomerServiceResponses.json');
  var COLUMN = 'column';
  var LINE = 'line';
  var AXIS = 'axis';
  var LEGEND = 'legend';
  var NUMFORMAT = 'numFormat';
  var BALLOON = 'balloon';
  var EXPORT = 'export';
  var PREFIXES = 'prefixesOfBigNumbers';
  var dummyData = 'dummyData';

  beforeEach(module('Core'));
  beforeEach(inject(function (_CommonGraphService_) {
    CommonGraphService = _CommonGraphService_;
  }));

  it('should exist', function () {
    expect(CommonGraphService).toBeDefined();
  });

  describe('service responses:', function () {
    it('getBaseVariable should return expected responses based on the key', function () {
      // correct key responses
      expect(CommonGraphService.getBaseVariable(COLUMN)).toEqual(responseData.baseVariables[COLUMN]);
      expect(CommonGraphService.getBaseVariable(LINE)).toEqual(responseData.baseVariables[LINE]);
      expect(CommonGraphService.getBaseVariable(AXIS)).toEqual(responseData.baseVariables[AXIS]);
      expect(CommonGraphService.getBaseVariable(LEGEND)).toEqual(responseData.baseVariables[LEGEND]);
      expect(CommonGraphService.getBaseVariable(NUMFORMAT)).toEqual(responseData.baseVariables[NUMFORMAT]);
      expect(CommonGraphService.getBaseVariable(BALLOON)).toEqual(responseData.baseVariables[BALLOON]);
      expect(CommonGraphService.getBaseVariable(EXPORT)).toEqual(responseData.baseVariables[EXPORT]);
      expect(CommonGraphService.getBaseVariable(PREFIXES)).toEqual(responseData.baseVariables[PREFIXES]);

      // incorrect key response
      expect(CommonGraphService.getBaseVariable('col')).toEqual({});
    });

    it('getBaseSerialGraph should return expected defaults for a column graph', function () {
      responseData.getBaseSerialGraph[BALLOON] = responseData.baseVariables[BALLOON];
      responseData.getBaseSerialGraph[EXPORT] = responseData.baseVariables[EXPORT];
      responseData.getBaseSerialGraph[PREFIXES] = responseData.baseVariables[PREFIXES];
      expect(CommonGraphService.getBaseSerialGraph(dummyData, dummyData, dummyData, dummyData, dummyData, dummyData)).toEqual(responseData.getBaseSerialGraph);
    });

    it('getBasePieChart should return expected defaults for a pie chart', function () {
      responseData.getBasePieChart[BALLOON] = responseData.baseVariables[BALLOON];
      responseData.getBasePieChart[EXPORT] = responseData.baseVariables[EXPORT];
      expect(CommonGraphService.getBasePieChart(dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData)).toEqual(responseData.getBasePieChart);
    });
  });
});
