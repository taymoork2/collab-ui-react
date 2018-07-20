import legalHoldModuleName from './index';
import { LegalHoldService, GetUserBy } from './legal-hold.service';
import { Actions } from './legal-hold.service';
import { Matter } from './matter.model';
import { ICustodian } from './legal-hold.interfaces';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { UrlConfig } from 'modules/core/config/urlConfig';

type Test = atlas.test.IServiceTest<{
  Authinfo: Authinfo;
  LegalHoldService: LegalHoldService;
  UrlConfig: UrlConfig;
  Userservice;
  $rootScope: ng.IRootScopeService;
}>;

describe('Service: LegalHoldService', () => {

  beforeEach(function (this: Test) {
    this.initModules(legalHoldModuleName);
    this.injectDependencies(
      'Authinfo',
      'LegalHoldService',
      'UrlConfig',
      'Userservice',
      '$rootScope',
    );

    this.matterList = _.cloneDeep(getJSONFixture('core/json/legalHold/matters.json'));
    this.matterUrl = 'https://retention-intb.ciscospark.com/retention/api/v1/admin/onhold/matter?operationType=';
    this.matterUsersUrl = 'https://retention-intb.ciscospark.com/retention/api/v1/admin/onhold/users?operationType=';
    this.getUserUrl = 'https://atlas-intb.ciscospark.com/admin/api/v1/user?email=';
    this.userserviceUser = {
      id: '123',
      name: {
        givenName: 'Jane',
        familyName: 'Doe',
      },
      emails: [{
        value: 'someone@somewhere.net',
      }],
      orgId: '12345',
    };

    this.updateUsersResult = {
      failList: ['123', 345],
      userListSize: 3,
    },

    spyOn(this.Authinfo, 'getUserId').and.returnValue('user123');
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.Userservice, 'getUserAsPromise').and.returnValue(this.$q.resolve({ data: this.userserviceUser }));
    installPromiseMatchers();
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Basic matter functions', () => {
    it('should create a matter', function (this: Test) {
      const matter = Matter.matterFromResponseData(this.matterList[1]);
      this.Authinfo.getUserId.and.returnValue(this.matterList[1]['createdBy']);
      const data = {
        caseId: 'case123',
      };
      matter.caseId = 'case123';
      this.$httpBackend.expectPOST(`${this.matterUrl}${Actions.CREATE}`).respond(200, data);
      expect(this.LegalHoldService.createMatter(this.matterList[1]['orgId'], this.matterList[1]['matterName'], this.matterList[1]['matterDescription'], this.matterList[1]['creationDate'], this.matterList[1]['usersUUIDList'])).toBeResolvedWith(matter);
    });

    it('should release the matter', function (this: Test) {
      const dateReleased = new Date(2018, 1, 5);
      const matter = new Matter('org123', 'case123', 'user123', dateReleased, 'matterName', 'matterDesc', dateReleased);
      this.$httpBackend.expectPOST(`${this.matterUrl}${Actions.UPDATE}`).respond(200);
      expect(this.LegalHoldService.releaseMatter(matter, dateReleased)).toBeResolved();
    });

    it('should read the matter', function (this: Test) {
      const matter = this.matterList[1];
      const resultMatter = Matter.matterFromResponseData(matter);
      const params = {
        orgId: '123',
        caseId: 'case456',
      };
      this.$httpBackend.expectPOST(`${this.matterUrl}${Actions.READ}`, params).respond(200, matter);
      expect(this.LegalHoldService.readMatter('123', 'case456')).toBeResolvedWith(resultMatter);
    });

    it('should delete the matter', function (this: Test) {
      const expParams = {
        orgId: '123',
        caseId: 'case456',
      };
      this.$httpBackend.expectPOST(`${this.matterUrl}${Actions.DELETE}`, expParams).respond(200);
      expect(this.LegalHoldService.deleteMatter('123', 'case456')).toBeResolved();
      this.$httpBackend.expectPOST(`${this.matterUrl}${Actions.DELETE}`, expParams).respond(500);
      expect(this.LegalHoldService.deleteMatter('123', 'case456')).toBeRejected();
    });

    it('should get matter listing for an org', function (this: Test) {
      const expParams = {
        orgId: '123',
      };
      this.$httpBackend.expectPOST(`${this.matterUrl}${Actions.LIST_MATTERS_FOR_ORG}`, expParams).respond(200, { mattersAssociatedWithOrg: this.matterList });
      this.LegalHoldService.listMatters('123')
        .then(result => {
          expect(_.size(result)).toBe(_.size(this.matterList));
        });
      this.$httpBackend.flush();
    });

    it('should get user listing for a matter', function (this: Test) {
      const expParams = {
        orgId: '123',
        caseId: 'case123',
      };
      const expReturn = this.matterList[0].usersUUIDList;
      this.$httpBackend.expectPOST(`${this.matterUsersUrl}${Actions.LIST_USERS}`, expParams).respond(200, { usersInMatter: this.matterList[0].usersUUIDList });
      expect(this.LegalHoldService.listUsersInMatter('123', 'case123')).toBeResolvedWith(expReturn);
    });

    it('should add users to matter', function (this: Test) {
      const expParams = {
        orgId: '123',
        caseId: 'case123',
        usersUUIDList: ['uu123', 'uu124'],
      };
      const expUserUpdateResult = {
        userListSize: 3,
        failList: ['uu123', 'uu124'],
      };
      spyOn(this.LegalHoldService, 'readMatter').and.returnValue(this.$q.resolve(Matter.matterFromResponseData(this.matterList[0])));
      this.$httpBackend.expectPOST(`${this.matterUsersUrl}${Actions.ADD_USERS}`, expParams).respond(200, this.updateUsersResult);
      expect(this.LegalHoldService.addUsersToMatter('123', 'case123', ['uu123', 'uu124'])).toBeResolvedWith(jasmine.objectContaining({ failList: expUserUpdateResult.failList }));
    });

    it('should remove users from matter', function (this: Test) {
      const expParams = {
        orgId: '123',
        caseId: 'case123',
        usersUUIDList: ['uu123', 'uu124'],
      };
      const expUserUpdateResult = {
        userListSize: 3,
        failList: ['uu123', 'uu124'],
      };
      spyOn(this.LegalHoldService, 'readMatter').and.returnValue(this.$q.resolve(this.matterList[0]));
      this.$httpBackend.expectPOST(`${this.matterUsersUrl}${Actions.REMOVE_USERS}`, expParams).respond(200, this.updateUsersResult);
      expect(this.LegalHoldService.removeUsersFromMatter('123', 'case123', ['uu123', 'uu124'])).toBeResolvedWith( jasmine.objectContaining({ failList: expUserUpdateResult.failList }));
    });

    it('should get matter id listing for a user', function (this: Test) {
      const expParams = {
        orgId: '123',
        userUUID: 'user123',
      };
      const expReturn = [
        '123', '456',
      ];
      this.$httpBackend.expectPOST(`${this.matterUsersUrl}${Actions.LIST_MATTERS_FOR_USER}`, expParams).respond(200, expReturn);
      expect(this.LegalHoldService.listMatterIdsForUser('123', 'user123')).toBeResolvedWith(expReturn);
    });
  });

  describe('Retrieving user info from email address', function (this: Test) {
    it('and reject if user is not found', function () {
      this.$httpBackend.expectGET(this.getUserUrl + 'test1%40gmail.com').respond(404, { status: 'error' });
      expect(this.LegalHoldService.getCustodian('12345', GetUserBy.EMAIL, 'test1@gmail.com')).toBeRejectedWith(jasmine.objectContaining({ error: 'legalHold.custodianImport.errorUserNotFound' }));
    });

    it('should return userId and first and last names if user is found', function () {
      const expResult: ICustodian = {
        userId: '123',
        firstName: 'Jane',
        lastName: 'Doe',
        orgId: '12345',
        emailAddress: 'test@gmail.com',
      };
      const expResponse = {
        id: '123',
        firstName: 'Jane',
        lastName: 'Doe',
        orgId: '12345',
        otherProp: 'something else',
      };
      this.$httpBackend.expectGET(this.getUserUrl + 'test%40gmail.com').respond(200, expResponse);
      expect(this.LegalHoldService.getCustodian('12345', GetUserBy.EMAIL, 'test@gmail.com')).toBeResolvedWith(expResult);
    });

    it('should find a user by id', function () {
      expect(this.LegalHoldService.getCustodian('12345', GetUserBy.ID, '123')).toBeResolvedWith(jasmine.objectContaining({ firstName: 'Jane' }));
    });
  });

  describe('Convert user chunk function', () => {
    let userArr;
    beforeEach(function () {
      userArr =  [['validUser@test.com', '12345'], ['validUser@test.com', '12345'], ['12345', '12345'], ['validUser2@test.com']];
      spyOn(this.LegalHoldService, 'getCustodian').and.callFake(function () {
        switch (arguments[2]) {
          case 'validUser@test.com':
            return this.$q.resolve({ userId: '12345' });
          case 'validUser2@test.com':
            return this.$q.resolve({ userId: '123456' });
          default:
            return this.$q.reject({ error: 'someError' });
        }
      });
    });
    it('should take an 2-d array of userIds or emails and return users and errors', function () {
      this.LegalHoldService.convertUsersChunk(userArr, GetUserBy.ID).then(result => {
        expect(result.success.length).toBe(3);
        expect(result.error.length).toBe(4);
      })
        .catch(fail);
      this.$rootScope.$apply();
    });
    it('should interrupt user conversion proccess, should reject and reset the cancel flag when cancelImport is called', function () {
      this.LegalHoldService.cancelConvertUsers();
      this.LegalHoldService.convertUsersChunk(userArr, GetUserBy.ID)
        .then(fail)
        .catch(e => {
          expect(e).toBe('legalHold.custodianImport.errorCanceledByUser');
        });
      this.$rootScope.$apply();
      this.LegalHoldService.convertUsersChunk(userArr,  GetUserBy.ID)
        .then(result => {
          expect(result.success.length).toBe(3);
          expect(result.error.length).toBe(4);
        })
        .catch(fail);
      this.$rootScope.$apply();
    });
  });
});
