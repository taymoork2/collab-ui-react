import testModule from './index';

describe('Component: ccaReports', () => {
  beforeAll(function () {
    this.filterData = [
      {
        orgId: '8af97b8f5003289e01504f980e3d0001',
        orgName: 'Intercall (Annuity) - West',
        spAccountId: '24601056',
        accounts: [
          {
            accountId: '100016179285',
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
      },
    ];
    this.provideData = [
      {
        group: 'usage',
        url: 'minute/meeting',
        type: 'column',
        title: 'TOTAL DATA MEETING MINUTES',
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
        },
      },
    ];
    this.getkPIData = [
      {
        name: 'hostGrowth',
        value: 85,
      },
    ];

  });

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('ReportsChartService', 'Analytics', '$q');
    initSpies.apply(this);

  });

  function initComponent() {
    this.compileComponent('ccaReportsTabs');
    this.$scope.$apply();
  }

  function initSpies() {
    spyOn(this.Analytics, 'trackEvent');
    spyOn(this.ReportsChartService, 'getkPIData').and.returnValue({});
    spyOn(this.ReportsChartService, 'getChartData').and.returnValue({});
    spyOn(this.ReportsChartService, 'getFilterData').and.returnValue({});
  }

  it('Should show report chart', function () {
    this.ReportsChartService.getkPIData.and.returnValue(this.$q.resolve(this.getkPIData));
    this.ReportsChartService.getFilterData.and.returnValue(this.$q.resolve(this.filterData));
    this.ReportsChartService.getChartData.and.returnValue(this.$q.resolve(this.provideData));

    initComponent.call(this);
    expect(this.controller.filterEnable).toEqual(true);
    this.controller.onExportCSV();

    this.controller.sessionOptions([]);
    this.controller.startDate = '2017-09-09';
    this.controller.storeData.startDate = '2017-09-09';
    this.controller.onChangeDate([]);

    this.controller.storeData.startDate = '2017-09-02';
    this.controller.onChangeDate([]);

    this.controller.endData = '2017-09-01';
    this.controller.onChangeDate([]);
    this.controller.onAccount();

    this.controller.data.sessionSelected = [{ isSelected: 0 }];
    this.controller.data.durationSelected = { label: 'Last 12 Months', value: 'M12' };
    this.controller.onDuration();
    this.controller.onSites();
    this.controller.onSession();

  });
});
