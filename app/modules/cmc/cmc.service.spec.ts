import cmcModule from './index';
import { ICmcUser } from './cmcUser.interface';

describe('CmcService', () => {

  beforeEach(function () {
    this.initModules(cmcModule);
    this.injectDependencies(
      'CmcService',
      '$scope',
      '$httpBackend',
      'Orgservice',
    );
  });

  it('should have CmcService resources available', function () {
    expect(this.CmcService.getUserData).toBeTruthy();
  });

  it('should determine whether cmc settings are allowed for this org', function (done) {
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({}, 200);
    });
    spyOn(this.CmcService, 'hasCmcService').and.returnValue(true);
    let orgId = '1234';
    this.CmcService.allowCmcSettings(orgId).then(function (result) {
      expect(result).toBe(true);
      done();
    });
    this.$scope.$apply();
  });

  describe('phone number existence', function () {
    let user: ICmcUser = <ICmcUser> {
      meta: {
        organizationID: '1234',
      },
    };

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('returns null of phone number not found in same org', function () {

      let scimNoUserResponse = {
        Resources: [],
      };

      this.$httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/1234/v1/Users?filter=phoneNumbers[type eq "mobile" and value eq "+471234"]')
        .respond(scimNoUserResponse);

      this.CmcService.checkUniqueMobileNumber(user, '+471234').then(function (res) {
        expect(res).toBeNull();
      });

      this.$httpBackend.flush();

    });

    it('returns username that has the phone number', function () {

      let scimResponseExistingUser = {
        Resources: [
          { userName: 'atlas' },
        ],
      };

      this.$httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/1234/v1/Users?filter=phoneNumbers[type eq "mobile" and value eq "+471234"]')
        .respond(scimResponseExistingUser);


      this.CmcService.checkUniqueMobileNumber(user, '+471234').then(function (res) {
        expect(res).toEqual('atlas');
      });

      this.$httpBackend.flush();

    });
  });
});
