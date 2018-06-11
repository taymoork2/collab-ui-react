import subscriptionModule from 'modules/core/myCompany/mySubscriptions/index';

describe('Component: subscription row', function () {
  beforeEach(function () {
    this.initModules(subscriptionModule);
    this.injectDependencies(
      '$componentController',
      '$q',
      '$scope',
      '$translate',
      '$window',
      'Config',
      'ProPackService',
      'SharedMeetingsReportService',
      'WebExUtilsFact',
    );

    this.offer = _.cloneDeep(getJSONFixture('core/json/myCompany/subscriptionData.json')).licensesFormatted[0].offers[0];
    this.DUMMY_URL = 'dummy';

    spyOn(this.$translate, 'instant').and.callThrough();
    spyOn(this.$window, 'open');
    spyOn(this.ProPackService, 'hasProPackEnabled').and.returnValue(this.$q.resolve(true));
    spyOn(this.SharedMeetingsReportService, 'openModal');
    spyOn(this.WebExUtilsFact, 'getSiteAdminUrl').and.returnValue(this.DUMMY_URL);

    this.initController = (): void => {
      this.controller = this.$componentController('subscriptionRow', {}, {
        offer: this.offer,
        wrapped: false,
      });
      this.controller.$onInit();
      this.$scope.$apply();
    };
    this.initController();
  });

  it('determineLicenseType should return a translated string based on whether it is a shared meeting report', function () {
    expect(this.controller.determineLicenseType()).toEqual('firstTimeWizard.namedLicenses');
    expect(this.$translate.instant).toHaveBeenCalledWith('firstTimeWizard.namedLicenses');

    this.$translate.instant.calls.reset();
    this.offer.licenseModel = this.Config.licenseModel.cloudSharedMeeting;
    this.initController();
    expect(this.controller.determineLicenseType()).toEqual('firstTimeWizard.sharedLicenses');
    expect(this.$translate.instant).toHaveBeenCalledWith('firstTimeWizard.sharedLicenses');
  });

  it('displayUsage should return the usage/volume string', function () {
    expect(this.controller.displayUsage(3)).toEqual('3/100');
  });

  it('getLicenseName should return license name or empty string', function () {
    expect(this.controller.getLicenseName()).toEqual(`subscriptions.licenseTypes.${this.offer.offerName}`);

    this.controller.offer.offerName = undefined;
    expect(this.controller.getLicenseName()).toEqual('');
  });

  it('getWarning should return true/false depending on whether usage is smaller than voluem', function () {
    expect(this.controller.getWarning(3)).toBeFalsy();
    expect(this.controller.getWarning(500)).toBeTruthy();
  });

  it('hideUsage should return true false based on whether its a CI site', function () {
    expect(this.controller.hideUsage()).toBeFalsy();

    this.offer.isCI = false;
    this.initController();
    expect(this.controller.hideUsage()).toBeTruthy();
  });

  it('isSharedMeetingsLicense should return true/false based on whether its a shared meeting report', function () {
    expect(this.controller.isSharedMeetingsLicense()).toBeFalsy();

    this.offer.licenseModel = this.Config.licenseModel.cloudSharedMeeting;
    this.initController();
    expect(this.controller.isSharedMeetingsLicense()).toBeTruthy();
  });

  it('isTotalUsage and isUsage should return true/false depending on whether usage or totalUsage are set', function () {
    expect(this.controller.isTotalUsage()).toBeFalsy();
    expect(this.controller.isUsage()).toBeTruthy();

    this.offer.usage = undefined;
    this.offer.totalUsage = 5;
    this.initController();
    expect(this.controller.isTotalUsage()).toBeTruthy();
    expect(this.controller.isUsage()).toBeFalsy();
  });

  it('launchSharedMeetingsLicenseUsageReport should only launch when there is a siteUrl', function () {
    this.controller.launchSharedMeetingsLicenseUsageReport();
    expect(this.SharedMeetingsReportService.openModal).not.toHaveBeenCalled();

    this.offer.siteUrl = this.DUMMY_URL;
    this.initController();
    this.controller.launchSharedMeetingsLicenseUsageReport();
    expect(this.SharedMeetingsReportService.openModal).toHaveBeenCalled();
  });

  it('nonCISignIn should open a new tab when there is a siteUrl', function () {
    this.controller.nonCISignIn();
    expect(this.$window.open).not.toHaveBeenCalled();
    expect(this.WebExUtilsFact.getSiteAdminUrl).not.toHaveBeenCalled();

    this.offer.siteUrl = this.DUMMY_URL;
    this.initController();
    this.controller.nonCISignIn();
    expect(this.$window.open).toHaveBeenCalled();
    expect(this.WebExUtilsFact.getSiteAdminUrl).toHaveBeenCalledWith(this.DUMMY_URL);
  });
});
