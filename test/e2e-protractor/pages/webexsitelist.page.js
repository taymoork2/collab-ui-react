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

  this.siteListPageId = element(by.id('site-list'));
  this.conferencingLink = element(by.css('a[href="#site-list"]'));
  this.csvColumnId = element(by.id('id-siteCsvColumnHeader'));
  this.licenseTypesColumnId = element(by.id('site-license-types'));
  this.singleLicenseSiteId = element(by.id('t30citestprov44.webex.com_licenseType'));
  this.multiLicenseSiteId = element(by.id('t30citestprov6.webex.com_licenseType'));
};

module.exports = SiteListPage;
