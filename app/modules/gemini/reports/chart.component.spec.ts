import testModule from './index';

describe('Component: custChart', () => {
  beforeAll(function () {
    this.provideData = {
      data: {
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
        type: 'test',
      },
      title: 'TOTAL DATA MEETING MINUTES',
      type: 'test',
    };
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('SearchService', '$timeout');
    initSpies.apply(this);
  });

  function initComponent(bindings) {
    this.compileComponent('ccaChart', bindings);
    this.$scope.$apply();
  }
  function initSpies() {
    spyOn(this.SearchService, 'getStorage').and.returnValue(this.provideData);
  }
  it('Should show report chart', function () {

    this.$timeout.flush();
    const bindings = { provideData: this.provideData };
    initComponent.call(this, bindings);
    this.$timeout.flush();

    expect(this.controller.title).toEqual('TOTAL DATA MEETING MINUTES (IN MILLIONS)');
  });
});
