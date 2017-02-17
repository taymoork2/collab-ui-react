import { Member } from 'modules/huron/members';

describe('Component: pgMember', () => {
  let membersList = getJSONFixture('huron/json/features/pagingGroup/membersList2.json');
  let fake_picture_path = 'https://09876/zyxwuv';

  let getMemberListFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };

  let userResponse = {
    id: '0001',
    name: {
      givenName: 'rtp2',
      familyName: 'rtp2lastname',
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

  let getMachineAcctResponse = {
    id: 'fake-userid',
    schemas: [],
    name: '',
    entitlements: [],
    displayName: '',
    machineType: 'room',
    meta: {},
  };

  beforeEach(function () {
    this.initModules('huron.paging-group.member');
    this.injectDependencies(
      '$scope',
      '$q',
      'FeatureMemberService',
      'Notification',
    );

    this.$scope.onUpdate = jasmine.createSpy('onUpdate');

    this.$scope.selectedMembers = [];

    this.getMemberListDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberSuggestions').and.returnValue(this.getMemberListDefer.promise);

    this.getMemberPictureDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberPicture').and.returnValue(this.getMemberPictureDefer.promise);

    this.getUserDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getUser').and.returnValue(this.getUserDefer.promise);

    this.getMachineAcctDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMachineAcct').and.returnValue(this.getMachineAcctDefer.promise);

    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');
  });

  function initComponent() {
    this.compileComponent('pgMember', {
      onUpdate: 'onUpdate(members)',
      selectedMembers: 'selectedMembers',
      cardThreshold: 9,
    });
  }

  describe('member test', () => {
    beforeEach(initComponent);

    it('should fetch a list of members', function () {
      this.getMemberListDefer.resolve(membersList);
      this.getMachineAcctDefer.resolve(getMachineAcctResponse);
      this.controller.memberName = 'por';
      this.controller.fetchMembers();
      this.$scope.$apply();
      expect(this.controller.availableMembers.length).toEqual(5);
    });

    it('should fetchMembers with failure', function () {
      this.getMemberListDefer.reject(getMemberListFailureResp);
      this.controller.memberName = 'por';
      this.controller.fetchMembers();
      this.$scope.$apply();
      expect(this.Notification.errorResponse).toHaveBeenCalledWith(getMemberListFailureResp, 'pagingGroup.memberFetchFailure');
    });

    it('should be able to select and unselect a member', function () {
      this.controller.availableMembers = membersList;
      let mem1 = angular.copy(this.controller.availableMembers[0]);
      //this.getMemberPictureDefer.resolve(fake_picture_path);
      this.getUserDefer.resolve(userResponse);
      this.controller.selectMembers(mem1);
      this.$scope.$apply();
      expect(this.controller.selectedMembers.length).toEqual(1);
      expect(this.controller.selectedMembers[0].member.uuid).toEqual('0001');
      expect(this.controller.selectedMembers[0].member.type).toEqual('USER_REAL_USER');
      expect(this.controller.selectedMembers[0].picturePath).toEqual(fake_picture_path);

      let memWithPic = {
        member: mem1,
        picturePath: fake_picture_path,
      };

      this.controller.removeMembers(memWithPic);
      expect(this.controller.selectedMembers.length).toEqual(0);
    });

    it('should return empty string if the member is not in selectedMembers', function () {
      let mem1 = angular.copy(membersList[0]);
      let memWithPic = {
        member: mem1,
        picturePath: fake_picture_path,
      };

      this.controller.selectedMembers.push(memWithPic);
      let mem2 = angular.copy(membersList[1]);
      expect(this.controller.getMembersPictures(mem2)).toEqual('');
    });

  });

  describe('member name display test', () => {
    beforeEach(initComponent);

    it('Can getDisplayNameInDropdown', function() {
      let mem5 = angular.copy(membersList[4]);
      expect(this.controller.getDisplayNameInDropdown(mem5)).toEqual('peter@kickyourbutt.com');

      let mem1 = angular.copy(membersList[0]);
      expect(this.controller.getDisplayNameInDropdown(mem1)).toEqual('Chuck Norris (chuck.norris@kickyourbutt.com)');

      let mem2 = angular.copy(membersList[1]);
      expect(this.controller.getDisplayNameInDropdown(mem2)).toEqual('Koala Lounge');
    });

    it('Can getDisplayNameOnCard', function() {
      let mem5 = angular.copy(membersList[4]);
      expect(this.controller.getDisplayNameOnCard(mem5)).toEqual('');

      let mem1 = angular.copy(membersList[0]);
      expect(this.controller.getDisplayNameOnCard(mem1)).toEqual('Chuck Norris');

      let mem2 = angular.copy(membersList[1]);
      expect(this.controller.getDisplayNameOnCard(mem2)).toEqual('Koala Lounge');

      let mem3 = undefined;
      expect(this.controller.getDisplayNameOnCard(mem3)).toEqual('');

      let mem = new Member({
        uuid: '0005',
        type: 'USER_PLACE',
        firstName: 'TOM',
        lastName: 'CRUISE',
        userName: undefined,
        displayName: undefined,
        numbers: [],
      });
      expect(this.controller.getDisplayNameOnCard(mem)).toEqual('');
    });
  });

  describe('member type test', () => {
    beforeEach(initComponent);

    it('Can USER_REAL_USER type', function () {
      let mem1 = angular.copy(membersList[0]);
      expect(this.controller.getMemberType(mem1)).toEqual('user');
    });

    it('Can get USER_PLACE type', function() {
      let mem2 = angular.copy(membersList[1]);
      expect(this.controller.getMemberType(mem2)).toEqual('place');
    });
  });

});
