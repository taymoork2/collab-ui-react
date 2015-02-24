'use strict';

var Wizard = function () {
  this.wizard = element(by.css('.wizard'));
  this.mainView = element(by.css('.wizard-main'));
  this.leftNav = element(by.css('.wizard-nav'));
  this.reviewTab = element(by.id('wizard-planReview-link'));
  this.serviceSetupTab = element(by.id('wizard-serviceSetup-link'));
  this.enterpriseTab = element(by.id('wizard-enterpriseSettings-link'));
  this.addusersTab = element(by.id('wizard-addUsers-link'));
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
  this.usersfield = element(by.id('usersfield'));
  this.dirDomainInput = element(by.id('dirDomainText'));
  this.toInstallConnectorBtn = element.all(by.css('[ng-click="changeStep(\'installConnector\')"]'));
  this.toSyncStatusBtn = element.all(by.css('[ng-click="changeStep(\'syncStatus\')"]'));
  this.finishTab = element(by.id('wizard-finish-link'));
  this.fusionIntro = element(by.id('fuse-setup-intro'));
  this.fusionFuse = element(by.id('fuse-setup-fuse'));

  this.clickPlanReview = function () {
    this.reviewTab.click();
  };

  this.clickServiceSetup = function () {
    this.serviceSetupTab.click();
  };

  this.clickEnterpriseSettings = function () {
    this.enterpriseTab.click();
  };

  this.clickAddUsers = function () {
    this.addusersTab.click();
  };
};

module.exports = Wizard;
