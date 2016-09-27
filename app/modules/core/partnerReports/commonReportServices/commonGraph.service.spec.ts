describe('Service: Common Graph Service', () => {
  let responseData = getJSONFixture('core/json/partnerReports/commonGraphService.json');
  const CURSOR = 'cursor';
  const COLUMN = 'column';
  const LINE = 'line';
  const AXIS = 'axis';
  const LEGEND = 'legend';
  const NUMFORMAT = 'numFormat';
  const BALLOON = 'balloon';
  const EXPORT = 'export';
  const PREFIXES = 'prefixesOfBigNumbers';
  const dummyData = 'dummyData';
  let exportResponse = responseData.baseVariables[EXPORT];

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('CommonGraphService');

    exportResponse.menu[0].menu[1].click = Function;
  });

  it('getBaseVariable should return expected responses based on the key', function () {
    // correct key responses
    expect(this.CommonGraphService.getBaseVariable(CURSOR)).toEqual(responseData.baseVariables[CURSOR]);
    expect(this.CommonGraphService.getBaseVariable(COLUMN)).toEqual(responseData.baseVariables[COLUMN]);
    expect(this.CommonGraphService.getBaseVariable(LINE)).toEqual(responseData.baseVariables[LINE]);
    expect(this.CommonGraphService.getBaseVariable(AXIS)).toEqual(responseData.baseVariables[AXIS]);
    expect(this.CommonGraphService.getBaseVariable(LEGEND)).toEqual(responseData.baseVariables[LEGEND]);
    expect(this.CommonGraphService.getBaseVariable(NUMFORMAT)).toEqual(responseData.baseVariables[NUMFORMAT]);
    expect(this.CommonGraphService.getBaseVariable(BALLOON)).toEqual(responseData.baseVariables[BALLOON]);
    expect(this.CommonGraphService.getBaseVariable(PREFIXES)).toEqual(responseData.baseVariables[PREFIXES]);

    let exportVariable = this.CommonGraphService.getBaseVariable(EXPORT);
    exportVariable.menu[0].menu[1].click = Function;
    expect(exportVariable).toEqual(exportResponse);

    // incorrect key response
    expect(this.CommonGraphService.getBaseVariable('col')).toEqual(undefined);
  });

  it('getBaseSerialGraph should return expected defaults for a column graph', function () {
    responseData.getBaseSerialGraph[BALLOON] = responseData.baseVariables[BALLOON];
    responseData.getBaseSerialGraph[EXPORT] = exportResponse;
    responseData.getBaseSerialGraph[PREFIXES] = responseData.baseVariables[PREFIXES];

    let baseSerialGraph = this.CommonGraphService.getBaseSerialGraph(dummyData, dummyData, dummyData, dummyData, dummyData, dummyData);
    baseSerialGraph.export.menu[0].menu[1].click = Function;
    expect(baseSerialGraph).toEqual(responseData.getBaseSerialGraph);
  });

  it('getBasePieChart should return expected defaults for a pie chart', function () {
    responseData.getBasePieChart[BALLOON] = responseData.baseVariables[BALLOON];
    responseData.getBasePieChart[EXPORT] = responseData.baseVariables[EXPORT];

    let basePiechart = this.CommonGraphService.getBasePieChart(dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData, dummyData);
    basePiechart.export.menu[0].menu[1].click = Function;
    expect(basePiechart).toEqual(responseData.getBasePieChart);
  });
});
