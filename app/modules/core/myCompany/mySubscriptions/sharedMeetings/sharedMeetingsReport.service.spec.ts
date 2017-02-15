describe('Service: SharedMeetingsReportService', function () {
  let validateService: any;
  const data: any = getJSONFixture('core/json/myCompany/sharedMeetingReport.json');
  const chart: any = {
    categoryAxis: {
      gridColor: 'color',
    },
    chartCursor: {
      valueLineEnabled: true,
    },
    graphs: [],
    legend: {
      valueText: undefined,
    },
    dataProvider: undefined,
    validateData: undefined,
  };

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$httpBackend', 'SharedMeetingsReportService');

    this.$httpBackend.whenPOST('').respond(_.cloneDeep(data.APIResponse));

    validateService = {
      validateData: jasmine.createSpy('validateData'),
    };
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should post query when getMaxConcurrentMeetingsData is called', function () {
    this.SharedMeetingsReportService.getMaxConcurrentMeetingsData().then((response): void => {
      expect(response.data).toEqual(_.cloneDeep(data.APIResponse));
    });
    this.$httpBackend.flush();
  });

  it('should create or update the graph when setChartData is called', function () {
    let chartResponse: any = _.cloneDeep(chart);
    chartResponse.dataProvider = _.cloneDeep(data.filteredData.threeMonths);
    chartResponse.validateData = validateService.validateData;
    spyOn(AmCharts, 'makeChart').and.returnValue(chartResponse);

    let graph: any = this.SharedMeetingsReportService.setChartData(_.cloneDeep(data.filteredData.threeMonths), undefined);
    expect(AmCharts.makeChart).toHaveBeenCalled();
    expect(validateService.validateData).not.toHaveBeenCalled();

    this.SharedMeetingsReportService.setChartData(_.cloneDeep(data.filteredData.threeMonths), graph);
    expect(validateService.validateData).toHaveBeenCalled();
  });
});
