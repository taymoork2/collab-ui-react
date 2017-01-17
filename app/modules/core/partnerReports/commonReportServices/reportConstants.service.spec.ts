describe('Service: Report Constants Service', () => {
  let activeUser = getJSONFixture('core/json/customerReports/activeUser.json');
  let defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  let devices = getJSONFixture('core/json/customerReports/devices.json');
  let media = getJSONFixture('core/json/customerReports/mediaQuality.json');

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$translate', 'ReportConstants');
    spyOn(this.$translate, 'instant').and.callThrough();
  });

  afterAll(function () {
    activeUser = defaults = devices = media = undefined;
  });

  it('should return the expected constants for the time filters and have fresh translations each time', function () {
    expect(this.ReportConstants.WEEK_FILTER).toEqual(defaults.altTimeFilter[0]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(2);

    expect(this.ReportConstants.MONTH_FILTER).toEqual(defaults.altTimeFilter[1]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(4);

    expect(this.ReportConstants.THREE_MONTH_FILTER).toEqual(defaults.altTimeFilter[2]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(6);

    expect(this.ReportConstants.SIX_MONTH_FILTER).toEqual(defaults.altTimeFilter[3]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(8);

    expect(this.ReportConstants.YEAR_FILTER).toEqual(defaults.altTimeFilter[4]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(10);

    expect(this.ReportConstants.CUSTOM_FILTER).toEqual(defaults.altTimeFilter[5]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(12);

    expect(this.ReportConstants.TIME_FILTER).toEqual(defaults.timeFilter);
    expect(this.$translate.instant).toHaveBeenCalledTimes(18);

    expect(this.ReportConstants.ALT_TIME_FILTER).toEqual(defaults.altTimeFilter);
    expect(this.$translate.instant).toHaveBeenCalledTimes(30);
  });

  it('should return the expected constants for the active user filter and have fresh translations each time', function () {
    expect(this.ReportConstants.ACTIVE_FILTER_ONE).toEqual(activeUser.dropdownOptions[0]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(1);

    expect(this.ReportConstants.ACTIVE_FILTER_TWO).toEqual(activeUser.dropdownOptions[1]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(2);

    expect(this.ReportConstants.ACTIVE_FILTER).toEqual(activeUser.dropdownOptions);
    expect(this.$translate.instant).toHaveBeenCalledTimes(4);
  });

  it('should return the expected constants for the media filter and have fresh translations each time', function () {
    expect(this.ReportConstants.MEDIA_FILTER_ONE).toEqual(media.dropdownFilter[0]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(1);

    expect(this.ReportConstants.MEDIA_FILTER_TWO).toEqual(media.dropdownFilter[1]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(2);

    expect(this.ReportConstants.MEDIA_FILTER_THREE).toEqual(media.dropdownFilter[2]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(3);

    expect(this.ReportConstants.MEDIA_FILTER).toEqual(media.dropdownFilter);
    expect(this.$translate.instant).toHaveBeenCalledTimes(6);
  });

  it('should return the expected constants for the registered endpoint filter and have fresh translations each time', function () {
    expect(this.ReportConstants.DEFAULT_ENDPOINT).toEqual(devices.response.filterArray[0]);
    expect(this.$translate.instant).toHaveBeenCalledTimes(1);
  });
});
