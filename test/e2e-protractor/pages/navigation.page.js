'use strict'

var Navigation = function(){

  this.tabs = element(by.css('cs-left-nav'));
  this.tabCount = element.all(by.repeater('page in pages'));
  this.homeTab = element(by.css('li.homeTab > a'));
  this.manageTab = element(by.css('li.orgTab > a'))
  this.usersTab = element(by.css('a[href="#users"]'));
  this.orgTab = element(by.css('a[href="#orgs"]'));
  this.callRoutingTab = element(by.css('a[href="#callrouting"]'));
  this.reportsTab = element(by.css('li.reportTab > a'));
  this.supportTab = element(by.css('li.supportTab > a'));
  this.sharedSpacesTab = element(by.css('a[href="#spaces"]'));

  this.settings = element(by.id('setting-bar'));
  this.feedbackButton = element(by.id('feedback-btn'));
  this.username = element(by.binding('username'));
  this.orgname = element(by.binding('orgname'));
  this.userInfoButton = element(by.css('.user-info button'));
  this.logoutButton = element(by.id('logout-btn'));

  this.headerSearch = element(by.css('.header-search'));
  this.settingsMenu = element(by.css('.settings-menu'));
  this.userInfo = element(by.css('.user-info'));

  this.clickHome = function() {
    this.homeTab.click();
  };

  this.clickOrganization = function() {
    this.manageTab.click();
    this.orgTab.click();
  };

  this.clickUsers = function() {
    this.manageTab.click();
    this.usersTab.click();
  };

  this.clickSharedSpaces = function() {
    this.manageTab.click();
    this.sharedSpacesTab.click();
  };

  this.clickCallRouting = function() {
    this.manageTab.click();
    this.callRoutingTab.click();
  };

  this.clickReports = function() {
    this.reportsTab.click();
  };

  this.clickSupport = function() {
    this.supportTab.click();
  };

  this.getTabCount = function() {
    return this.tabCount.then(function(tabs){
      return tabs.length;
    });
  };

  this.expectCurrentUrl = function(url) {
    browser.wait(function(){
      return browser.getCurrentUrl().then(function(currentUrl){
        return currentUrl.indexOf(url) !== -1;
      });
    });
    expect(browser.getCurrentUrl()).toContain(url);
  };

  this.expectDriverCurrentUrl = function(url) {
    browser.wait(function(){
      return browser.driver.getCurrentUrl().then(function(currentUrl){
        return currentUrl.indexOf(url) !== -1;
      });
    });
    expect(browser.driver.getCurrentUrl()).toContain(url);
  };

  this.expectAdminSettingsDisplayed = function(expectation) {
    expect(this.headerSearch.isDisplayed()).toBe(expectation);
    expect(this.settingsMenu.isDisplayed()).toBe(expectation);
    expect(this.userInfo.isDisplayed()).toBe(expectation);
    expect(this.tabs.isDisplayed()).toBe(expectation);
  };

  this.hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
    });
  };

  this.logout = function() {
    this.userInfoButton.click();
    this.logoutButton.click();
  };
};

module.exports = Navigation;