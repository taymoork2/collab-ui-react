'use strict'

var Navigation = function(){
  this.tabs = element(by.id('tabs'));
  this.tabCount = element.all(by.repeater('tab in tabs'));
  this.homeTab = element(by.css('li[heading="Home"]'));
  this.usersTab = element(by.css('li[heading="Users"]'));
  this.manageTab = element(by.css('li[heading="Manage"]'));
  this.reportsTab = element(by.css('li[heading="Reports"]'));
  this.settings = element(by.id('setting-bar'));
  this.feedbackButton = element(by.id('feedback-btn'));
  this.username = element(by.binding('username'));
  this.orgname = element(by.binding('orgname'));
  this.logoutButton = element(by.id('logout-btn'));

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
}

module.exports = Navigation;