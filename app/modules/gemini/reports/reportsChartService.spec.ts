import testModule from './index';

describe('Service: ReportsChartService', () => {

  beforeAll(function () {
    this.chartData = {
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
    };
    this.csvChartData = {
      title: 'TOTAL DATA MEETING MINUTES',
      type: 'test',
      data: this.chartData,
    };
    this.getkPIData = [{
      name: 'hostGrowth',
      value: '98',
    }, {
      name: 'meetingGrowth',
      value: '908',
    }];
  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$q', 'ReportsChartService', 'UrlConfig', '$httpBackend', '$translate');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get correct data when call getFilterData', function () {
    const mockData = [
      {
        orgId: '8af97b8f5003289e01504f980e3d0001',
        orgName: 'Intercall (Annuity) - West',
        spAccountId: '24601056',
        accounts: [
          {
            accountId: '10001617928',
            accountName: '247 CUSTOMER INC',
            sites: [
              {
                siteId: '313885',
                siteUrl: '247inc.webex.com',
                meetingTypes: [
                  {
                    name: 'AUO',
                    type: 'AUO',
                  },
                ],
              },
            ],
          },
        ],
      }];
    const url = `${this.UrlConfig.getGeminiUrl()}scorecard/accounts`;
    this.$httpBackend.expectGET(url).respond(200, mockData);

    this.ReportsChartService.getFilterData().then((res) => {
      expect(res.length).toBe(1);
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call getChartData', function () {
    const mockData = {
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
    };
    const url = `${this.UrlConfig.getGeminiUrl()}scorecard/minute/meeting`;
    this.$httpBackend.expectPOST(url).respond(200, mockData);

    const data = {
      duration: 'M12',
      customerId: '11323123',
    };
    this.ReportsChartService.getChartData('minute/meeting', data).then((res) => {
      expect(res.chart.length).toBe(2);
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when call getkPIData', function () {
    const url = `${this.UrlConfig.getGeminiUrl()}scorecard/growth`;
    this.$httpBackend.expectPOST(url).respond(200, this.getkPIData);

    this.ReportsChartService.getkPIData().then((res) => {
      expect(res.length).toBe(2);
    });
    this.$httpBackend.flush();
  });

  it('should get correct data when report chart list', function () {

    this.ReportsChartService.AmchartsMakeChart('unitTest', this.chartData);
    expect(this.ReportsChartService.stdOpts).toBeDefined();

    this.chartData.type = 'line';
    this.ReportsChartService.AmchartsMakeChart('unitTest', this.chartData);
    expect(this.ReportsChartService.stdOpts).toBeDefined();

    this.chartData.type = 'columns';
    this.ReportsChartService.AmchartsMakeChart('unitTest', this.chartData);
    expect(this.ReportsChartService.stdOpts).toBeDefined();

    this.ReportsChartService.AmchartsMakeChart('unitTest', this.chartData);
    expect(this.ReportsChartService.stdOpts).toBeDefined();
  });

  it('should get correct data when large chart list', function () {
    this.ReportsChartService.smallToLarge('unitTest', this.chartData);
    expect(this.ReportsChartService.stdOpts).toBeDefined();
  });

  it('should get correct data when AmchartsMakeChart data', function () {

    this.chartData.chart.length = 0;
    this.ReportsChartService.AmchartsMakeChart('unitTest', this.chartData);
    expect(this.ReportsChartService.stdOpts).toBeDefined();
  });
});
