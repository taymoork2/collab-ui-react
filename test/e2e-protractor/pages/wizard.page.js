'use strict';

var Wizard = function () {
  this.wizard = element(by.css('.wizard'));
  this.mainView = element(by.css('.wizard-main'));
  this.leftNav = element(by.css('.wizard-nav'));
  this.reviewTab = element(by.id('wizard-planReview-link'));
  this.serviceSetupTab = element(by.id('wizard-serviceSetup-link'));
  this.claimSipUrlFeature = element(by.id('sip-url-feature'));
  this.enterpriseTab = element(by.id('wizard-enterpriseSettings-link'));
  this.messagingTab = element(by.id('wizard-messagingSetup-link'));
  this.messageInteropFeature = element(by.id('messenger-interop-feature'));
  // this.addusersTab = element(by.id('wizard-addUsers-link'));
  this.addusersTab = element(by.css('.icon-add-users'));
  this.mainviewTitle = element(by.css('.wizard-main-title'));
  this.mainviewSubtitle = element(by.css('.wizard h3'));
  this.radiobuttons = element.all(by.css('label.cs-radio'));
  this.manualAddUsers = element(by.css('label.cs-radio[for="syncSimple"]'));
  this.beginBtn = element(by.id('wizardSaveNextBtn'));
  this.backBtn = element(by.buttonText('Back'));
  this.nextBtn = element(by.buttonText('Next'));
  this.saveBtn = element(by.buttonText('Save'));
  this.skipBtn = element(by.css('.skip-link'));
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

  this.clickPlanReview = function () {
    utils.click(this.reviewTab);
  };

  this.clickServiceSetup = function () {
    utils.click(this.serviceSetupTab);
  };

  this.clickEnterpriseSettings = function () {
    utils.click(this.enterpriseTab);
  };

  this.clickAddUsers = function () {
    utils.click(this.addusersTab);
  };

  this.clickMessagingSetup = function () {
    utils.click(this.messagingTab);
  };
};

module.exports = Wizard;
