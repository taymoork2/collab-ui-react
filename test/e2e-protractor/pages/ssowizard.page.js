'use strict'

var SSOWizardPage = function(){

  this.btnSSO = element(by.id('btnSSO'));
  this.ssoModalHeader = element(by.id('ssoModalHeader'));

  this.fileToUploadText = element(by.id('fileToUploadText'));
  this.fileToUploadBtn = element(by.id('fileToUploadBtn'));
  this.fileToUploadTextHolder = element(by.id('fileToUploadTextHolder'));
  this.fileToUploadBtnHolder = element(by.id('fileToUploadBtnHolder'));
  this.importCancelBtn = element(by.id('importCancelBtn'));
  this.importNextBtn = element(by.id('importNextBtn'));

  this.downloadMeta = element(by.id('downloadMeta'));
  this.exportCancelBtn = element(by.id('exportCancelBtn'));
  this.exportBackBtn = element(by.id('exportBackBtn'));
  this.exportNextBtn = element(by.id('exportNextBtn'));

  this.ssoTestBtn = element(by.id('ssoTestBtn'));
  this.testssoCancelBtn = element(by.id('testssoCancelBtn'));
  this.testssoBackBtn = element(by.id('testssoBackBtn'));
  this.testssoNextBtn = element(by.id('testssoNextBtn'));

  this.enablessoCancelBtn = element(by.id('enablessoCancelBtn'));
  this.enablessoBackBtn = element(by.id('enablessoBackBtn'));
  this.enablessoFinishBtn = element(by.id('enablessoFinishBtn'));

  this.closeSSOModal = element(by.id('closeSSOModal'));
};

module.exports = SSOWizardPage;