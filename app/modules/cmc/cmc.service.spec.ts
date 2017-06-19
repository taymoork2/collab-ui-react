import cmcModule from './index';
import { ICmcUser } from './cmc.interface';

describe('CmcService', () => {

  beforeEach(function () {
    this.initModules(cmcModule);
    this.injectDependencies(
      'CmcService',
      '$scope',
      '$httpBackend',
      'Orgservice',
      '$q',
    );
  });

  it('should have CmcService resources available', function () {
    expect(this.CmcService.getUserData).toBeTruthy();
  });

  it('should determine whether cmc settings are allowed for this org', function (done) {
    spyOn(this.Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({
        success: true,
      }, true);
    });
    spyOn(this.CmcService, 'hasCmcService').and.returnValue(true);
    const orgId = '1234';
    this.CmcService.allowCmcSettings(orgId).then(function (result) {
      expect(result).toBe(true);
      done();
    });
    this.$scope.$apply();
  });

  describe('update phone number', function () {
    const user: ICmcUser = <ICmcUser> {
      userName: 'dummyUser',
      id: '9999',
      meta: {
        organizationID: '1234',
      },
    };

    beforeEach(function () {
      spyOn(this.CmcService, 'patchNumber').and.returnValue(this.$q.resolve({ status: 'whatever' }));
    });

    afterEach(function () {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('patches user phone number if number is unique', function () {

      const scimNoUser = {
        Resources: [],
      };
      this.$httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/1234/v1/Users?filter=phoneNumbers[type eq "mobile" and value eq "+471234"]')
        .respond(scimNoUser);

      this.CmcService.setMobileNumber(user, '+471234').then( (res) => {
        expect(res.status).toEqual('whatever');
        expect(this.CmcService.patchNumber).toHaveBeenCalled();
      }).catch( () => {
        fail('dont expect this to be rejected');
      });

      this.$httpBackend.flush();

    });

    it('patches user phone number if number is users own number', function () {

      const scimResponseExistingUser = {
        Resources: [
          { userName: user.userName },
        ],
      };
      this.$httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/1234/v1/Users?filter=phoneNumbers[type eq "mobile" and value eq "+471234"]')
        .respond(scimResponseExistingUser);

      this.CmcService.setMobileNumber(user, '+471234').then( (res) => {
        expect(res.status).toEqual('whatever');
        expect(this.CmcService.patchNumber).toHaveBeenCalled();
      }).catch( () => {
        fail('dont expect this to be rejected');
      });

      this.$httpBackend.flush();

    });

    it('throws error is number is not unique', function () {

      const scimResponseExistingUser = {
        Resources: [
          { userName: 'someOtherName' },
        ],
      };
      this.$httpBackend
        .when('GET', 'https://identity.webex.com/identity/scim/1234/v1/Users?filter=phoneNumbers[type eq "mobile" and value eq "+471234"]')
        .respond(scimResponseExistingUser);

      this.CmcService.setMobileNumber(user, '+471234').then( () => {
        fail('dont expect this to be rejected');
      })
      .catch( (res) => {
        expect(res.data.message).toEqual('+471234 cmc.failures.alreadyRegisteredForAtLeastOneMoreUser someOtherName');
        expect(this.CmcService.patchNumber).not.toHaveBeenCalled();
      });

      this.$httpBackend.flush();

    });
  });
});
