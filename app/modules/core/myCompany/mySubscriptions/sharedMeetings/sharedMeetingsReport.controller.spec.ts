import {
  ISMPTimeFilter,
  IMeetingData,
} from './sharedMeetingsReport.interfaces';

describe('Controller: SharedMeetingsReportCtrl', function () {
  let controller: any;
  let initController: Function;
  let getMonth: Function;
  let createMaxMeetings: Function;

  const data: any = getJSONFixture('core/json/myCompany/sharedMeetingReport.json');
  const siteUrl: string = 'siteUrl';
  const timeFilter: Array<ISMPTimeFilter> = _.cloneDeep(data.timeFilter);

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$controller', '$timeout', '$scope', '$q', 'CommonReportService', 'Notification', 'ReportConstants', 'SharedMeetingsReportService');

    spyOn(this.CommonReportService, 'createExportMenu').and.returnValue([]);
    spyOn(this.SharedMeetingsReportService, 'setChartData').and.returnValue(undefined);
    spyOn(this.Notification, 'errorWithTrackingId');

    jasmine.clock().mockDate(new Date(2016, 11, 10));

    initController = (): void => {
      controller = this.$controller('SharedMeetingsReportCtrl', {
        $scope: this.$scope,
        siteUrl: siteUrl,
        CommonReportService: this.CommonReportService,
        SharedMeetingsReportService: this.SharedMeetingsReportService,
        Notification: this.Notification,
      });
      this.$timeout.flush();
      this.$scope.$apply();
    };

    getMonth = (months: number): string => {
      return moment().subtract(months, this.ReportConstants.MONTH).format('YYYYMM');
    };

    createMaxMeetings = (months): Array<IMeetingData> => {
      let returnArray: Array<IMeetingData> = [];

      for (let i = 0; i < months; i++) {
        returnArray.push({
          TimeBucketStart: getMonth(i),
          NumOfMtgs: i,
        });
      }

      return returnArray;
    };
  });

  describe('When API returns data', function () {
    beforeEach(function () {
      spyOn(this.SharedMeetingsReportService, 'getMaxConcurrentMeetingsData').and.callFake((): any => {
        let APIResponse: any = _.cloneDeep(data.APIResponse);
        APIResponse.MaxConcurrentMeetings = createMaxMeetings(controller.timeSelected.value);

        return this.$q.when({
          data: APIResponse,
        });
      });

      initController();
    });

    it('should start with expected defaults', function () {
      expect(controller.timeFilter).toEqual(timeFilter);
      expect(controller.timeSelected).toEqual(timeFilter[0]);
      expect(controller.exportDropdown).toEqual([]);
      expect(controller.exportMenu).toBeFalsy();

      expect(controller.isRefresh()).toBeFalsy();
      expect(controller.isEmpty()).toBeFalsy();

      expect(this.CommonReportService.createExportMenu).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(siteUrl, getMonth(0), getMonth(controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(2);
      expect(this.SharedMeetingsReportService.setChartData.calls.first().args).toEqual([_.cloneDeep(data.dummyData.sixMonths), undefined]);
      expect(this.SharedMeetingsReportService.setChartData.calls.mostRecent().args).toEqual([_.cloneDeep(data.filteredData.sixMonths), undefined]);
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();
    });

    it('should start with expected defaults', function () {
      this.SharedMeetingsReportService.getMaxConcurrentMeetingsData.calls.reset();
      this.SharedMeetingsReportService.setChartData.calls.reset();
      controller.timeSelected = timeFilter[1];
      controller.showReport();
      this.$scope.$apply();

      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(siteUrl, getMonth(0), getMonth(controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(2);
      expect(this.SharedMeetingsReportService.setChartData.calls.first().args).toEqual([_.cloneDeep(data.dummyData.threeMonths), undefined]);
      expect(this.SharedMeetingsReportService.setChartData.calls.mostRecent().args).toEqual([_.cloneDeep(data.filteredData.threeMonths), undefined]);
      expect(this.Notification.errorWithTrackingId).not.toHaveBeenCalled();

      this.SharedMeetingsReportService.getMaxConcurrentMeetingsData.calls.reset();
      this.SharedMeetingsReportService.setChartData.calls.reset();
      controller.timeSelected = timeFilter[2];
      controller.showReport();
      this.$scope.$apply();

      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(siteUrl, getMonth(0), getMonth(controller.timeSelected.value));
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
      initController();

      expect(controller.timeFilter).toEqual(timeFilter);
      expect(controller.timeSelected).toEqual(timeFilter[0]);
      expect(controller.exportDropdown).toBeUndefined();
      expect(controller.exportMenu).toBeFalsy();

      expect(controller.isRefresh()).toBeFalsy();
      expect(controller.isEmpty()).toBeTruthy();

      expect(this.CommonReportService.createExportMenu).not.toHaveBeenCalled();
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.getMaxConcurrentMeetingsData).toHaveBeenCalledWith(siteUrl, getMonth(0), getMonth(controller.timeSelected.value));
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledTimes(1);
      expect(this.SharedMeetingsReportService.setChartData).toHaveBeenCalledWith(_.cloneDeep(data.dummyData.sixMonths), undefined);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledTimes(1);
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(error, 'smpReports.errorLoadingSMPData');
    });
  });

});
