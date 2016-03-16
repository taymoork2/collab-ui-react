(function () {
  'use strict';

  describe('Service: DigitalRiver', function () {
    var DigitalRiverService, httpBackend, UrlConfig, $q;

    beforeEach(module('DigitalRiver'));

    beforeEach(
      inject(function (_DigitalRiverService_, _$httpBackend_, _UrlConfig_, _$q_) {
        DigitalRiverService = _DigitalRiverService_;
        httpBackend = _$httpBackend_;
        UrlConfig = _UrlConfig_;
        $q = _$q_;
      })
    );

    describe('getDrReferrer', function () {
      it('should return correct value', function () {
        expect(DigitalRiverService.getDrReferrer()).toEqual('digitalriver-ZGlnaXRhbHJpdmVy');
      });
    });

    describe('login service methods', function () {
      it('getUserFromEmail', function () {
        httpBackend.expectPOST('https://idbroker.webex.com/idb/oauth2/v1/access_token').respond('');
        httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + 'ordertranslator/digitalriver/user/foo@bar.com/exists').respond(200);
        DigitalRiverService.getUserFromEmail('foo@bar.com');
        httpBackend.flush();
      });

      it('getUserAuthToken', function () {
        httpBackend.expectPOST('https://idbroker.webex.com/idb/oauth2/v1/access_token').respond('');
        httpBackend.expectGET(UrlConfig.getAdminServiceUrl() + "ordertranslator/digitalriver/authtoken/" + "07e6a13a-a690-4857-a4ab-dd460f12478f").respond(200);
        DigitalRiverService.getUserAuthToken('07e6a13a-a690-4857-a4ab-dd460f12478f');
        httpBackend.flush();
      });

      it('addDrUser', function () {
        httpBackend.expectPOST('https://idbroker.webex.com/idb/oauth2/v1/access_token').respond('');
        httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'ordertranslator/digitalriver/user', 'emailPassword').respond(201);
        DigitalRiverService.addDrUser('emailPassword');
        httpBackend.flush();
      });
    });

    describe('activate service methods', function () {
      it('activateUser with a valid uuid', function () {
        var uuid = '0b17b44a-4fea-48d4-9660-3da55df5d782';
        httpBackend.expectPOST('https://idbroker.webex.com/idb/oauth2/v1/access_token').respond('');
        httpBackend.expectPATCH(UrlConfig.getAdminServiceUrl() + 'ordertranslator/online/accountstatus/' + uuid + '?accountStatus=active').respond(200);
        DigitalRiverService.activateUser(uuid);
        httpBackend.flush();
      });
      it('activateUser with missing and empty uuids', function () {
        expect(DigitalRiverService.activateUser()).toEqual($q.reject('blank uuid'));
        expect(DigitalRiverService.activateUser('')).toEqual($q.reject('blank uuid'));
      });
      it('activateProduct with a valid oid', function () {
        var oid = '0b17b44a-4fea-48d4-9660-3da55df5d782';
        httpBackend.expectPOST('https://idbroker.webex.com/idb/oauth2/v1/access_token').respond('');
        httpBackend.expectPOST(UrlConfig.getAdminServiceUrl() + 'ordertranslator/api/digitalriver/activate/' + oid).respond(200);
        DigitalRiverService.activateProduct(oid);
        httpBackend.flush();
      });
      it('activateProduct with missing and empty oids', function () {
        expect(DigitalRiverService.activateProduct()).toEqual($q.reject('blank oid'));
        expect(DigitalRiverService.activateProduct('')).toEqual($q.reject('blank oid'));
      });
    });

  });
})();
