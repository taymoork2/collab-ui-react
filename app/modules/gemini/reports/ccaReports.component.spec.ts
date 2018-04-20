import testModule from './index';

describe('Component: ccaReports', () => {
  beforeAll(function () {
    this.reportChartData = {
      usage: {
        url: ['minute/meeting'],
        data: [{
          code: 0,
          unit: 'MILLIONS',
          chart: [
            {
              TRS: '4.00',
              time: 'Nov',
              AUO: '5.00',
              PRO: '3.00',
              point: '2016-11-01',
            },
            {
              TRS: '0.00',
              time: 'Dec',
              AUO: '0.00',
              PRO: '0.00',
              point: '2016-12-01',
            },
          ],
          title: 'TOTAL DATA MEETING MINUTES',
          type: 'column',
        }],
      },
    };
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies();

  });

  function initComponent(bindings) {
    this.compileComponent('ccaReports', bindings);
    this.$scope.$apply();
  }

  it('Should show report chart', function () {
    let bindings = { reportChartData: this.reportChartData };
    initComponent.call(this, bindings);

    expect(this.controller.loading).toBeDefined();

    bindings = { reportChartData: '' };
    initComponent.call(this, bindings);

    expect(this.controller.loading).toBeDefined();
  });
});
