import callPickupMembersModule from './index';
import { Member } from 'modules/huron/members';
import { KeyCodes } from 'modules/core/accessibility';

describe('Component: callPickupMembers', () => {
  const MEMBER_INPUT = 'input#memberInput';
  const membersList = getJSONFixture('huron/json/features/callPickup/membersList.json');
  const fake_picture_path = 'https://abcde/12345';
  const checkboxesList = getJSONFixture('huron/json/features/callPickup/checkboxesList.json');
  const numbersObject = getJSONFixture('huron/json/features/callPickup/numbersList.json');
  const numbersArray = _.result(numbersObject, 'numbers');
  const model = { disabled: true, userName: 'johndoe@gmail.com', uuid: '1000' };

  beforeEach(function () {
    this.initModules(callPickupMembersModule);
    this.injectDependencies(
      '$httpBackend',
      '$modal',
      '$scope',
      '$q',
      'Authinfo',
      'CallPickupGroupService',
      'FeatureMemberService',
      'HuronConfig',
      'Notification',
      'UserNumberService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.$scope.onEditUpdate = jasmine.createSpy('onEditUpdate');

    this.$scope.selectedMembers = [];
    this.$scope.savedCallpickup = {};
    this.$scope.$apply();
    this.$scope.isNew = true;
    this.$scope.ucInputKeyup = jasmine.createSpy('ucInputKeyup');
    this.$scope.ucInputKeypress = jasmine.createSpy('ucInputKeypress');

    this.getMemberSuggestionsByLimitDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberSuggestionsByLimit').and.returnValue(this.getMemberSuggestionsByLimitDefer.promise);

    this.getMemberPictureDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberPicture').and.returnValue(this.getMemberPictureDefer.promise);

    this.getNumbersDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'getMemberNumbers').and.returnValue(this.getNumbersDefer.promise);

    this.isLineInPickupGroupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'isLineInPickupGroup').and.returnValue(this.isLineInPickupGroupDefer.promise);

    this.areAllLinesInPickupGroupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'areAllLinesInPickupGroup').and.returnValue(this.areAllLinesInPickupGroupDefer.promise);

    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initComponent() {
    this.compileComponent('ucCallPickupMembers', {
      onUpdate: 'onUpdate(member, isValidMember)',
      selectedMembers: 'selectedMembers',
      isNew: 'isNew',
      onEditUpdate: 'onEditUpdate(savedCallpickup)',
      savedCallpickup: 'savedCallpickup',
      ucInputKeyup: 'ucInputKeyup($event)',
      ucInputKeypress: 'ucInputKeypress($event)',
    });
    this.$scope.$apply();
  }

  describe('keyboard Test', () => {
    beforeEach(initComponent);

    it('should call ucInputKeyup on inputKeyup', function () {
      const event = { which: KeyCodes.ENTER };
      this.controller.inputKeyup(event);
      expect(this.$scope.ucInputKeyup).toHaveBeenCalledWith(event);
    });

    it('should call ucInputKeypress on inputKeypress', function () {
      const event = { which: KeyCodes.ENTER };
      this.controller.inputKeypress(event);
      expect(this.$scope.ucInputKeypress).toHaveBeenCalledWith(event);
    });
  });

  describe('member Test', () => {
    beforeEach(initComponent);

    it('should fetch a list of members', function () {
      // Slice 1-4 because suggested members are only the first 3
      const suggestedMembersCount = 3;
      const mockMembersList = membersList.slice(1, 4);
      const linesTaken = true;
      this.view.find(MEMBER_INPUT).val('doe').change();
      this.controller.fetchMembers('doe').then(function (mockMembersList) {
        for (let i = 0; i < mockMembersList.length; i++) {
          expect(mockMembersList[i].disabled).toEqual(true);
        }
      });
      this.getMemberSuggestionsByLimitDefer.resolve(mockMembersList);
      this.areAllLinesInPickupGroupDefer.resolve(linesTaken);
      this.$scope.$apply();
      expect(mockMembersList.length).toEqual(suggestedMembersCount);
    });
  });

  describe('select member test', () => {
    let member1, member2, memberData, checkboxesList, allNumbers;

    beforeEach(initComponent);

    beforeEach(function() {
      this.controller.memberList = membersList;
      checkboxesList = getJSONFixture('huron/json/features/callPickup/checkboxesList.json');
      member1 = _.cloneDeep(this.controller.memberList[0]);
      memberData = {
        member: member1,
        picturePath: fake_picture_path,
        checkboxes: checkboxesList,
        saveNumbers: [],
      };
      member2 = _.cloneDeep(this.controller.memberList[1]);
      allNumbers = getJSONFixture('huron/json/features/callPickup/numbersList.json');
      spyOn(this.CallPickupGroupService, 'createCheckboxes').and.callThrough();
      this.getMemberPictureDefer.resolve(fake_picture_path);
      this.$scope.$digest();
    });

    it('should be able to select members', function() {
      this.getNumbersDefer.resolve(numbersArray);
      this.isLineInPickupGroupDefer.resolve('helpdesk');
      this.areAllLinesInPickupGroupDefer.resolve(true);
      this.controller.selectedMembers = [];
      this.controller.maxMembersAllowed = 1;
      this.controller.selectMember(member1);
      expect(this.CallPickupGroupService.getMemberNumbers).toHaveBeenCalled();
      this.$scope.$digest();
      expect(this.controller.selectedMembers.length).toEqual(1);
      this.controller.selectMember(member2);
      expect(this.Notification.error).toHaveBeenCalledWith('callPickup.memberLimitExceeded');
    });

    it('should be able to remove members', function () {
      this.isLineInPickupGroupDefer.resolve('');
      this.areAllLinesInPickupGroupDefer.resolve(false);
      this.controller.selectedMembers.push(memberData);
      this.controller.removeMember(memberData);
      expect(this.controller.selectedMembers.length).toEqual(0);
    });

    it('member name input box should be empty when calling select member', function() {
      this.isLineInPickupGroupDefer.resolve('');
      this.areAllLinesInPickupGroupDefer.resolve(false);
      this.controller.memberList = membersList;
      this.controller.selectMember(member1);
      expect(this.controller.memberName).toBe('');
    });

    it('should create checkboxes for all numbers', function(){
      this.isLineInPickupGroupDefer.resolve('');
      this.areAllLinesInPickupGroupDefer.resolve(false);
      this.CallPickupGroupService.createCheckboxes(memberData, allNumbers['numbers']).then(() => {
        expect(memberData.checkboxes[0].label).toEqual('3081');
        expect(memberData.checkboxes[0].value).toEqual(true);
        expect(memberData.checkboxes[0].sublabel).toEqual('');
        expect(memberData.checkboxes[0].numberUuid).toEqual('920b3f0f-fb6d-406c-b5b3-58c1bd390478');
      });
    });

    it('should return empty string if the member is not in selectedMembers', function () {
      this.isLineInPickupGroupDefer.resolve('');
      this.areAllLinesInPickupGroupDefer.resolve(false);
      this.controller.selectedMembers.push(memberData);
      const mem2 = _.cloneDeep(membersList[1]);
      expect(this.controller.getMembersPictures(mem2)).toEqual('');
    });
  });

  describe('update numbers', () => {
    let member1, member2, member3;
    beforeEach(initComponent);
    beforeEach(function() {
      this.controller.memberList = membersList;
      member1 = {
        member: _.cloneDeep(this.controller.memberList[0]),
        picturePath: fake_picture_path,
        checkboxes: checkboxesList,
        saveNumbers: [],
      };
      member2 = {
        member: _.cloneDeep(this.controller.memberList[1]),
        picturePath: fake_picture_path,
        checkboxes: [{
          label: '3252',
          numberUuid: '92bc097b-9099-4420-b609-659f5e3659b4',
          sublabel: '',
          value: false,
        }],
        saveNumbers: [{
          internalNumber: '3252',
          uuid: '92bc097b-9099-4420-b609-659f5e3659b4',
        }],
      };
      member3 = {
        member: _.cloneDeep(this.controller.memberList[1]),
        picturePath: fake_picture_path,
        checkboxes: [{
          label: '3252',
          numberUuid: '92bc097b-9099-4420-b609-659f5e3659b4',
          sublabel: '',
          value: true,
        },
        {
          label: '3151',
          numberUuid: '82bc097b-9099-4420-b609-659f5e3659b4',
          sublabel: '',
          value: true,
        }],
        saveNumbers: [{
          internalNumber: '3151',
          uuid: '82bc097b-9099-4420-b609-659f5e3659b4',
        }],
      };
    });

    it('should update number for a member based on checkbox selection', function() {
      const saveNumber = {
        internalNumber: '3252',
        uuid: '92bc097b-9099-4420-b609-659f5e3659b4',
      };
      this.controller.updateNumbers(member1);
      expect(member1.saveNumbers).not.toContain(saveNumber);
    });

    it('should give error if any member has no checkbox selected', function() {
      this.controller.selectedMembers = member2;
      spyOn(this.CallPickupGroupService, 'verifyLineSelected').and.callFake(function() {
        return false;
      });
      this.controller.updateNumbers(member2);
      expect(this.Notification.error).toHaveBeenCalledWith('callPickup.minMemberWarning');
    });

    it('should not update number if its already present in save numbers', function() {
      const saveNumber = {
        internalNumber: '3252',
        uuid: '92bc097b-9099-4420-b609-659f5e3659b4',
      };
      this.controller.updateNumbers(member3);
      expect(member3.saveNumbers).toContain(saveNumber);
    });
  });

  describe('member name display test', () => {
    beforeEach(initComponent);

    it('Can getDisplayName', function() {
      const mem5 = _.cloneDeep(membersList[4]);
      expect(this.controller.getDisplayName(mem5)).toEqual('peter@test.com');

      const mem1 = _.cloneDeep(membersList[0]);
      expect(this.controller.getDisplayName(mem1)).toEqual('Chuck Norris (chuck.norris@test.com)');

      const mem2 = _.cloneDeep(membersList[1]);
      expect(this.controller.getDisplayName(mem2)).toEqual('Koala Lounge 1');

      const mem4 = _.cloneDeep(membersList[5]);
      expect(this.controller.getDisplayName(mem4)).toEqual('');

    });

    it('Can getDisplayNameOnCard', function() {
      const mem5 = _.cloneDeep(membersList[4]);
      expect(this.controller.getDisplayNameOnCard(mem5)).toEqual('');

      const mem1 = _.cloneDeep(membersList[0]);
      expect(this.controller.getDisplayNameOnCard(mem1)).toEqual('Chuck Norris');

      const mem2 = _.cloneDeep(membersList[1]);
      expect(this.controller.getDisplayNameOnCard(mem2)).toEqual('Koala Lounge 1');

      const mem3 = undefined;
      expect(this.controller.getDisplayNameOnCard(mem3)).toEqual('');

      const mem = new Member({
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
      const mem1 = _.cloneDeep(membersList[0]);
      expect(this.controller.getMemberType(mem1)).toEqual('user');
    });

    it('Can get USER_PLACE type', function() {
      const mem2 = _.cloneDeep(membersList[1]);
      expect(this.controller.getMemberType(mem2)).toEqual('place');
    });
  });

  describe('disabled member modal', () => {
    beforeEach(initComponent);

    it('get active member disabled test', function () {
      const element = '<li ng-repeat="match in matches track by $index" id="typeahead-2335-4881-option-0" class="ng-scope active"></li>';
      this.compileTemplate(element);

      const scope = function() {
        return {
          scope: function() {
            return {
              match: {
                model: model,
              },
            };
          },
        };
      };

      spyOn($.fn, 'find').and.callFake(scope);
      expect(this.controller.getActiveMember()).toEqual(model);
    });


    it('is active member disabled test', function () {
      spyOn(this.controller, 'getActiveMember').and.returnValue(model);
      expect(this.controller.isActiveMemberDisabled()).toBeTruthy();
    });

    it('displayModalLinesTaken test', function () {
      this.getNumbersDefer.resolve(numbersArray);
      this.isLineInPickupGroupDefer.resolve('helpdesk');

      spyOn(this.controller, 'isActiveMemberDisabled').and.returnValue(true);

      const member = { userName: 'johndoe@gmail.com', uuid: '1000' };
      spyOn(this.controller, 'getActiveMember').and.returnValue(member);

      const evt = $.Event('keydown', { keyCode: KeyCodes.ENTER });
      const spyStopPropagation = spyOn(evt, 'stopPropagation');
      const spyModal = spyOn(this.$modal, 'open');

      this.controller.displayModalLinesTaken(evt);
      this.$scope.$digest();

      expect(this.CallPickupGroupService.getMemberNumbers).toHaveBeenCalled();
      expect(this.CallPickupGroupService.isLineInPickupGroup).toHaveBeenCalled();
      expect(spyStopPropagation).toHaveBeenCalled();
      expect(spyModal).toHaveBeenCalled();
    });
  });
});
