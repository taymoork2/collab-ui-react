import legalHoldModuleName from './index';
import { LegalHoldService } from './legal-hold.service';
import { Actions } from './legal-hold.service';
import { Matter } from './matter.model';
import { ICustodian } from './legal-hold.interfaces';
import { Authinfo } from 'modules/core/scripts/services/authinfo';
import { UrlConfig } from 'modules/core/config/urlConfig';

type Test = atlas.test.IServiceTest<{
  Authinfo: Authinfo;
  LegalHoldService: LegalHoldService;
  UrlConfig: UrlConfig;
}>;

describe('Service: LegalHoldService', () => {

  beforeEach(function (this: Test) {
    this.initModules(legalHoldModuleName);
    this.injectDependencies(
      'Authinfo',
      'LegalHoldService',
      'UrlConfig',
    );

    this.matterList = _.cloneDeep(getJSONFixture('core/json/legalHold/matters.json'));
    this.URL = 'https://atlas-intb.ciscospark.com/admin/api/v1/retention/api/v1/admin/onhold/matter?operationType=';
    this.getUserUrl = 'https://atlas-intb.ciscospark.com/admin/api/v1/user?email=';

    spyOn(this.Authinfo, 'getUserId').and.returnValue('user123');
    installPromiseMatchers();
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Basic matter functions', () => {
    it('should create a matter passes without flush', function (this: Test) {
      const matter = Matter.matterFromResponseData(this.matterList[1]);
      this.Authinfo.getUserId.and.returnValue(this.matterList[1]['createdBy']);
      const data = {
        caseId: 'case123',
      };
      matter.caseId = 'case123';
      this.$httpBackend.expectPOST(`${this.URL}${Actions.CREATE}`).respond(200, data);
      expect(this.LegalHoldService.createMatter(this.matterList[1]['orgId'], this.matterList[1]['matterName'], this.matterList[1]['matterDescription'], this.matterList[1]['creationDate'], this.matterList[1]['usersUUIDList'])).toBeResolvedWith(matter);
    });

    it('should release the matter', function (this: Test) {
      const releaseDate = new Date(2018, 1, 5);
      const matter = new Matter('org123', 'case123', 'user123', releaseDate, 'matterName', 'matterDesc', releaseDate);
      this.$httpBackend.expectPOST(`${this.URL}${Actions.UPDATE}`).respond(200);
      expect(this.LegalHoldService.releaseMatter(matter, releaseDate)).toBeResolved();
    });

    it('should read the matter', function (this: Test) {
      const matter = this.matterList[1];
      const resultMatter = Matter.matterFromResponseData(matter);
      this.$httpBackend.expectGET(`${this.URL}${Actions.READ}&orgId=123&caseId=case456`).respond(200, matter);
      expect(this.LegalHoldService.readMatter('123', 'case456')).toBeResolvedWith(resultMatter);
    });

    it('should delete the matter', function (this: Test) {
      const expParams = {
        orgId: '123',
        caseId: 'case456',
      };
      this.$httpBackend.expectPOST(`${this.URL}${Actions.DELETE}`, expParams).respond(200);
      expect(this.LegalHoldService.deleteMatter('123', 'case456')).toBeResolved();
      this.$httpBackend.expectPOST(`${this.URL}${Actions.DELETE}`, expParams).respond(500);
      expect(this.LegalHoldService.deleteMatter('123', 'case456')).toBeRejected();
    });

    it('should get matter listing for an org', function (this: Test) {
      const expParams = {
        orgId: '123',
      };
      this.$httpBackend.expectPOST(`${this.URL}${Actions.LIST_MATTERS_FOR_ORG}`, expParams).respond(200, this.matterList);
      expect(this.LegalHoldService.listMatters('123')).toBeResolvedWith(this.matterList);
    });

    it('should get user listing for a matter', function (this: Test) {
      const expParams = {
        orgId: '123',
        caseId: 'case123',
      };
      const expReturn = this.matterList[0].usersUUIDList;
      this.$httpBackend.expectPOST(`${this.URL}${Actions.LIST_USERS}`, expParams).respond(200, this.matterList[0].usersUUIDList);
      expect(this.LegalHoldService.listUsersInMatter('123', 'case123')).toBeResolvedWith(expReturn);
    });

    it('should add users to matter', function (this: Test) {
      const expParams = {
        orgId: '123',
        caseId: 'case123',
        usersUUIDList: ['uu123', 'uu124'],
      };
      spyOn(this.LegalHoldService, 'readMatter').and.returnValue(this.matterList[0]);
      this.$httpBackend.expectPOST(`${this.URL}${Actions.ADD_USERS}`, expParams).respond(200, this.matterList);
      expect(this.LegalHoldService.addUsersToMatter('123', 'case123', ['uu123', 'uu124'])).toBeResolvedWith(this.matterList[0]);
    });

    it('should remove users from matter', function (this: Test) {
      const expParams = {
        orgId: '123',
        caseId: 'case123',
        usersUUIDList: ['uu123', 'uu124'],
      };
      spyOn(this.LegalHoldService, 'readMatter').and.returnValue(this.matterList[0]);
      this.$httpBackend.expectPOST(`${this.URL}${Actions.REMOVE_USERS}`, expParams).respond(200, this.matterList);
      expect(this.LegalHoldService.removeUsersFromMatter('123', 'case123', ['uu123', 'uu124'])).toBeResolved();
    });

    it('should get matter id listing for a user', function (this: Test) {
      const expParams = {
        orgId: '123',
        userUUID: 'user123',
      };
      const expReturn = [
        '123', '456',
      ];
      this.$httpBackend.expectPOST(`${this.URL}${Actions.LIST_MATTERS_FOR_USER}`, expParams).respond(200, expReturn);
      expect(this.LegalHoldService.listMatterIdsForUser('123', 'user123')).toBeResolvedWith(expReturn);
    });
  });

  describe('Retrieving user info from email address', function (this: Test) {
    it('and reject if user is not found', function () {
      this.$httpBackend.expectGET(this.getUserUrl + 'test1%40gmail.com').respond(404);
      expect(this.LegalHoldService.getCustodian('test1@gmail.com')).toBeRejectedWith(jasmine.objectContaining({ status: 404 }));
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
      expect(this.LegalHoldService.getCustodian('test@gmail.com')).toBeResolvedWith(expResult);
    });
  });
});
