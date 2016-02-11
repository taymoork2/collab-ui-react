(function () {
  'use strict';

  describe('Service: DigitalRiver', function () {
    var DigitalRiverService, httpBackend, Config;

    beforeEach(module('Core'));

    beforeEach(
      inject(function (_DigitalRiverService_, _$httpBackend_, _Config_) {
        DigitalRiverService = _DigitalRiverService_;
        httpBackend = _$httpBackend_;
        Config = _Config_;
      })
    );

    describe('getDrReferrer', function () {
      it('should return correct value', function () {
        expect(DigitalRiverService.getDrReferrer()).toEqual('digitalriver-ZGlnaXRhbHJpdmVy');
      });
    });

    describe('http methods', function () {
      it('getUserFromEmail', function () {
        httpBackend.expectPOST('https://idbroker.webex.com/idb/oauth2/v1/access_token').respond('not used');
        httpBackend.expectGET(Config.getAdminServiceUrl() + 'ordertranslator/digitalriver/user/foo@bar.com/exists').respond('not used');
        DigitalRiverService.getUserFromEmail('foo@bar.com');
        httpBackend.flush();
      });
      it('addDrUser', function () {
        httpBackend.expectPOST('https://idbroker.webex.com/idb/oauth2/v1/access_token').respond('not used');
        httpBackend.expectPOST(Config.getAdminServiceUrl() + 'ordertranslator/digitalriver/user').respond('not used');
        DigitalRiverService.addDrUser();
        httpBackend.flush();
      });
    });

  });
})();
