var WebExCommon = function () {
  this.testInfo = {
    describeCount: 0,
    testType: null,
    describeText: null
  };

  this.t30Info = {
    siteUrl: 't30citestprov9.webex.com',
    testAdminUsername: 't30sp6-regression-adm@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.t31Info = {
    siteUrl: 't30citestprov6.webex.com',
    testAdminUsername: 't31r1-regression-adm@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.singleCenterLicenseInfo = {
    siteUrl: 't30citestprov9.webex.com',
    testAdminUsername: 't30sp6-regression-adm@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.multiCenterLicenseInfo = {
    siteUrl: 't30citestprov6.webex.com',
    testAdminUsername: 't31r1-regression-adm@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.T30ReportsCog = element(by.id(this.t30Info.siteUrl + "_webex-site-reports"));
  this.t30ConfigureCog = element(by.id(this.t30Info.siteUrl + "_webex-site-settings"));
  this.t30CardsSectionId = element(by.id(this.t30Info.siteUrl + "-cardsSection"));

  this.T31ReportsCog = element(by.id(this.t31Info.siteUrl + "_webex-site-reports"));
  this.t31ConfigureCog = element(by.id(this.t31Info.siteUrl + "_webex-site-settings"));
  this.t31CardsSectionId = element(by.id(this.t31Info.siteUrl + "-cardsSection"));

  this.singleLicenseSiteId = element(by.id(this.singleCenterLicenseInfo.siteUrl + '_licenseType'));
  this.multiLicenseSiteId = element(by.id(this.multiCenterLicenseInfo.siteUrl + '_licenseType'));

  this.testT30SiteElement = element(by.id(this.t30Info.siteUrl));
  this.testT31SiteElement = element(by.id(this.t31Info.siteUrl));
};

module.exports = WebExCommon;
