describe('Service: SharedMeetingsReportService', function () {
  const data: any = getJSONFixture('core/json/myCompany/sharedMeetingReport.json');
  const siteUrl: string = 'siteUrl';

  describe('modal operations - ', function () {
    const modal: any = {
      dismiss: jasmine.createSpy('dismiss'),
    };

    beforeEach(function () {
      this.initModules('Core');
      this.injectDependencies('$modal', 'Notification', 'SharedMeetingsReportService');

      spyOn(this.$modal, 'open').and.returnValue(modal);
      spyOn(this.Notification, 'error');
    });

    it('should open a modal when openModal is called with a valid siteUrl', function () {
      this.SharedMeetingsReportService.openModal(siteUrl);
      expect(this.$modal.open).toHaveBeenCalledWith({
        template: '<shared-meeting-report class="modal-content" site-url="' + siteUrl + '"></shared-meeting-report>',
        type: 'full',
      });
    });

    it('should notify an error when openModal is called with an invalid siteUrl', function () {
      this.SharedMeetingsReportService.openModal(undefined);
      expect(this.Notification.error).toHaveBeenCalledWith('sharedMeetingReports.siteUrlError');
    });

    it('should dismiss the modal when dismissModal is called and a modal exists', function () {
      this.SharedMeetingsReportService.openModal(siteUrl);
      this.SharedMeetingsReportService.dismissModal();

      expect(modal.dismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTTP requests - ', function () {
    const end: string = '201702';
    const start: string = '201610';

    beforeEach(function () {
      this.initModules('Core');
      this.injectDependencies('$httpBackend', 'SharedMeetingsReportService');

      this.$httpBackend.whenPOST('https://siteUrl/meetingsapi/v1/report/ConcurrentMeetingsDetailByMonth').respond(_.cloneDeep(data.APIResponse));
      this.$httpBackend.whenPOST('https://siteUrl/meetingsapi/v1/report/MonthlyMaxConcurrentMeetings').respond(_.cloneDeep(data.APIResponse));
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should post query when getMaxConcurrentMeetingsData is called', function () {
      this.SharedMeetingsReportService.getMaxConcurrentMeetingsData(siteUrl, end, start).then((response): void => {
        expect(response.data).toEqual(_.cloneDeep(data.APIResponse));
      });
      this.$httpBackend.flush();
    });

    it('should post query when getDetailedReportData is called', function () {
      this.SharedMeetingsReportService.getDetailedReportData(siteUrl, end, start).then((response): void => {
        expect(response.data).toEqual(_.cloneDeep(data.APIResponse));
      });
      this.$httpBackend.flush();
    });
  });

  describe('CSV downloading - ', function () {
    const blob = 'blob';
    const csvData: string = 'csv,data';

    beforeEach(function () {
      this.initModules('Core');
      this.injectDependencies('$window', 'SharedMeetingsReportService');
    });

    it('should create a url for downloading a csv when getDownloadCSV is called', function () {
      this.$window.navigator.msSaveOrOpenBlob = undefined;
      let response: string = this.SharedMeetingsReportService.getDownloadCSV(csvData);
      expect(response).toContain(blob);
    });

    it('should return undefined when msSaveOrOpenBlob is defined', function () {
      this.$window.navigator.msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob');
      let response: string = this.SharedMeetingsReportService.getDownloadCSV(csvData);
      expect(response).toBeUndefined();
    });

    it('should call msSaveOrOpenBlob when downloadInternetExplorer is called', function () {
      this.$window.navigator.msSaveOrOpenBlob = jasmine.createSpy('msSaveOrOpenBlob');
      this.SharedMeetingsReportService.downloadInternetExplorer();
      expect(this.$window.navigator.msSaveOrOpenBlob).toHaveBeenCalledTimes(1);
    });
  });

  describe('Graph Functions - ', function () {
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
      this.injectDependencies('SharedMeetingsReportService');
    });

    it('should create or update the graph when setChartData is called', function () {
      let chartResponse: any = _.cloneDeep(chart);
      chartResponse.dataProvider = _.cloneDeep(data.filteredData.threeMonths);
      chartResponse.validateData = jasmine.createSpy('validateData');
      spyOn(AmCharts, 'makeChart').and.returnValue(chartResponse);

      let graph: any = this.SharedMeetingsReportService.setChartData(_.cloneDeep(data.filteredData.threeMonths), undefined);
      expect(AmCharts.makeChart).toHaveBeenCalled();
      expect(chartResponse.validateData).not.toHaveBeenCalled();

      this.SharedMeetingsReportService.setChartData(_.cloneDeep(data.filteredData.threeMonths), graph);
      expect(chartResponse.validateData).toHaveBeenCalled();
    });
  });
});
