'use strict';

var Wizard = function () {
  this.wizard = element(by.css('.wizard'));
  this.mainView = element(by.css('.wizard-main'));
  this.leftNav = element(by.css('.wizard-nav'));
  this.reviewTab = element(by.css('#wizard-planReview-link'));
  this.enterpriseTab = element(by.css('#wizard-enterpriseSettings-link'));
  this.addusersTab = element(by.css('#wizard-addUsers-link'));
  this.mainviewTitle = element(by.css('.wizard-main-title'));
  this.mainviewSubtitle = element(by.css('.wizard h3'));
  this.radiobuttons = element.all(by.css('label.cs-radio'));
  this.beginBtn = element(by.buttonText('Begin'));
  this.backBtn = element(by.buttonText('Back'));
  this.nextBtn = element(by.buttonText('Next'));
  this.saveBtn = element(by.buttonText('Save'));
  this.finishBtn = element(by.buttonText('Finish'));
  this.esEvaluateBtn = element(by.css('[ng-click="evaluateStep(\'initial\', \'enterpriseSettings\')"]'));
  this.toExpCloudDataBtn = element.all(by.css('[ng-click="changeStep(\'exportCloudData\')"]'));
  this.toTestSSOBtn = element.all(by.css('[ng-click="changeStep(\'testSSO\')"]'));
  this.toEnableSSOBtn = element(by.css('[ng-click="changeStep(\'enableSSO\')"]'));
  this.enableSSOBtn = element(by.css('[ng-click="enableSSO()"]'));
  this.auEvaluateBtn = element(by.css('[ng-click="evaluateStep(\'initial\', \'addUsers\')"]'));
  this.usersfield = element(by.css('#usersfield-wiz'));
  this.dirDomainInput = element(by.css('#dirDomainText'));
  this.toInstallConnectorBtn = element.all(by.css('[ng-click="changeStep(\'installConnector\')"]'));
  this.toSyncStatusBtn = element.all(by.css('[ng-click="changeStep(\'syncStatus\')"]'));
  this.finishTab = element(by.css('#wizard-finish-link'));
  this.fusionIntro = element(by.css('#fuse-setup-intro'));
  this.fusionFuse = element(by.css('#fuse-setup-fuse'));

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
