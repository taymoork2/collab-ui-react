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

    let userStatusInfoResponse: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse>{
      userStatuses: [
        { userId: '1', state: 'a' },
        { userId: '2', state: 'b' },
        { userId: '3', state: 'c' },
      ],
    };

    let orgId = this.Authinfo.getOrgId();
    this.$httpBackend
      .when('GET', this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + orgId + '/userStatuses?limit=100&entitled=true&serviceId=cmc')
      .respond(userStatusInfoResponse);

    this.CmcUserService.getUsersWithEntitlement('cmc', 100).then((result) => {
      expect(result).toEqual(userStatusInfoResponse);
    });

    this.$httpBackend.flush();
  });

  it('should list cmc users containing call aware status', function () {

    let orgId = this.Authinfo.getOrgId();

    let usersWithCmcResponse: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse>{
      userStatuses: [
        { userId: '1', state: 'a' },
        { userId: '2', state: 'b' },
        { userId: '3', state: 'c' },
      ],
    };
    this.$httpBackend
      .when('GET', this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + orgId + '/userStatuses?limit=100&entitled=true&serviceId=cmc')
      .respond(usersWithCmcResponse);

    let userWithAwareResponse = <ICmcUserStatusInfoResponse>{
      userStatuses: [
        { userId: '1', state: 'a' },
        { userId: '3', state: 'c' },
        { userId: '4', state: 'c' },
      ],
    };
    this.$httpBackend
      .when('GET', this.UrlConfig.getUssUrl() + 'uss/api/v1/orgs/' + orgId + '/userStatuses?limit=100&entitled=true&serviceId=squared-fusion-uc')
      .respond(userWithAwareResponse);

    let expectedResult: ICmcUserStatusInfoResponse = <ICmcUserStatusInfoResponse> {
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

  it('should insert display name to user statuses', function () {

    let orgId = this.Authinfo.getOrgId();

    let nameResolvedUsers = [
      { id: '1', displayName: 'helge' },
      { id: '3', displayName: 'anders' },
    ];

    this.$httpBackend
      .when('GET', this.UrlConfig.getAdminServiceUrl() + 'organization/' + orgId + '/reports/devices?accountIds=1,2,3')
      .respond(nameResolvedUsers);

    let userStatuses: Array<ICmcUserStatus> = <Array<ICmcUserStatus>> [
      { userId: '1', state: 'a' },
      { userId: '2', state: 'b' },
      { userId: '3', state: 'c' },
    ];

    let expectedResult: Array<ICmcUserStatus> = <Array<ICmcUserStatus>> [
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
