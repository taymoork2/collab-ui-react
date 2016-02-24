var SiteListPage = function () {
  this.t31CSVToggleUser = {
    siteUrl: 't30citestprov6.webex.com',
    testAdminUsername: 't31r1-csvtoggle-adm@mailinator.com',
    testAdminPassword: 'Cisco!23'
  };

  this.siteListPageId = element(by.id('site-list'));
  this.conferencingLink = element(by.css('a[href="#site-list"]'));
  this.csvColumnId = element(by.id('id-siteCsvColumnHeader'));
};

module.exports = SiteListPage;
