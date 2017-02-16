import {
  ISharedMeetingTimeFilter,
  IMeetingData,
} from './sharedMeetingsReport.interfaces';

describe('Controller: SharedMeetingsReportCtrl', function () {
  const data: any = getJSONFixture('core/json/myCompany/sharedMeetingReport.json');
  const siteUrl: string = 'siteUrl';
  const timeFilter: Array<ISharedMeetingTimeFilter> = _.cloneDeep(data.timeFilter);

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$controller', '$timeout', '$scope', '$q', 'CommonReportService', 'Notification', 'ReportConstants', 'SharedMeetingsReportService');

    spyOn(this.CommonReportService, 'createExportMenu').and.returnValue([]);
    spyOn(this.SharedMeetingsReportService, 'setChartData').and.returnValue(undefined);
    spyOn(this.Notification, 'errorWithTrackingId');

    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2016, 11, 10));

    this.initController = (): void => {
      this.controller = this.$controller('SharedMeetingsReportCtrl', {
        $scope: this.$scope,
        siteUrl: siteUrl,
        CommonReportService: this.CommonReportService,
        SharedMeetingsReportService: this.SharedMeetingsReportService,
        Notification: this.Notification,
      });
      this.$timeout.flush();
      this.$scope.$apply();
    };

    this.getMonth = (months: number): string => {
      return moment().subtract(months, this.ReportConstants.MONTH).format('YYYYMM');
    };

    this.createMaxMeetings = (months): Array<IMeetingData> => {
      let returnArray: Array<IMeetingData> = [];

      for (let i = 0; i < months; i++) {
        returnArray.push({
          TimeBucketStart: this.getMonth(i),
          NumOfMtgs: i,
        });
      }

      return returnArray;
    };
  });

  afterEach(function () {
    jasmine.clock().uninstall();
  });

  describe('When API returns data', function () {
    beforeEach(function () {
      spyOn(this.SharedMeetingsReportService, 'getMaxConcurrentMeetingsData').and.callFake((): any => {
        let APIResponse: any = _.cloneDeep(data.APIResponse);
        APIResponse.MaxConcurrentMeetings = this.createMaxMeetings(this.controller.timeSelected.value);

        return this.$q.when({
          data: APIResponse,
        });
      });

      this.initController();
    });

    it('should start with expected defaults', function () {
      expect(this.controller.timeFilter).toEqual(timeFilter);
      expect(this.controller.timeSelected).toEqual(timeFilter[0]);
      expect(this.controller.exportDropdown).toEqual([]);
      expect(this.controller.exportMenu).toBeFalsy();

      expect(this.controller.isRefresh()).toBeFalsy();
      expect(this.controller.isEmpty()).toBeFalsy();

      expect(this.CommonReportService.createExportMenu).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(2);
      expect(this.SharedMeetingsReportService.setChartData.calls.first().args).toEqual([_.cloneDeep(data.dummyData.sixMonths), undefined]);
      expect(this.SharedMeetingsReportService.setChartData.calls.mostRecent().args).toEqual([_.cloneDeep(data.filteredData.sixMonths), undefined]);
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
    });

    it('should start with expected defaults', function () {
      this.SharedMeetingsReportService.getMaxConcurrentMeetingsData.calls.reset();
      this.SharedMeetingsReportService.setChartData.calls.reset();
      this.controller.timeSelected = timeFilter[1];
      this.controller.showReport();
      this.$scope.$apply();

      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(2);
      expect(this.SharedMeetingsReportService.setChartData.calls.first().args).toEqual([_.cloneDeep(data.dummyData.threeMonths), undefined]);
      expect(this.SharedMeetingsReportService.setChartData.calls.mostRecent().args).toEqual([_.cloneDeep(data.filteredData.threeMonths), undefined]);
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();

      this.SharedMeetingsReportService.getMaxConcurrentMeetingsData.calls.reset();
      this.SharedMeetingsReportService.setChartData.calls.reset();
      this.controller.timeSelected = timeFilter[2];
      this.controller.showReport();
      this.$scope.$apply();

      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledWith(_.cloneDeep(data.dummyData.oneMonth), undefined);
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
    });
  });

  describe('When API returns an error', function () {
    const error: any = {
      status: 500,
    };

    it('should start with expected defaults', function () {
      spyOn(this.SharedMeetingsReportService, 'getMaxConcurrentMeetingsData').and.returnValue(this.$q.reject(error));
      this.initController();

      expect(this.controller.timeFilter).toEqual(timeFilter);
      expect(this.controller.timeSelected).toEqual(timeFilter[0]);
      expect(this.controller.exportDropdown).toBeUndefined();
      expect(this.controller.exportMenu).toBeFalsy();

      expect(this.controller.isRefresh()).toBeFalsy();
      expect(this.controller.isEmpty()).toBeTruthy();

      expect(this.CommonReportService.createExportMenu).not.toHaveBeenCalled();
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(siteUrl, this.getMonth(0), this.getMonth(this.controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledWith(_.cloneDeep(data.dummyData.sixMonths), undefined);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(error, 'sharedMeetingReports.errorLoadingSharedMeetingData');
    });
  });

});
