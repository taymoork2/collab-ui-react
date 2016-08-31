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
  var exportResponse = responseData.baseVariables[EXPORT];
  exportResponse.menu[0].menu[1].click = Function;

  beforeEach(angular.mock.module('Core'));
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
      var exportVariable = CommonGraphService.getBaseVariable(EXPORT);
      exportVariable.menu[0].menu[1].click = Function;
      expect(exportVariable).toEqual(exportResponse);
      expect(CommonGraphService.getBaseVariable(PREFIXES)).toEqual(responseData.baseVariables[PREFIXES]);

      // incorrect key response
      expect(CommonGraphService.getBaseVariable('col')).toEqual({});
    });

    it('getBaseSerialGraph should return expected defaults for a column graph', function () {
      responseData.getBaseSerialGraph[BALLOON] = responseData.baseVariables[BALLOON];
      responseData.getBaseSerialGraph[EXPORT] = exportResponse;
      responseData.getBaseSerialGraph[PREFIXES] = responseData.baseVariables[PREFIXES];

      var baseSerialGraph = CommonGraphService.getBaseSerialGraph(dummyData, dummyData, dummyData, dummyData, dummyData, dummyData);
      baseSerialGraph.export.menu[0].menu[1].click = Function;
      expect(baseSerialGraph).toEqual(responseData.getBaseSerialGraph);
    });

    it('getBasePieChart should return expected defaults for a pie chart', function () {
      responseData.getBasePieChart[BALLOON] = responseData.baseVariables[BALLOON];
      responseData.getBasePieChart[EXPORT] = responseData.baseVariables[EXPORT];

      var basePiechart = CommonGraphService.getBasePieChart(dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData);
      basePiechart.export.menu[0].menu[1].click = Function;
      expect(basePiechart).toEqual(responseData.getBasePieChart);
    });
  });
});
