'use strict';

var Navigation = function () {

  this.tabs = element(by.css('cs-left-nav'));
  this.tabCount = element.all(by.repeater('page in pages'));
  this.homeTab = element(by.css('li.overviewTab > a'));
  this.usersTab = element(by.css('li.userTab > a'));
  this.accountTab = element(by.css('li.accountTab > a'));
  this.orgTab = element(by.css('a[href="#organization"]'));
  this.callRoutingTab = element(by.css('a[href="#callrouting"]'));
  this.fusionTab = element(by.css('a[href="#fusion"]'));
  this.newReportsTab = element(by.cssContainingText('span', 'New Reports'));
  this.reportsTab = element(by.css('li.reportTab > a'));
  this.supportTab = element(by.css('li.supportTab > a'));
  this.devicesTab = element(by.css('li.deviceTab > a'));
  this.customersTab = element(by.css('li.customerTab > a'));
  this.developmentTab = element(by.css('li.developmentTab > a'));
  this.servicesTab = element(by.css('li.servicesTab > a'));
  this.meetingsTab = element(by.css('a[href="#meetings"]'));
  this.mediaFusionMgmtTab = element(by.css('a[href="#mediafusionconnector"]'));
  this.enterpriseResourcesTab = element(by.css('a[href="#vts"]'));
  this.utilizationTab = element(by.css('a[href="#utilization"]'));

  this.settings = element(by.id('setting-bar'));
  this.feedbackLink = element(by.id('feedback-lnk'));
  this.username = element(by.binding('username'));
  this.orgname = element(by.binding('orgname'));
  this.userInfoButton = element(by.css('.user-info button'));
  this.logoutButton = element(by.css('#logout-btn a'));

  this.headerSearch = element(by.css('.header-search'));
  this.settingsMenu = element(by.css('.settings-menu .dropdown-toggle'));
  this.userInfo = element(by.css('.user-info'));
  this.dropdownItems = element.all(by.repeater('item in menuItems')).all(by.tagName('a'));
  this.launchPartnerButton = element(by.css('#launch-partner-btn a'));

  this.clickDevelopmentTab = function () {
    utils.click(this.developmentTab);
  };

  this.clickServicesTab = function () {
    utils.click(this.servicesTab);
  };

  this.clickMediaFusionManagement = function () {
    this.clickServicesTab();
    utils.click(this.mediaFusionMgmtTab);
    this.expectCurrentUrl('/mediafusionconnector');
  };

  this.clickHome = function () {
    utils.click(this.homeTab);
    this.expectCurrentUrl('/overview');
  };

  this.clickOrganization = function () {
    this.clickDevelopmentTab();
    utils.click(this.orgTab);
    this.expectCurrentUrl('/organization');
  };

  this.clickCustomers = function () {
    utils.click(this.customersTab);
    this.expectCurrentUrl('/customers');
  };

  this.clickUsers = function () {
    utils.click(this.usersTab);
    this.expectCurrentUrl('/users');
  };

  this.clickDevices = function () {
    utils.click(this.devicesTab);
    this.expectCurrentUrl('/devices');
  };

  this.clickCallRouting = function () {
    this.clickDevelopmentTab();
    utils.click(this.callRoutingTab);
    this.expectCurrentUrl('/callrouting');
  };

  this.clickReports = function () {
    utils.click(this.reportsTab);
    this.expectCurrentUrl('/reports');
  };

  this.clickNewReports = function () {
    this.clickDevelopmentTab();
    utils.click(this.newReportsTab);
    this.expectCurrentUrl('/partner/newreports');
  };

  this.clickSupport = function () {
    utils.click(this.supportTab);
    this.expectCurrentUrl('/support');
  };

  this.clickFusion = function () {
    this.clickServicesTab();
    utils.click(this.fusionTab);
    this.expectCurrentUrl('/fusion');
  };

  this.clickMeetings = function () {
    this.clickDevelopmentTab();
    utils.click(this.meetingsTab);
    this.expectCurrentUrl('/meetings');
  };

  this.clickEnterpriseResource = function () {
    this.clickDevelopmentTab();
    utils.click(this.enterpriseResourcesTab);
    this.expectCurrentUrl('/vts');
  };

  this.clickUtilization = function () {
    this.clickDevelopmentTab();
    utils.click(this.utilizationTab);
    this.expectCurrentUrl('/utilization');
  };

  this.clickFirstTimeWizard = function () {
    utils.click(this.settingsMenu);
    utils.click(this.dropdownItems.get(0));
  };

  this.clickOrgProfile = function () {
    utils.click(this.accountTab);
  };

  this.getTabCount = function () {
    return this.tabCount.then(function (tabs) {
      return tabs.length;
    });
  };

  this.expectCurrentUrl = function (url) {
    browser.wait(function () {
      return browser.getCurrentUrl().then(function (currentUrl) {
        return currentUrl.indexOf(url) !== -1;
      });
    });
  };

  this.expectDriverCurrentUrl = function (url) {
    browser.wait(function () {
      return browser.driver.getCurrentUrl().then(function (currentUrl) {
        return currentUrl.indexOf(url) !== -1;
      });
    });
  };

  this.expectAdminSettingsNotDisplayed = function () {
    utils.expectIsNotDisplayed(this.tabs);
    utils.expectIsNotDisplayed(this.userInfo);
    utils.expectIsNotDisplayed(this.headerSearch);
    utils.expectIsNotDisplayed(this.settingsMenu);
  };

  this.hasClass = function (element, cls) {
    return element.getAttribute('class').then(function (classes) {
      return classes.split(' ').indexOf(cls) !== -1;
    });
  };

  this.logout = function () {
    utils.click(this.userInfoButton);
    utils.click(this.logoutButton);
    if (process.env.LAUNCH_URL) {
      this.expectDriverCurrentUrl('/login');
    } else {
      this.expectDriverCurrentUrl('idbroker.webex.com');
    }

  };

  this.sendFeedback = function () {
    utils.click(this.userInfoButton);
    utils.click(this.feedbackLink);
  };

  this.launchPartnerOrgPortal = function () {
    utils.click(this.userInfoButton);
    utils.click(this.launchPartnerButton);
  };
};

module.exports = Navigation;
