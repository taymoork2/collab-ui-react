'use strict';

var testModule = require('./accountorgservice');

describe('Service : AccountOrgService', function () {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$httpBackend',
      'AccountOrgService',
      'Authinfo'
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7');

    this.appSecurityRegex = /.*\/settings\/clientSecurityPolicy\.*/;
    this.blockExternalCommuncationRegex = /.*\/settings\/blockExternalCommunications\.*/;
    this.fileSharingControlRegex = /.*\/settings\.*/;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Block External Communication ', function () {
    //Block External Communcation Setter check
    it('should set blcok external communication setting', function () {
      this.$httpBackend.whenPUT(this.blockExternalCommuncationRegex).respond([200, {}]);

      this.AccountOrgService.setBlockExternalCommunication(this.Authinfo.getOrgId(), true).then(function (response) {
        expect(response.status).toEqual(200);
      });
      this.$httpBackend.flush();
    });

    //Block External Communcation Setter Getter check
    it('should get blcok external communication setting', function () {
      this.$httpBackend.whenGET(this.blockExternalCommuncationRegex).respond(function () {
        var data = {
          blockExternalCommunications: true,
        };
        return [200, data];
      });

      this.AccountOrgService.getBlockExternalCommunication(this.Authinfo.getOrgId()).then(function (blockExternalCommunication) {
        expect(blockExternalCommunication).toBe(true);
      });
      this.$httpBackend.flush();
    });
  });

  describe('File Sharing Control ', function () {
    beforeEach(function () {
      this.$httpBackend.whenGET(this.fileSharingControlRegex).respond({
        orgSettings: ['{ "desktopFileShareControl": "BLOCK_BOTH", "mobileFileShareControl": "NONE", "webFileShareControl": "NONE", "botFileShareControl": "NONE" }'],
      });
    });

    //File Sharing Control check
    it('should set File Sharing Control', function () {
      this.$httpBackend.expectPATCH(this.fileSharingControlRegex).respond([200, {}]);

      this.AccountOrgService.setFileSharingControl(this.Authinfo.getOrgId(), {}).then(function (response) {
        expect(response.status).toEqual(200);
      });
      this.$httpBackend.flush();
    });

    //File Sharing Control Setter Getter check
    it('should get block desktpAppDownload', function () {
      this.AccountOrgService.getFileSharingControl(this.Authinfo.getOrgId()).then(function (fileShareControl) {
        expect(fileShareControl).toEqual({
          blockDesktopAppDownload: true,
          blockWebAppDownload: false,
          blockMobileAppDownload: false,
          blockBotsDownload: false,
          blockDesktopAppUpload: true,
          blockWebAppUpload: false,
          blockMobileAppUpload: false,
          blockBotsUpload: false,
        });
      });
      this.$httpBackend.flush();
    });
  });
});
