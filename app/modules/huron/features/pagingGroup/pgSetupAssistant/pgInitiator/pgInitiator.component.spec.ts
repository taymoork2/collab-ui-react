import { Member } from 'modules/huron/members';

describe('Component: pgInitiator', () => {
  const RADIO_MEMBER = 'input#membersonly';
  const RADIO_PUBLIC = 'input#public';
  const RADIO_CUSTOM = 'input#custom';
  let membersList = getJSONFixture('huron/json/features/pagingGroup/membersList2.json');
  let fake_picture_path = 'https://09876/zyxwuv';

  let memberServiceFailureResp = {
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

  let getMachineAcctResponse2 = {
    id: '0002',
    schemas: [],
    name: '',
    entitlements: [],
    displayName: '',
    machineType: 'lyra_space',
    meta: {},
  };

  beforeEach(function () {
    this.initModules('huron.paging-group.initiator');
    this.injectDependencies(
      '$scope',
      '$q',
      'FeatureMemberService',
      'Notification',
    );

    this.$scope.onUpdate = jasmine.createSpy('onUpdate');

    this.$scope.initiatorType = 'PUBLIC';
    this.$scope.selectedInitiators = [];

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
    this.compileComponent('pgInitiator', {
      onUpdate: 'onUpdate(initiatorType, selectedInitiators)',
      initiatorType: 'initiatorType',
      selectedInitiators: 'selectedInitiators',
      cardThreshold: 9,
    });
  }

  describe('initiator Type test', () => {
    beforeEach(initComponent);

    it('should have public radio button', function () {
      expect(this.view).toContainElement(RADIO_PUBLIC);
    });

    it('should have membersonly radio button', function () {
      expect(this.view).toContainElement(RADIO_MEMBER);
    });

    it('should have custom radio button', function () {
      expect(this.view).toContainElement(RADIO_CUSTOM);
    });

    it('should have public button checked', function () {
      expect(this.view.find(RADIO_PUBLIC)).toBeChecked();
      expect(this.view.find(RADIO_MEMBER)).not.toBeChecked();
      expect(this.view.find(RADIO_CUSTOM)).not.toBeChecked();
    });
  });

  describe('initiator fetch test', () => {
    beforeEach(initComponent);

    it('should fetch a list of initiators', function () {
      this.controller.initiatorName = 'por';
      this.getMemberListDefer.resolve(membersList);
      this.getMachineAcctDefer.resolve(getMachineAcctResponse);
      this.controller.fetchInitiators();
      this.$scope.$apply();
      expect(this.controller.availableInitiators.length).toEqual(5);
    });

    it('should fetchInitiator with failure', function () {
      this.getMemberListDefer.reject(memberServiceFailureResp);
      this.controller.initiatorName = 'por';
      this.controller.fetchInitiators();
      this.$scope.$apply();
      expect(this.Notification.errorResponse).toHaveBeenCalledWith(memberServiceFailureResp, 'pagingGroup.initiatorFetchFailure');
    });

    it('should only display subset of fetched initiators if one has already selected', function () {
      this.controller.initiatorName = 'por';
      let mem1 = _.cloneDeep(membersList[0]);
      let memWithPic = {
        member: mem1,
        picturePath: fake_picture_path,
      };

      this.controller.selectedInitiators.push(memWithPic);
      this.getMemberListDefer.resolve(membersList);
      this.getMachineAcctDefer.resolve(getMachineAcctResponse);
      this.controller.fetchInitiators();
      this.$scope.$apply();
      expect(this.controller.availableInitiators.length).toEqual(4);
    });

    it('should only display subset of fetched initiators if place phone is room device', function () {
      this.controller.initiatorName = 'por';
      this.getMemberListDefer.resolve(membersList);
      this.getMachineAcctDefer.resolve(getMachineAcctResponse2);
      this.controller.fetchInitiators();
      this.$scope.$apply();
      expect(this.controller.availableInitiators.length).toEqual(4);
    });

    it('should only display subset of fetched initiators if getMachineAcct failed', function () {
      this.controller.initiatorName = 'por';
      this.getMemberListDefer.resolve(membersList);
      this.getMachineAcctDefer.reject(memberServiceFailureResp);
      this.controller.fetchInitiators();
      this.$scope.$apply();
      expect(this.controller.availableInitiators.length).toEqual(4);
    });
  });

  describe('initiator select test', () => {
    beforeEach(initComponent);

    it('should be able to select and unselect an initator', function () {
      this.controller.availableInitiators = membersList;
      let mem1 = _.cloneDeep(this.controller.availableInitiators[0]);
      this.getUserDefer.resolve(userResponse);
      this.controller.selectInitiators(mem1);
      this.$scope.$apply();
      expect(this.controller.selectedInitiators.length).toEqual(1);
      expect(this.controller.selectedInitiators[0].member.uuid).toEqual('0001');
      expect(this.controller.selectedInitiators[0].member.type).toEqual('USER_REAL_USER');
      expect(this.controller.selectedInitiators[0].picturePath).toEqual(fake_picture_path);

      let memWithPic = {
        member: mem1,
        picturePath: fake_picture_path,
      };

      this.controller.removeMembers(memWithPic);
      expect(this.controller.selectedInitiators.length).toEqual(0);
    });

    it('should return empty string if the member is not in selectedInitiators', function () {
      let mem1 = _.cloneDeep(membersList[0]);
      let memWithPic = {
        member: mem1,
        picturePath: fake_picture_path,
      };

      this.controller.selectedInitiators.push(memWithPic);
      let mem2 = _.cloneDeep(membersList[1]);
      expect(this.controller.getMembersPictures(mem2)).toEqual('');
    });
  });

  describe('Change Initiator Type from public to membersonly', () => {
    beforeEach(initComponent);

    it('should invoke onChange when RADIO_MEMBER is clicked', function () {
      this.view.find(RADIO_MEMBER).click().click();
      expect(this.$scope.onUpdate).toHaveBeenCalled();
    });
  });

  describe('member name display test', () => {
    beforeEach(initComponent);

    it('Can getDisplayNameInDropdown', function() {
      let mem5 = _.cloneDeep(membersList[4]);
      expect(this.controller.getDisplayNameInDropdown(mem5)).toEqual('peter@kickyourbutt.com');

      let mem1 = _.cloneDeep(membersList[0]);
      expect(this.controller.getDisplayNameInDropdown(mem1)).toEqual('Chuck Norris (chuck.norris@kickyourbutt.com)');

      let mem2 = _.cloneDeep(membersList[1]);
      expect(this.controller.getDisplayNameInDropdown(mem2)).toEqual('Koala Lounge');
    });

    it('Can getDisplayNameOnCard', function() {
      let mem5 = _.cloneDeep(membersList[4]);
      expect(this.controller.getDisplayNameOnCard(mem5)).toEqual('');

      let mem1 = _.cloneDeep(membersList[0]);
      expect(this.controller.getDisplayNameOnCard(mem1)).toEqual('Chuck Norris');

      let mem2 = _.cloneDeep(membersList[1]);
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
      let mem1 = _.cloneDeep(membersList[0]);
      expect(this.controller.getMemberType(mem1)).toEqual('user');
    });

    it('Can get USER_PLACE type', function() {
      let mem2 = _.cloneDeep(membersList[1]);
      expect(this.controller.getMemberType(mem2)).toEqual('place');
    });
  });

});
