'use strict';

var fs = require('fs');
var path = require('path');

var SSOWizardPage = function () {
  this.viewSsoSettings = element(by.id('viewSsoSettings'));
  this.downloadMeta = element(by.id('downloadMeta'));
  this.testSsoConnectionBtn = element(by.id('testSsoConnectionBtn'));
  this.fileToUploadBtnHolder = element(by.id('fileToUploadBtnHolder'));

  this.nextBtnIsPresent = function () {
    return browser.isElementPresent(by.buttonText('Next'));
  };

  this.testBrowserFileDownload = function (filename) {
    if (fs.existsSync(filename)) {
      // Make sure the browser doesn't have to rename the download.
      fs.unlinkSync(filename);
    }
    this.initiateMetaDataDownload();
    browser.driver.wait(function () {
      return fs.existsSync(filename);
    }, 5000).then(function () {
      expect(fs.readFileSync(filename, { encoding: 'utf8' }));
    });
  };

  this.initiateMetaDataDownload = function () {
    utils.waitForAttribute(this.downloadMeta, 'download', 'idb-meta-3aa8a8a2-b953-4905-b678-0ae0a3f489f8-SP.xml');
    utils.click(ssowizard.downloadMeta);
  };

  this.uploadMetaData = function () {
    var fileToUpload = '../data/federation-metadata.xml', absolutePath = path.resolve(__dirname, fileToUpload);
    utils.fileSendKeys(this.fileToUploadBtnHolder, absolutePath);
  };

  this.expectSSOSucceeded = function () {
    return expect($('.cui-panel__title').getText()).toContain('Single Sign-on succeeded.');
  };
};

module.exports = SSOWizardPage;
