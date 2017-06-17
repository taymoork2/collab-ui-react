'use strict';

var DirSyncWizardPage = function () {
  this.btnDirSync = element(by.id('btnDirSync'));
  this.ssoModalHeader = element(by.id('ssoModalHeader'));

  this.domainCancelBtn = element(by.id('domainCancelBtn'));
  this.domainNextBtn = element(by.id('domainNextBtn'));
  this.dirDomainText = element(by.id('dirDomainText'));

  this.syncNowBtn = element(by.id('syncNowBtn'));
  this.installCancelBtn = element(by.id('installCancelBtn'));
  this.installBackBtn = element(by.id('installBackBtn'));
  this.installNextBtn = element(by.id('installNextBtn'));

  this.synchCancelBtn = element(by.id('synchCancelBtn'));
  this.synchBackBtn = element(by.id('synchBackBtn'));
  this.synchFinishBtn = element(by.id('synchFinishBtn'));

  this.closeSSOModal = element(by.id('closedirsyncModal'));
};

module.exports = DirSyncWizardPage;
