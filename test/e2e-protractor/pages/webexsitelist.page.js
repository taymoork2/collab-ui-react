var SiteListPage = function () {
  this.t31CSVToggleUser = {
    siteUrl: 't30citestprov6.webex.com',
    testAdminUsername: 't31r1-csvtoggle-adm@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.multiCenterLicenseUser_single = {
    siteUrl: 't30citestprov44.webex.com',
    testAdminUsername: 'customerqaprov+160302qaprov44@gmail.com',
    testAdminPassword: 'Cisco!23'
  };

  this.multiCenterLicenseUser_multiple = {
    siteUrl: 't30citestprov6.webex.com',
    testAdminUsername: 't31r1-csvtoggle-adm@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.t30csvWbxNotEntitledUser = {
    siteUrl: 't30citestprov9.webex.com',
    testAdminUsername: 't30citestprov9_csvadm2@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.t30csvNotAvailableUser = {
    siteUrl: 't30citestprov9.webex.com',
    testAdminUsername: 't30citestprov9_csvadm3@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.siteListPageId = element(by.id('site-list'));
  this.conferencingLink = element(by.css('a[href="#site-list"]'));
  this.csvColumnId = element(by.id('id-siteCsvColumnHeader'));
  this.actionReportsLinkID = element(by.id('id-IframeWebexSiteReportsLink'));
  this.actionSiteConfigLinkID = element(by.id('id-IframeWebexSiteConfigLink'));
  this.licenseTypesColumnId = element(by.id('site-license-types'));
  this.singleLicenseSiteId = element(by.id('t30citestprov44.webex.com_licenseType'));
  this.multiLicenseSiteId = element(by.id('t30citestprov6.webex.com_licenseType'));

  this.csvExportId = element(by.id(this.t31CSVToggleUser.siteUrl + "_exportStatus"));
  this.csvExportInProgress = element(by.id(this.t31CSVToggleUser.siteUrl + "_exportInProgress"));
  this.csvExportDisabled = element(by.id(this.t31CSVToggleUser.siteUrl + "_exportDisabled"));
  this.csvExportGoodResult = element(by.id(this.t31CSVToggleUser.siteUrl + "_exportResult"));
  this.csvExportBadResult = element(by.id(this.t31CSVToggleUser.siteUrl + "_exportResultIcon"));
  this.csvImportId = element(by.id(this.t31CSVToggleUser.siteUrl + "_importStatus"));
  this.csvImportInProgress = element(by.id(this.t31CSVToggleUser.siteUrl + "_importInProgress"));
  this.csvImportDisabled = element(by.id(this.t31CSVToggleUser.siteUrl + "_importDisabled"));
  this.csvImportGoodResult = element(by.id(this.t31CSVToggleUser.siteUrl + "_importResult"));
  this.csvImportBadResult = element(by.id(this.t31CSVToggleUser.siteUrl + "_importResultIcon"));

  //check T30citestprov9.webex.com 'Not Available'
  this.t30csvNotAvail = element(by.id(this.t30csvNotAvailableUser.siteUrl + "_notAvailable"));

  //check sjsite04.webex.com for 'Entitlement authentication failure' warning icon
  this.siteEntitlementAuthFailure = element(by.id(this.t30csvWbxNotEntitledUser.siteUrl + "_warningIcon"));

};

module.exports = SiteListPage;
