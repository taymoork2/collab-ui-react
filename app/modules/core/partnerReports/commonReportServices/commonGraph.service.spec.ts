import reportServices from './index';

describe('Service: Common Graph Service', () => {
  beforeEach(function () {
    this.initModules(reportServices);
    this.injectDependencies('CommonGraphService');

    this.json = _.cloneDeep(getJSONFixture('core/json/partnerReports/commonGraphService.json'));
    this.dummyData = 'dummyData';
    _.forEach(this.json.keys, (key: string): void => {
      this[key] = key;
    });
  });

  it('getBaseVariable should return expected responses based on the key', function () {
    // correct key responses
    _.forEach(this.json.keys, (key: string): void => {
      expect(this.CommonGraphService.getBaseVariable(key)).toEqual(this.json.baseVariables[key]);
    });

    // incorrect key response
    expect(this.CommonGraphService.getBaseVariable('col')).toEqual(undefined);
  });

  it('getBaseSerialGraph should return expected defaults for a column graph', function () {
    this.json.getBaseSerialGraph[this.balloon] = this.json.baseVariables[this.balloon];
    this.json.getBaseSerialGraph[this.export] = this.json.baseVariables[this.export];

    let baseSerialGraph = this.CommonGraphService.getBaseSerialGraph(this.dummyData, this.dummyData, this.dummyData, this.dummyData, this.dummyData, this.dummyData);
    expect(baseSerialGraph).toEqual(this.json.getBaseSerialGraph);
  });

  it('getBasePieChart should return expected defaults for a pie chart', function () {
    this.json.getBasePieChart[this.balloon] = this.json.baseVariables[this.balloon];
    this.json.getBasePieChart[this.export] = this.json.baseVariables[this.export];

    let basePiechart = this.CommonGraphService.getBasePieChart(this.dummyData, this.dummyData, this.dummyData, this.dummyData, this.dummyData, this.dummyData, this.dummyData, this.dummyData, this.dummyData, this.dummyData);
    expect(basePiechart).toEqual(this.json.getBasePieChart);
  });
});
