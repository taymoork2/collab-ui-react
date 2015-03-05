'use strict'

var Navigation = function(){

  this.tabs = element(by.css('cs-left-nav'));
  this.tabCount = element.all(by.repeater('page in pages'));
  this.homeTab = element(by.css('li.overviewTab > a'));
  this.usersTab = element(by.css('li.userTab > a'));
  this.listUsersTab = element(by.css('a[href="#users"]'));
  this.orgTab = element(by.css('a[href="#organization"]'));
  this.callRoutingTab = element(by.css('a[href="#callrouting"]'));
  this.fusionTab = element(by.css('.developmentTab a[href="#fusion"]'));
  this.reportsTab = element(by.css('.reportTab'));
  this.supportTab = element(by.css('li.supportTab > a'));
  this.devicesTab = element(by.css('li.deviceTab > a'));
  this.customersTab = element(by.css('li.customerTab > a'));
  this.developmentTab = element(by.css('li.developmentTab > a'));
  this.meetingsTab = element(by.css('a[href="#meetings"]'));

  this.settings = element(by.id('setting-bar'));
  this.feedbackButton = element(by.id('feedback-btn'));
  this.feedbackLink = element(by.id('feedback-lnk'));
  this.username = element(by.binding('username'));
  this.orgname = element(by.binding('orgname'));
  this.userInfoButton = element(by.css('.user-info button'));
  this.logoutButton = element(by.id('logout-btn'));

  this.headerSearch = element(by.css('.header-search'));
  this.settingsMenu = element(by.css('.settings-menu'));
  this.userInfo = element(by.css('.user-info'));
  this.dropdownItems = element.all(by.repeater('item in menuItems'));
  this.launchPartnerButton = element(by.id('launch-partner-btn'));

  this.clickDevelopmentTab = function() {
    utils.click(this.developmentTab);
  };

  this.clickHome = function() {
    this.homeTab.click();
    this.expectCurrentUrl('/overview');
  };

  this.clickOrganization = function() {
    this.clickDevelopmentTab();
    utils.click(this.orgTab);
    this.expectCurrentUrl('/organization');
  };

  this.clickCustomers = function() {
    this.customersTab.click();
    this.expectCurrentUrl('/customers');
  };

  this.clickUsers = function() {
    utils.click(this.usersTab);
    utils.click(this.listUsersTab);
    this.expectCurrentUrl('/users');
  };

  this.clickDevices = function() {
    this.devicesTab.click();
    this.expectCurrentUrl('/devices');
  };

  this.clickCallRouting = function() {
    this.clickDevelopmentTab();
    this.callRoutingTab.click();
    this.expectCurrentUrl('/callrouting');
  };

  this.clickReports = function() {
    this.reportsTab.click();
    this.expectCurrentUrl('/reports');
  };

  this.clickSupport = function() {
    this.supportTab.click();
    this.expectCurrentUrl('/support');
  };


  this.clickFusion = function() {
    this.clickDevelopmentTab();
    this.fusionTab.click();
    this.expectCurrentUrl('/fusion');
  };

   this.clickMeetings = function() {
    this.clickDevelopmentTab();
    this.meetingsTab.click();
    this.expectCurrentUrl('/meetings');
  };

  this.clickFirstTimeWizard = function() {
    utils.click(this.settingsMenu);
    utils.click(this.dropdownItems.first());
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
    utils.click(this.userInfoButton);
    utils.click(this.logoutButton);
  };

  this.sendFeedback = function() {
    utils.click(this.userInfoButton);
    utils.click(this.feedbackButton);
  };

  this.launchPartnerOrgPortal = function(){
    utils.click(this.userInfoButton);
    utils.click(this.launchPartnerButton);
  };
};

module.exports = Navigation;
