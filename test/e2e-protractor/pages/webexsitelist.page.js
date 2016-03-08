var SiteListPage = function () {
  this.t31CSVToggleUser = {
    // siteUrl: 't30citestprov6.webex.com',
    // testAdminUsername: 't31r1-csvtoggle-adm@mailinator.com',
    siteUrl: 'sjsite14.webex.com',
    testAdminUsername: 'sjsite14-lhsieh@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.siteListPageId = element(by.id('site-list'));
  this.conferencingLink = element(by.css('a[href="#site-list"]'));
  this.csvColumnId = element(by.id('id-siteCsvColumnHeader'));

  this.csvExportId = element(by.id(this.t31CSVToggleUser.siteUrl + "_export"));
  this.csvImportId = element(by.id(this.t31CSVToggleUser.siteUrl + "_import"));

  this.xLaunchExportUsersT31CSV = element(by.id(this.t31CSVToggleUser.siteUrl + "_xlaunch-export-users"));
  this.xLaunchImportUsersT31CSV = element(by.id(this.t31CSVToggleUser.siteUrl + "_xlaunch-import-users"));

  //check T30citestprov9.webex.com 'Not Available'
  this.t30csvNotAvail = element(by.id("t30citestprov9.webex.com" + "_NA"));

  //check cisjsite031.webex.com 'Not Available'
  this.t31csvNotAvail = element(by.id("cisjsite031.webex.com" + "_NA"));
};

module.exports = SiteListPage;
