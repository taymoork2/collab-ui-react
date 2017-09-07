'use strict';

var testModule = require('./accountorgservice');

describe('Service : AccountOrgService', function () {
  beforeEach(angular.mock.module(testModule));

  var AccountOrgService, $httpBackend;
  var authInfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7'),
  };
  var appSecurityRegex = /.*\/settings\/clientSecurityPolicy\.*/;
  var blockExternalCommuncationRegex = /.*\/settings\/blockExternalCommunications\.*/;
  var fileSharingControlRegex = /.*\/settings\/fileSharingControl\.*/;

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _AccountOrgService_) {
    $httpBackend = _$httpBackend_;
    AccountOrgService = _AccountOrgService_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  // Organization validity checks

  describe('it should catch illegal parameter passes and', function () {
    it('should verify that a valid OrgID is passed to getAppSecurity and setAppSecurity', function () {
      AccountOrgService.getAppSecurity().catch(function (response) {
        expect(response).toBe('A Valid organization ID must be Entered');
      });

      AccountOrgService.setAppSecurity().catch(function (response) {
        expect(response).toBe('A Valid organization ID must be Entered');
      });
    });
  });

  describe('App Security ', function () {
    //App Security Setter check
    it('should set Appsecurity setting to clientSecurityPolicy', function () {
      $httpBackend.whenPUT(appSecurityRegex).respond([200, {}]);

      AccountOrgService.setAppSecurity(authInfo.getOrgId(), true).then(function (response) {
        expect(response.status).toEqual(200);
      });
      $httpBackend.flush();
    });

    //App Security Getter check
    it('should get Appsecurity setting from clientSecurityPolicy', function () {
      $httpBackend.whenGET(appSecurityRegex).respond(function () {
        var data = {
          clientSecurityPolicy: true,
        };
        return [200, data];
      });

      AccountOrgService.getAppSecurity(authInfo.getOrgId()).then(function (response) {
        expect(response.data.clientSecurityPolicy).toBe(true);
      });
      $httpBackend.flush();
    });
  });

  describe('Block External Communication ', function () {
    //Block External Communcation Setter check
    it('should set blcok external communication setting', function () {
      $httpBackend.whenPUT(blockExternalCommuncationRegex).respond([200, {}]);

      AccountOrgService.setBlockExternalCommunication(authInfo.getOrgId(), true).then(function (response) {
        expect(response.status).toEqual(200);
      });
      $httpBackend.flush();
    });

    //Block External Communcation Setter Getter check
    it('should get blcok external communication setting', function () {
      $httpBackend.whenGET(blockExternalCommuncationRegex).respond(function () {
        var data = {
          blockExternalCommunications: true,
        };
        return [200, data];
      });

      AccountOrgService.getBlockExternalCommunication(authInfo.getOrgId()).then(function (blockExternalCommunication) {
        expect(blockExternalCommunication).toBe(true);
      });
      $httpBackend.flush();
    });
  });
  describe('File Sharing Control ', function () {
    //File Sharing Control check
    it('should set File Sharing Control', function () {
      $httpBackend.whenPUT(fileSharingControlRegex).respond([200, {}]);

      AccountOrgService.setFileSharingControl(authInfo.getOrgId(), {}).then(function (response) {
        expect(response.status).toEqual(200);
      });
      $httpBackend.flush();
    });

    //File Sharing Control Setter Getter check
    it('should get blcok external communication setting', function () {
      $httpBackend.whenGET(fileSharingControlRegex).respond(function () {
        var data = {
          fileShareControl: {
            blockDesktopAppDownload: true,
            blockWebAppDownload: false,
            blockMobileAppDownload: false,
            blockBotsDownload: false,
            blockDesktopAppUpload: false,
            blockWebAppUpload: false,
            blockMobileAppUpload: false,
            blockBotsUpload: false },
        };
        return [200, data];
      });

      AccountOrgService.getBlockExternalCommunication(authInfo.getOrgId()).then(function (fileShareControl) {
        expect(fileShareControl.blockDesktopAppDownload).toBe(true);
      });
      $httpBackend.flush();
    });
  });
});
