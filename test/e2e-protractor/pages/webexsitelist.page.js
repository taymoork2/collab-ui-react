var WebExSiteListPage = function () {
  this.siteListPageId = element(by.id('site-list'));
  this.conferencingLink = element(by.css('a[href="#/site-list"]'));
};

module.exports = WebExSiteListPage;
