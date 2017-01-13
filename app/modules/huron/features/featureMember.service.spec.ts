import { Member } from 'modules/huron/members';

describe('Service: FeatureService', () => {

  let membersList = getJSONFixture('huron/json/features/pagingGroup/membersList2.json');

  let userResponse = {
    id: '0001',
    name: {
      givenName: 'rtp2',
      familyName: 'rtp2',
    },
    userName: 'porsche.rtp+phone2@gmail.com',
    displayName: 'rtp2 displayName',
    photos: [
      {
        type: 'photo',
        value: 'https://12345/abcbe',
      },
      {
        type: 'thumbnail',
        value: 'https://09876/zyxwuv',
      }],
  };

  let placeResponse = {
    uuid: '0002',
    sipAddress: '',
    displayName: 'peter desk',
    name: 'peterdesk1476969612793@pagingtest.wbx2.com',
    numbers: [],
  };

  let memberPictureResponse = {
    memberUuid: 'fake-userid',
    thumbnailSrc: 'https://09876/zyxwuv',
  };

  beforeEach(function () {
    this.initModules('huron.feature-member-service');
    this.injectDependencies(
      '$httpBackend',
      '$http',
      '$q',
      'FeatureMemberService',
      'Authinfo',
      'UrlConfig',
      'MemberService'
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.getMemberListDefer = this.$q.defer();
    spyOn(this.MemberService, 'getMemberList').and.returnValue(this.getMemberListDefer.promise);
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get a suggested member', function () {
    this.getMemberListDefer.resolve(membersList);
    this.FeatureMemberService.getMemberSuggestions('por').then(function (response) {
      expect(response).toEqual(jasmine.objectContaining(membersList));
    });
  });

  it('should get the picture of a member', function () {
    let fakeUserId = 'fake-userid';
    let expectedUrl = 'https://identity.webex.com/identity/scim/12345/v1/Users/fake-userid';
    this.$httpBackend.whenGET(expectedUrl).respond(200, userResponse);
    this.FeatureMemberService.getMemberPicture(fakeUserId).then(function (response) {
      expect(response).toEqual(memberPictureResponse);
    });
    this.$httpBackend.flush();
  });

  it('should get the details of a user', function () {
    let fakeUserId = 'fake-userid';
    let expectedUrl = 'https://identity.webex.com/identity/scim/12345/v1/Users/fake-userid';
    this.$httpBackend.whenGET(expectedUrl).respond(200, userResponse);
    this.FeatureMemberService.getUser(fakeUserId).then(response => {
      expect(response).toEqual(userResponse);
    });
    this.$httpBackend.flush();
  });

  it('should get the details of a place', function () {
    let fakePlaceId = 'fake-placeid';
    let expectedUrl = 'https://cmi.huron-int.com/api/v2/customers/12345/places/fake-placeid';
    this.$httpBackend.whenGET(expectedUrl).respond(200, placeResponse);
    this.FeatureMemberService.getPlace(fakePlaceId).then(response => {
      expect(response).toEqual(placeResponse);
    });
    this.$httpBackend.flush();
  });

  describe('should getUserPhoto', () => {
    it('should getUserPhoto', function () {
      expect(this.FeatureMemberService.getUserPhoto(userResponse)).toEqual('https://09876/zyxwuv');
    });
  });

  describe('Get User names test', () => {
    it('should get all different names from User', function () {
      expect(this.FeatureMemberService.getFirstNameFromUser(userResponse)).toEqual('rtp2');
      expect(this.FeatureMemberService.getLastNameFromUser(userResponse)).toEqual('rtp2');
      expect(this.FeatureMemberService.getDisplayNameFromUser(userResponse)).toEqual('rtp2 displayName');
      expect(this.FeatureMemberService.getUserNameFromUser(userResponse)).toEqual('porsche.rtp+phone2@gmail.com');
    });

    it('should getFullNameFromUser', function () {
      expect(this.FeatureMemberService.getFullNameFromUser(userResponse)).toEqual('rtp2 rtp2');

      let user1 = {
        id: '0001',
        name: {
          givenName: undefined,
          familyName: 'rtp2',
        },
        userName: 'porsche.rtp+phone2@gmail.com',
        displayName: 'rtp2 displayName',
      };
      expect(this.FeatureMemberService.getFullNameFromUser(user1)).toEqual('rtp2 displayName');

      let user2 = {
        id: '0001',
        name: {
          givenName: undefined,
          familyName: 'rtp2',
        },
        userName: 'porsche.rtp+phone2@gmail.com',
        displayName: undefined,
      };
      expect(this.FeatureMemberService.getFullNameFromUser(user2)).toEqual('porsche.rtp+phone2@gmail.com');
    });
  });

  describe('member name display test', () => {

    it('Can get First and Last Name', function () {
      let mem1 = angular.copy(membersList[0]);
      expect(this.FeatureMemberService.getFirstLastName(mem1)).toEqual('Chuck Norris');
    });

    it('Can return empty string if no first and last name', function() {
      let mem2 = angular.copy(membersList[1]);
      expect(this.FeatureMemberService.getFirstLastName(mem2)).toEqual('');
    });

    it('Can only get firstname if no last name', function() {
      let mem3 = angular.copy(membersList[2]);
      expect(this.FeatureMemberService.getFirstLastName(mem3)).toEqual('Tom');
    });

    it('Can only get lastname if no first name', function() {
      let mem4 = angular.copy(membersList[3]);
      expect(this.FeatureMemberService.getFirstLastName(mem4)).toEqual('Smith');
    });

    it('Can return empty string for getUserName if userName is undefined', function() {
      let mem1 = new Member({
        uuid: '0005',
        type: 'USER_REAL_USER',
        firstName: 'TOM',
        lastName: 'CRUISE',
        userName: undefined,
        displayName: undefined,
        numbers: [],
      });
      expect(this.FeatureMemberService.getUserName(mem1)).toEqual('');
    });

    it('Can getFullNameFromMember for USER test', function () {
      let mem = angular.copy(membersList[0]);
      expect(this.FeatureMemberService.getFullNameFromMember(mem)).toEqual('Chuck Norris (chuck.norris@kickyourbutt.com)');
    });

    it('Can getFullNameFromMember for PLACE test', function () {
      let mem = angular.copy(membersList[1]);
      expect(this.FeatureMemberService.getFullNameFromMember(mem)).toEqual('Koala Lounge');
    });

    it('Can not getFullNameFromMember if User member has no any names defined', function () {
      let mem = new Member({
        uuid: '0006',
        type: 'USER_REAL_USER',
        firstName: undefined,
        lastName: undefined,
        userName: undefined,
        displayName: 'TOM CRUISE',
        numbers: [],
      });
      expect(this.FeatureMemberService.getFullNameFromMember(mem)).toEqual('');
    });

    it('Can not getFullNameFromMember if Place member has no displayName', function () {
      let mem = new Member({
        uuid: '0006',
        type: 'USER_PLACE',
        firstName: undefined,
        lastName: undefined,
        userName: undefined,
        displayName: undefined,
        numbers: [],
      });
      expect(this.FeatureMemberService.getFullNameFromMember(mem)).toEqual('');
    });

    it('Can not getFullNameFromMember if member is undefined', function () {
      let mem = undefined;
      expect(this.FeatureMemberService.getFullNameFromMember(mem)).toEqual('');
    });

    it('Can getDisplayNameFromMember for USER test', function () {
      let mem = angular.copy(membersList[0]);
      expect(this.FeatureMemberService.getDisplayNameFromMember(mem)).toEqual('Chuck Norris');
    });

    it('Can getDisplayNameFromMember for PLACE test', function () {
      let mem = angular.copy(membersList[1]);
      expect(this.FeatureMemberService.getDisplayNameFromMember(mem)).toEqual('Koala Lounge');
    });

    it('Can not getDisplayNameFromMember undefined member', function () {
      let mem = undefined;
      expect(this.FeatureMemberService.getDisplayNameFromMember(mem)).toEqual('');
    });

    it('Can getDisplayNameFromMember if User member has no firstname/lastname/username', function () {
      let mem = new Member({
        uuid: '0005',
        type: 'USER_REAL_USER',
        firstName: undefined,
        lastName: undefined,
        userName: undefined,
        displayName: 'Tom Cruise',
        numbers: [],
      });
      expect(this.FeatureMemberService.getDisplayNameFromMember(mem)).toEqual('Tom Cruise');
    });

    it('Can not getDisplayNameFromMember if Place member has no displayName', function () {
      let mem = new Member({
        uuid: '0005',
        type: 'USER_PLACE',
        firstName: undefined,
        lastName: undefined,
        userName: undefined,
        displayName: undefined,
        numbers: [],
      });
      expect(this.FeatureMemberService.getDisplayNameFromMember(mem)).toEqual('');
    });
  });

  describe('getMemberType test', () => {

    it('can getMemberType for place', function () {
      let mem = angular.copy(membersList[1]);
      expect(this.FeatureMemberService.getMemberType(mem)).toEqual('place');
    });

    it('can not getMemberType if member is undefined', function () {
      let mem = undefined;
      expect(this.FeatureMemberService.getMemberType(mem)).toEqual('');
    });
  });

});
