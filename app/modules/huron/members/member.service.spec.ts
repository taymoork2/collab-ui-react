import { Member, MemberOrder } from './index';

describe('Service: MemberService', () => {
  beforeEach(function () {
    this.initModules('huron.member-service');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'MemberService',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');

    let membersList = {
      members: [
        new Member({
          uuid: '0001',
          type: 'USER_REAL_USER',
          firstName: 'Chuck',
          lastName: 'Norris',
          userName: 'chuck.norris@kickyourbutt.com',
          displayName: undefined,
          numbers: [],
        }),
        new Member({
          uuid: '0002',
          type: 'USER_PLACE',
          firstName: undefined,
          lastName: undefined,
          userName: undefined,
          displayName: 'Koala Lounge',
          numbers: [],
        }),
      ],
    };
    this.membersList = membersList;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get the list of members with only name passed in', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/members?name=koala')
      .respond(200, this.membersList);
    this.MemberService.getMemberList('koala').then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.membersList.members));
    });
    this.$httpBackend.flush();
  });

  it('should get the list of members with all params passed in', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/members?name=koala&wide=true&order=asc&limit=20&offset=200')
      .respond(200, this.membersList);
    this.MemberService.getMemberList('koala', true, undefined, MemberOrder.ASCENDING, 20, 200).then(response => {
      expect(response).toEqual(jasmine.objectContaining(this.membersList.members));
    });
    this.$httpBackend.flush();
  });

  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/members?name=koala')
      .respond(500);
    this.MemberService.getMemberList('koala').then(response => {
      expect(response.data).toBeUndefined();
      expect(response.status).toEqual(500);
    });
    this.$httpBackend.flush();
  });
});
