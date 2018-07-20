import moduleName from './index';
import { IntegrationsManagementService } from './integrations-management.service';
import { IApplicationUsage, IApplicationUsageList, ICustomPolicy, UserQueryType, IGlobalPolicy, PolicyAction, PolicyType, SortOrder } from './integrations-management.types';

type Test = atlas.test.IServiceTest<{
  Authinfo,
  IntegrationsManagementService: IntegrationsManagementService,
  UrlConfig,
}>;

describe('Service: IntegrationsManagementService', () => {

  // notes:
  // - angular encodes params in a different way from encodeUriComponent.
  // - for more info, see: https://stackoverflow.com/questions/24542465/angularjs-how-uri-components-are-encoded
  function encodeUriQuery(val, pctEncodeSpaces) {
    return encodeURIComponent(val).
      replace(/%40/gi, '@').
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%3B/gi, ';').
      replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
  }

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      'Authinfo',
      'IntegrationsManagementService',
      'UrlConfig',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('org-id');
    spyOn(this.UrlConfig, 'getHydraServiceUrl').and.returnValue('hydra-url');
    spyOn(this.UrlConfig, 'getOAuth2Url').and.returnValue('oauth2-url/');
    installPromiseMatchers();
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Integrations', () => {
    it('should list integrations for an org', function (this: Test) {
      const response: IApplicationUsageList = {
        items: applicationUsages,
      };
      this.$httpBackend.expectGET('hydra-url/applications/usage?orgId=org-id').respond(response);
      const promise = this.IntegrationsManagementService.listIntegrations();
      expect(promise).toBeResolvedWith(applicationUsages);

      this.$httpBackend.expectGET('hydra-url/applications/usage?orgId=org-id&count=100&sortBy=sort-by&sortOrder=asc&start=1').respond(response);
      const promise2 = this.IntegrationsManagementService.listIntegrations({
        count: 100,
        sortBy: 'sort-by',
        sortOrder: SortOrder.ASC,
        start: 1,
      });
      expect(promise2).toBeResolvedWith(applicationUsages);
    });

    it('should get specific integration for an org', function (this: Test) {
      this.$httpBackend.expectGET('hydra-url/applications/usage?orgId=org-id&appId=app-id').respond(applicationUsage);
      const promise = this.IntegrationsManagementService.getIntegration('app-id');
      expect(promise).toBeResolvedWith(applicationUsage);
    });
  });

  describe('Global Access Policy', () => {
    it('should get global access policy', function (this: Test) {
      this.$httpBackend.expectGET('hydra-url/policies?orgId=org-id&type=default').respond(globalAccessPolicy);
      const promise = this.IntegrationsManagementService.getGlobalAccessPolicy();
      expect(promise).toBeResolvedWith(globalAccessPolicy);
    });

    it('should create a global access policy', function (this: Test) {
      this.$httpBackend.expectPOST('hydra-url/policies', {
        action: PolicyAction.ALLOW,
        orgId: 'org-id',
        type: PolicyType.DEFAULT,
      }).respond(201);
      const promise = this.IntegrationsManagementService.createGlobalAccessPolicy(PolicyAction.ALLOW);
      expect(promise).toBeResolved();
    });

    it('should update a global access policy', function (this: Test) {
      this.$httpBackend.expectPUT('hydra-url/policies/global-policy-id', {
        action: PolicyAction.ALLOW,
        orgId: 'org-id',
      }).respond(200);
      const promise = this.IntegrationsManagementService.updateGlobalAccessPolicy('global-policy-id', PolicyAction.ALLOW);
      expect(promise).toBeResolved();
    });
  });

  describe('Custom Policy', () => {
    it('should get custom policy', function (this: Test) {
      this.$httpBackend.expectGET('hydra-url/policies/custom-policy-id').respond(customPolicy);
      const promise = this.IntegrationsManagementService.getCustomPolicy('custom-policy-id');
      expect(promise).toBeResolvedWith(customPolicy);
    });

    it('should create a custom policy', function (this: Test) {
      this.$httpBackend.expectPOST('hydra-url/policies', {
        action: PolicyAction.ALLOW,
        appId: 'app-id',
        orgId: 'org-id',
        personIds: ['123', '456'],
        type: PolicyType.CUSTOM,
      }).respond(201);
      const promise = this.IntegrationsManagementService.createCustomPolicy('app-id', PolicyAction.ALLOW, ['123', '456']);
      expect(promise).toBeResolved();
    });

    it('should update a custom policy', function (this: Test) {
      this.$httpBackend.expectPUT('hydra-url/policies/custom-policy-id', {
        action: PolicyAction.ALLOW,
        appId: 'app-id',
        orgId: 'org-id',
        personIds: ['123', '456'],
        type: PolicyType.CUSTOM,
      }).respond(200);
      const promise = this.IntegrationsManagementService.updateCustomPolicy('custom-policy-id', 'app-id', PolicyAction.ALLOW, ['123', '456']);
      expect(promise).toBeResolved();
    });

    it('should delete a custom policy', function (this: Test) {
      this.$httpBackend.expectDELETE('hydra-url/policies/custom-policy-id').respond(204);
      const promise = this.IntegrationsManagementService.deleteCustomPolicy('custom-policy-id');
      expect(promise).toBeResolved();
    });

    it('should detect if custom policies exist', function (this: Test) {
      // TODO implement test when method is implemented
      expect(() => this.IntegrationsManagementService.hasCustomPolicyByAction(PolicyAction.ALLOW)).toThrowError();
    });
  });

  describe('Revoke Tokens', () => {
    it('should revoke tokens for a specific org and client/integration', function (this: Test) {
      this.$httpBackend.expectPOST('oauth2-url/org-id/actions/revokeTokens', {
        clientIds: ['123'],
      }).respond(202);
      const promise = this.IntegrationsManagementService.revokeTokensForIntegration('123');
      expect(promise).toBeResolved();
    });
  });

  describe('Adopted Users', () => {
    it('should list adopted users for a specific org and client/integration', function (this: Test) {
      const response = {
        emails: ['email-1', 'email-2'],
      };
      this.$httpBackend.expectGET('oauth2-url/org-id/adoptedUsers/client-id').respond(response);
      const promise = this.IntegrationsManagementService.listAdoptedUsersForIntegration('client-id');
      expect(promise).toBeResolvedWith(['email-1', 'email-2']);
    });
  });

  describe('getUsersFunction', () => {
    it('should get username and address for a user given an array of user ids', function (this: Test) {
      const expectedResponse = [{
        username: responsesFromCI[0].Resources[0].userName,
        id: responsesFromCI[0].Resources[0].id,
      }];
      const idArr = ['id1', 'id2'];
      const filter = encodeUriQuery('id eq "id1" or id eq "id2"', false);
      this.$httpBackend.expectGET('https://identity.webex.com/identity/scim/org-id/v1/Users?attributes=userName,id&filter=' + filter).respond(responsesFromCI[0]);
      const promise = this.IntegrationsManagementService.getUsers(UserQueryType.ID, idArr);
      expect(promise).toBeResolvedWith(expectedResponse);
    });

    it('should get username and address for a user given an array of user email addresses', function (this: Test) {
      const emailArr = ['email1@gmail.com', 'email2@gmail.com'];
      const filter = encodeUriQuery('username eq "email1@gmail.com" or username eq "email2@gmail.com"', false);
      this.$httpBackend.expectGET('https://identity.webex.com/identity/scim/org-id/v1/Users?attributes=userName,id&filter=' + filter).respond(responsesFromCI[0]);
      const promise = this.IntegrationsManagementService.getUsers(UserQueryType.EMAIL, emailArr);
      expect(promise).toBeResolved();
    });

    it('should get username and address for a user given a single email', function (this: Test) {
      const email = 'email1@gmail.com';
      const filter = encodeUriQuery('username eq "email1@gmail.com"', false);
      this.$httpBackend.expectGET('https://identity.webex.com/identity/scim/org-id/v1/Users?attributes=userName,id&filter=' + filter).respond(responsesFromCI[0]);
      const promise = this.IntegrationsManagementService.getUsers(UserQueryType.EMAIL, email);
      expect(promise).toBeResolved();
    });
  });

  it('should break up a large array of users and call getUsers for each of the subarrays', function (this: Test) {
    const emailArr: string[] = [];
    const returnFromUsers = [{
      username: 'user1',
      id: '1',
    }, {
      username: 'user2',
      id: '2',
    }];

    _.times(50, (number) =>
      emailArr.push('bob' + number + '@gmail.com'));
    const promise = this.IntegrationsManagementService.getUsersBulk(UserQueryType.ID, emailArr);
    this.$httpBackend.expectGET(/.*\/Users.*/g).respond(responsesFromCI[0]);
    this.$httpBackend.expectGET(/.*\/Users.*/g).respond(responsesFromCI[1]);
    expect(promise).toBeResolvedWith(_.concat(returnFromUsers));
  });
});

const applicationUsage: IApplicationUsage = {
  appClientId: 'app-client-id',
  appCompanyUrl: 'app-company-url',
  appContactEmail: 'app-contact-email',
  appContactName: 'app-contact-name',
  appCreated: 'app-created',
  appId: 'app-id',
  appName: 'app-name',
  appPrivacyUrl: 'app-privacy-url',
  appUserAdoption: 100,
  id: 'id',
  orgId: 'org-id',
  policyAction: PolicyAction.ALLOW,
  policyId: 'policy-id',
};
const applicationUsages: IApplicationUsage[] = [applicationUsage];
const globalAccessPolicy: IGlobalPolicy = {
  action: PolicyAction.ALLOW,
  id: 'id',
  name: 'name',
  orgId: 'org-id',
  type: PolicyType.DEFAULT,
};
const customPolicy: ICustomPolicy = {
  action: PolicyAction.ALLOW,
  appId: 'app-id',
  id: 'id',
  name: 'name',
  orgId: 'org-id',
  personIds: ['123', '456'],
  type: PolicyType.CUSTOM,
};

const responsesFromCI = [{
  Resources: [{
    userName: 'user1',
    id: '1',
  }],
}, {
  Resources: [{
    userName: 'user2',
    id: '2',
  }],
}];
