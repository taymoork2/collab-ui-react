import reportServices from './index';

describe('Service: Report Constants Service', () => {
  beforeEach(function () {
    this.initModules(reportServices);
    this.injectDependencies('$translate', 'ReportConstants');
    spyOn(this.$translate, 'instant').and.callThrough();

    this.activeUser = getJSONFixture('core/json/customerReports/activeUser.json');
    this.defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
    this.devices = getJSONFixture('core/json/customerReports/devices.json');
    this.media = getJSONFixture('core/json/customerReports/mediaQuality.json');
  });

  it('should return the expected constants for the time filters and have fresh translations each time', function () {
    expect(this.ReportConstants.WEEK_FILTER).toEqual(this.defaults.altTimeFilter[0]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(2);

    expect(this.ReportConstants.MONTH_FILTER).toEqual(this.defaults.altTimeFilter[1]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(4);

    expect(this.ReportConstants.THREE_MONTH_FILTER).toEqual(this.defaults.altTimeFilter[2]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(6);

    expect(this.ReportConstants.SIX_MONTH_FILTER).toEqual(this.defaults.altTimeFilter[3]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(8);

    expect(this.ReportConstants.YEAR_FILTER).toEqual(this.defaults.altTimeFilter[4]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(10);

    expect(this.ReportConstants.CUSTOM_FILTER).toEqual(this.defaults.altTimeFilter[5]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(12);

    expect(this.ReportConstants.TIME_FILTER).toEqual(this.defaults.timeFilter);
    expect(this.$translate.instant).toHaveBeenCalledTimes(18);

    expect(this.ReportConstants.ALT_TIME_FILTER).toEqual(this.defaults.altTimeFilter);
    expect(this.$translate.instant).toHaveBeenCalledTimes(30);
  });

  it('should return the expected constants for the active user filter and have fresh translations each time', function () {
    expect(this.ReportConstants.ACTIVE_FILTER_ONE).toEqual(this.activeUser.dropdownOptions[0]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(1);

    expect(this.ReportConstants.ACTIVE_FILTER_TWO).toEqual(this.activeUser.dropdownOptions[1]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(2);

    expect(this.ReportConstants.ACTIVE_FILTER).toEqual(this.activeUser.dropdownOptions);
    expect(this.$translate.instant).toHaveBeenCalledTimes(4);
  });

  it('should return the expected constants for the media filter and have fresh translations each time', function () {
    expect(this.ReportConstants.MEDIA_FILTER_ONE).toEqual(this.media.dropdownFilter[0]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(1);

    expect(this.ReportConstants.MEDIA_FILTER_TWO).toEqual(this.media.dropdownFilter[1]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(2);

    expect(this.ReportConstants.MEDIA_FILTER_THREE).toEqual(this.media.dropdownFilter[2]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(3);

    expect(this.ReportConstants.MEDIA_FILTER).toEqual(this.media.dropdownFilter);
    expect(this.$translate.instant).toHaveBeenCalledTimes(6);
  });

  it('should return the expected constants for the registered endpoint filter and have fresh translations each time', function () {
    expect(this.ReportConstants.DEFAULT_ENDPOINT).toEqual(this.devices.response.filterArray[0]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(1);
  });
});
