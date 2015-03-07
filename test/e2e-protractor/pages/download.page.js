'use strict'

var DownloadPage = function () {
  this.sendStatus = element(by.id('sendStatus'));
  this.account = element(by.id('account'));
  this.tabs = element(by.id('tabs'));
  this.userName = element(by.binding('username'));
  this.orgName = element(by.binding('orgname'));
  this.logoutButton = element(by.id('logout-btn'));
  this.iconSearch = element(by.id('icon-search'));
  this.searchInput = element(by.id('search-input'));
  this.settingBar = element(by.id('setting-bar'));
}

module.exports = DownloadPage;
