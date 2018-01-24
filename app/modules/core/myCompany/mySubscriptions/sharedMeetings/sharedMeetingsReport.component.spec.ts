import sharedMeetingsModule from './index';
import {
  ISharedMeetingCSV,
  IMeetingData,
} from './sharedMeetingsReport.interfaces';

describe('Component: sharedMeetingReport', function () {
  beforeEach(function () {
    this.initModules(sharedMeetingsModule);
    this.injectDependencies('$componentController',
      '$timeout',
      '$scope',
      '$q',
      'CommonReportService',
      'Notification',
      'ReportConstants',
      'SharedMeetingsReportService',
      'ReportPrintService');

    this.data = getJSONFixture('core/json/myCompany/sharedMeetingReport.json');
    this.timeFilter = _.cloneDeep(this.data.timeFilter);
    this.siteUrl = 'siteUrl.com';
    this.error = {
      status: 500,
    };

    spyOn(this.ReportPrintService, 'createExportMenu').and.returnValue([]);
    spyOn(this.SharedMeetingsReportService, 'setChartData').and.returnValue(undefined);
    spyOn(this.SharedMeetingsReportService, 'getDownloadCSV').and.returnValue(this.siteUrl);
    spyOn(this.SharedMeetingsReportService, 'dismissModal');
    spyOn(this.Notification, 'errorWithTrackingId');

    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2016, 11, 10));

    this.initController = (): void => {
      this.controller = this.$componentController('sharedMeetingReport', {
        $scope: this.$scope,
        CommonReportService: this.CommonReportService,
        SharedMeetingsReportService: this.SharedMeetingsReportService,
        Notification: this.Notification,
      }, {
        siteUrl: this.siteUrl,
      });

      this.$timeout.flush();
      this.$scope.$apply();
    };

    this.getMonth = (months: number): string => {
      return moment().subtract(months, this.ReportConstants.MONTH).format('YYYYMM');
    };

    this.createMaxMeetings = (months): IMeetingData[] => {
      const returnArray: IMeetingData[] = [];

      for (let i = 0; i <= months; i++) {
        returnArray.push({
          TimeBucketStart: this.getMonth(i),
          NumOfMtgs: i,
        });
      }

      return returnArray;
    };

    this.createMeetings = (): ISharedMeetingCSV[] => {
      const returnArray: ISharedMeetingCSV[] = [];

      for (let i = 0; i < 10; i++) {
        returnArray.push({
          MeetingTopic: 'MeetingTopic',
          StartTime: 'StartTime',
          EndTime: 'EndTime',
          ConfId: 'ConfId',
          SiteName: 'SiteName',
          HostName: 'HostName',
        });
      }

      return returnArray;
    };
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });

  describe('When APIs both return data', function () {
    beforeEach(function () {
      spyOn(this.SharedMeetingsReportService, 'getMaxConcurrentMeetingsData').and.callFake((): any => {
        const APIResponse: any = _.cloneDeep(this.data.APIResponse);
        APIResponse.MaxConcurrentMeetings = this.createMaxMeetings(this.controller.timeSelected.value);

        return this.$q.resolve({
          data: APIResponse,
        });
      });

      spyOn(this.SharedMeetingsReportService, 'getDetailedReportData').and.callFake((): any => {
        const APIResponse: any = _.cloneDeep(this.data.APIResponse);
        APIResponse.ConcurrentMeetingsDetail = this.createMeetings();

        return this.$q.resolve({
          data: APIResponse,
        });
      });

      this.initController();
    });

    it('should start with expected defaults', function () {
      expect(this.controller.siteUrl).toEqual(this.siteUrl);
      expect(this.controller.timeFilter).toEqual(this.timeFilter);
      expect(this.controller.timeSelected).toEqual(this.timeFilter[0]);
      expect(this.controller.exportDropdown).toEqual([]);
      expect(this.controller.exportMenu).toBeFalsy();
      expect(this.controller.csvError).toBeFalsy();
      expect(this.controller.csvDownload).toBeFalsy();
      expect(this.controller.csvHref).toContain(this.siteUrl);
      expect(this.controller.csvFilename).toEqual('shared_meeting.csv');
      expect(this.controller.csvFilename2).toEqual('concurrent_meetings.csv');
      expect(this.controller.isRefresh()).toBeFalsy();
      expect(this.controller.isEmpty()).toBeFalsy();
      expect(this.controller.isSet()).toBeTruthy();
      expect(this.controller.isDownloadReady()).toBeTruthy();

      expect(this.ReportPrintService.createExportMenu).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(this.siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.getDetailedReportData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getDetailedReportData).toHaveBeenCalledWith(this.siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(2);
      expect(this.SharedMeetingsReportService.setChartData.calls.first().args).toEqual([_.cloneDeep(this.data.dummyData.sixMonths), undefined, this.timeFilter[0]]);
      expect(this.SharedMeetingsReportService.setChartData.calls.mostRecent().args).toEqual([_.cloneDeep(this.data.filteredData.sixMonths), undefined, this.timeFilter[0]]);
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
    });

    it('should update based on time filter', function () {
      this.SharedMeetingsReportService.getMaxConcurrentMeetingsData.calls.reset();
      this.SharedMeetingsReportService.getDetailedReportData.calls.reset();
      this.SharedMeetingsReportService.setChartData.calls.reset();
      this.controller.timeSelected = this.timeFilter[1];
      this.controller.updateReport();
      this.$scope.$apply();

      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(this.siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.getDetailedReportData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getDetailedReportData).toHaveBeenCalledWith(this.siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(2);
      expect(this.SharedMeetingsReportService.setChartData.calls.first().args).toEqual([_.cloneDeep(this.data.dummyData.threeMonths), undefined, this.timeFilter[1]]);
      expect(this.SharedMeetingsReportService.setChartData.calls.mostRecent().args).toEqual([_.cloneDeep(this.data.filteredData.threeMonths), undefined, this.timeFilter[1]]);
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();

      this.SharedMeetingsReportService.getMaxConcurrentMeetingsData.and.returnValue(this.$q.reject(500));
      this.SharedMeetingsReportService.getMaxConcurrentMeetingsData.calls.reset();
      this.SharedMeetingsReportService.getDetailedReportData.calls.reset();
      this.SharedMeetingsReportService.setChartData.calls.reset();
      this.controller.timeSelected = this.timeFilter[2];
      this.controller.updateReport();
      this.$scope.$apply();

      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(this.siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.getDetailedReportData).not.toHaveBeenCalled();
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.setChartData.calls.mostRecent().args).toEqual([_.cloneDeep(this.data.dummyData.oneMonth), undefined, this.timeFilter[2]]);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalled();
    });

    it('should control the export menu', function () {
      this.controller.toggleExportMenu();
      expect(this.controller.exportMenu).toBeTruthy();

      const dummyClick: any = jasmine.createSpy('click');
      this.controller.dropdownSelect({
        click: dummyClick,
      });
      expect(this.controller.exportMenu).toBeFalsy();
      expect(dummyClick).toHaveBeenCalledTimes(1);
    });

    it('should dismiss modal when dismissModal is called', function () {
      this.controller.dismissModal();
      expect(this.SharedMeetingsReportService.dismissModal).toHaveBeenCalledTimes(1);
    });
  });

  describe('When the graph API returns an error', function () {
    it('should start with expected defaults', function () {
      spyOn(this.SharedMeetingsReportService, 'getMaxConcurrentMeetingsData').and.callFake(() => {
        return this.$q.reject(this.error);
      });
      spyOn(this.SharedMeetingsReportService, 'getDetailedReportData');
      this.initController();

      expect(this.controller.timeFilter).toEqual(this.timeFilter);
      expect(this.controller.timeSelected).toEqual(this.timeFilter[0]);
      expect(this.controller.exportDropdown).toBeUndefined();
      expect(this.controller.exportMenu).toBeFalsy();
      expect(this.controller.csvError).toBeFalsy();
      expect(this.controller.csvDownload).toBeFalsy();
      expect(this.controller.csvHref).toBeUndefined();
      expect(this.controller.csvFilename).toBeUndefined();

      expect(this.controller.isRefresh()).toBeFalsy();
      expect(this.controller.isEmpty()).toBeTruthy();
      expect(this.controller.isSet()).toBeFalsy();
      expect(this.controller.isDownloadReady()).toBeFalsy();

      expect(this.ReportPrintService.createExportMenu).not.toHaveBeenCalled();
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(this.siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.getDetailedReportData).not.toHaveBeenCalled();
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledWith(_.cloneDeep(this.data.dummyData.sixMonths), undefined, this.timeFilter[0]);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(this.error, 'sharedMeetingReports.errorLoadingSharedMeetingData');
    });
  });

  describe('When detailed API returns an error', function () {
    it('should start with expected defaults', function () {
      spyOn(this.SharedMeetingsReportService, 'getDetailedReportData').and.callFake(() => {
        return this.$q.reject(this.error);
      });
      spyOn(this.SharedMeetingsReportService, 'getMaxConcurrentMeetingsData').and.callFake((): any => {
        const APIResponse: any = _.cloneDeep(this.data.APIResponse);
        APIResponse.MaxConcurrentMeetings = this.createMaxMeetings(this.controller.timeSelected.value);

        return this.$q.resolve({
          data: APIResponse,
        });
      });
      this.initController();

      expect(this.controller.siteUrl).toEqual(this.siteUrl);
      expect(this.controller.timeFilter).toEqual(this.timeFilter);
      expect(this.controller.timeSelected).toEqual(this.timeFilter[0]);
      expect(this.controller.exportDropdown).toEqual([]);
      expect(this.controller.exportMenu).toBeFalsy();
      expect(this.controller.csvError).toBeTruthy();
      expect(this.controller.csvDownload).toBeFalsy();
      expect(this.controller.csvHref).toBeUndefined();
      expect(this.controller.csvFilename).toBeUndefined();

      expect(this.controller.isRefresh()).toBeFalsy();
      expect(this.controller.isEmpty()).toBeFalsy();
      expect(this.controller.isSet()).toBeTruthy();
      expect(this.controller.isDownloadReady()).toBeFalsy();

      expect(this.ReportPrintService.createExportMenu).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(this.siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.getDetailedReportData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getDetailedReportData).toHaveBeenCalledWith(this.siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(2);
      expect(this.SharedMeetingsReportService.setChartData.calls.first().args).toEqual([_.cloneDeep(this.data.dummyData.sixMonths), undefined, this.timeFilter[0]]);
      expect(this.SharedMeetingsReportService.setChartData.calls.mostRecent().args).toEqual([_.cloneDeep(this.data.filteredData.sixMonths), undefined, this.timeFilter[0]]);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(this.error, 'sharedMeetingReports.errorLoadingSharedMeetingDetails');
    });
  });
});
