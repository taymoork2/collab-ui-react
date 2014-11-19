'use strict';

var Wizard = function () {
  this.wizard = element(by.css('.wizard'));
  this.mainView = element(by.css('.wizard-main-view'));
  this.leftNav = element(by.css('.wizard-nav'));
  this.reviewTab = element(by.css('#wizard-review-link'));
  this.enterpriseTab = element(by.css('#wizard-enterpriseSettings-link'));
  this.addusersTab = element(by.css('#wizard-addusers-link'));
  this.mainviewTitles = element.all(by.css('.wizard-main-title'));
  this.mainviewSubtitles = element.all(by.css('.wizard-subtitle'));
  this.radiobuttons = element.all(by.css('label.cs-radio'));
  this.beginBtn = element(by.css('#beginBtn'));
  this.esEvaluateBtn = element(by.css('[ng-click="evaluateStep(\'initial\', \'enterpriseSettings\')"]'));
  this.toExpCloudDataBtn = element.all(by.css('[ng-click="changeStep(\'exportCloudData\')"]'));
  this.toTestSSOBtn = element.all(by.css('[ng-click="changeStep(\'testSSO\')"]'));
  this.toEnableSSOBtn = element(by.css('[ng-click="changeStep(\'enableSSO\')"]'));
  this.enableSSOBtn = element(by.css('[ng-click="enableSSO()"]'));
  this.auEvaluateBtn = element(by.css('[ng-click="evaluateStep(\'initial\', \'addUsers\')"]'));
  this.usersfield = element(by.css('#usersfield-wiz'));
  this.finishBtn = element.all(by.css('[ng-click="changeTab(\'finish\')"]'));
  this.dirDomainInput = element(by.css('#dirDomainText'));
  this.toInstallConnectorBtn = element.all(by.css('[ng-click="changeStep(\'installConnector\')"]'));
  this.toSyncStatusBtn = element.all(by.css('[ng-click="changeStep(\'syncStatus\')"]'));
  this.closeBtn = element(by.css('[ng-click="finish()"]'));
  this.finishTab = element(by.css('#wizard-finish-link'));

  this.clickPlanReview = function () {
    this.reviewTab.click();
  };

  this.clickEnterpriseSettings = function () {
    this.enterpriseTab.click();
  };

  this.clickAddUsers = function () {
    this.addusersTab.click();
  };
};

module.exports = Wizard;
