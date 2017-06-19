import cmcModule from './../index';
import { ICmcUserStatusInfoResponse, ICmcUserStatus } from './../cmc.interface';

describe('CmcUserService', () => {

  beforeEach(function () {
    this.initModules(cmcModule);
    this.injectDependencies(
      'CmcUserService',
      'UrlConfig',
      'Authinfo',
      '$scope',
      '$httpBackend',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('1234');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should use uss to find users with cmc entitlement', function () {

    const userStatusInfoResponse: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse>{
      userStatuses: [
        { userId: '1', state: 'a' },
        { userId: '2', state: 'b' },
        { userId: '3', state: 'c' },
      ],
    };

    const orgId = this.Authinfo.getOrgId();
    this.$httpBackend
      .when('GET', this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + orgId + '/userStatuses?limit=100&entitled=true&serviceId=cmc')
      .respond(userStatusInfoResponse);

    this.CmcUserService.getUsersWithEntitlement('cmc', 100).then((result) => {
      expect(result).toEqual(userStatusInfoResponse);
    });

    this.$httpBackend.flush();
  });

  it('should list cmc users containing call aware status', function () {

    const orgId = this.Authinfo.getOrgId();

    const usersWithCmcResponse: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse>{
      userStatuses: [
        { userId: '1', state: 'a' },
        { userId: '2', state: 'b' },
        { userId: '3', state: 'c' },
      ],
    };
    this.$httpBackend
      .when('GET', this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + orgId + '/userStatuses?limit=100&entitled=true&serviceId=cmc')
      .respond(usersWithCmcResponse);

    const userWithAwareResponse = <ICmcUserStatusInfoResponse>{
      userStatuses: [
        { userId: '1', state: 'a' },
        { userId: '3', state: 'c' },
        { userId: '4', state: 'c' },
      ],
    };

    this.$httpBackend
      .when('GET', this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + orgId + '/userStatuses?serviceId=squared-fusion-uc&userId=1,2,3')
      .respond(userWithAwareResponse);

    const expectedResult: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse> {
      userStatuses: [
        { userId: '1', state: '' },
        { userId: '2', state: 'cmc.statusPage.callServiceAwareNotEntitled' },
        { userId: '3', state: '' },
      ],
    };
    this.CmcUserService.getUsersWithCmcButMissingAware(100).then((result) => {
      expect(result).toEqual(expectedResult);
    });

    this.$httpBackend.flush();
  });

  it('should fetch name/info from CI and insert to user statuses', function () {

    const orgId = this.Authinfo.getOrgId();

    const nameResolvedUsers = {
      Resources: [
        { id: '1', displayName: 'helge' },
        { id: '3', displayName: 'anders' },
      ]
    };

    this.$httpBackend
      .when('GET', encodeURI(this.UrlConfig.getScimUrl(orgId) + '?filter=id eq 1 or id eq 2 or id eq 3'))
      .respond(nameResolvedUsers);

    const userStatuses: ICmcUserStatus[] = <ICmcUserStatus[]> [
      { userId: '1', state: 'a' },
      { userId: '2', state: 'b' },
      { userId: '3', state: 'c' },
    ];

    const expectedResult: ICmcUserStatus[] = <ICmcUserStatus[]> [
      { userId: '1', state: 'a', displayName: 'helge' },
      { userId: '2', state: 'b' },
      { userId: '3', state: 'c', displayName: 'anders' },
    ];

    this.CmcUserService.insertUserDisplayNames(userStatuses).then((result) => {
      expect(result).toEqual(expectedResult);
    });
    this.$httpBackend.flush();

  });


});
