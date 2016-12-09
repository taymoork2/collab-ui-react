//import { Member } from 'modules/huron/members';

describe('Service: callPickupService', () => {
  let membersList = getJSONFixture('huron/json/features/callPickup/membersList.json');
  let numbersObject = getJSONFixture('huron/json/features/callPickup/numbersList.json');
  let numbersArray = _.result(numbersObject, 'numbers');
  let fake_picture_path = 'https://abcde/12345';
  let successSpy, failureSpy;
  let cp = getJSONFixture('huron/json/features/callPickup/pickup.json');

  beforeEach(function () {
    this.initModules('huron.call-pickup.members');
    this.injectDependencies(
      '$scope',
      '$q',
      'FeatureMemberService',
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'CallPickupGroupService',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.$scope.$apply();
    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');

  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  function initComponent() {
    this.compileComponent('CallPickupGroupService', {});
    this.$scope.$apply();
  }

  describe('createCallPickup: ', () => {
      it('should be successful', function () {
        this.$httpBackend.expectPOST(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups?wide=true').respond(200);
        this.CallPickupGroupService.saveCallPickupGroup(cp).then(
          successSpy,
          failureSpy
        );
        this.$httpBackend.flush();
        expect(successSpy).toHaveBeenCalled();
        expect(failureSpy).not.toHaveBeenCalled();
      });

      it('should fail', function () {
        this.$httpBackend.expectPOST(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups?wide=true').respond(500);
        this.CallPickupGroupService.saveCallPickupGroup(cp).then(
         successSpy,
          failureSpy
        );
        this.$httpBackend.flush();
        expect(successSpy).not.toHaveBeenCalled();
        expect(failureSpy).toHaveBeenCalled();
      });
  });

  describe('verify line selected', () => {
    let selectedMembers = getJSONFixture('huron/json/features/callPickup/member.json');
    selectedMembers[0].checkboxes.value = false;
    selectedMembers[0].saveNumbers = [];
    beforeEach(initComponent);

    it('should return false if a member doesn\'t have a single line selected ', function () {
      expect(this.CallPickupGroupService.verifyLineSelected(selectedMembers)).toEqual(false);
    });
  });

  describe('updateCallPickup: ', () => {
    it('should be successful', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(200);
      this.CallPickupGroupService.updateCallPickup(cp.uuid, cp).then(
        successSpy,
        failureSpy
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(500);
      this.CallPickupGroupService.updateCallPickup(cp.uuid, cp).then(
        successSpy,
        failureSpy
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('getListOfCallPickups: ', () => {
    it('should call successSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups?wide=true').respond(200);
      this.CallPickupGroupService.getListOfPickupGroups().then(
        successSpy,
        failureSpy
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should call failureSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups?wide=true').respond(500);
      this.CallPickupGroupService.getListOfPickupGroups().then(
        successSpy,
        failureSpy
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('getCallPickupGroup: ', () => {
    it('should call successSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(200);
      this.CallPickupGroupService.getCallPickupGroup(cp.uuid).then(
        successSpy,
        failureSpy
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should call failureSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(500);
      this.CallPickupGroupService.getCallPickupGroup(cp.uuid).then(
        successSpy,
        failureSpy
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('deletePickupGroup: ', () => {
    it('should be successful', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(200);
      this.CallPickupGroupService.deletePickupGroup(cp.uuid).then(
        successSpy,
        failureSpy
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(500);
      this.CallPickupGroupService.deletePickupGroup(cp.uuid).then(
       successSpy,
        failureSpy
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('create checkboxes for member test', () => {
    let member1, member2, memberData, checkboxesList, allNumbers;

    beforeEach(initComponent);

    beforeEach(function () {
      checkboxesList = getJSONFixture('huron/json/features/callPickup/checkboxesList.json');
      member1 = angular.copy(membersList[0]);
      memberData = {
        member: member1,
        picturePath: fake_picture_path,
        checkboxes: checkboxesList,
        saveNumbers: [],
      };
      member2 = angular.copy(membersList[1]);
      allNumbers = getJSONFixture('huron/json/features/callPickup/numbersList.json');
      spyOn(this.CallPickupGroupService, 'createCheckBoxes').and.callThrough();
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/0001/numbers').respond(200, allNumbers);
      this.$scope.$digest();
    });

    it('should create checkboxes for all numbers', function () {
      this.CallPickupGroupService.createCheckBoxes(memberData, numbersArray);
      expect(memberData.checkboxes[0].label).toEqual('2361');
      expect(memberData.checkboxes[0].value).toEqual(true);
      expect(memberData.checkboxes[0].sublabel).toEqual('');
      expect(memberData.checkboxes[0].numberUuid).toEqual('920b3f0f-fb6d-406c-b5b3-58c1bd390478');
    });

    it('should create checkboxes for all numbers and mark only primary number as true', function () {
      this.CallPickupGroupService.createCheckBoxes(memberData, numbersArray);
      expect(memberData.checkboxes[1].label).toEqual('2142');
      expect(memberData.checkboxes[1].value).toEqual(false);
      expect(memberData.checkboxes[1].sublabel).toEqual('');
      expect(memberData.checkboxes[1].numberUuid).toEqual('22e04285-9574-4411-b786-f238ea6b58cb');
    });

    describe('get member numbers', () => {
      beforeEach(initComponent);

      it('Should return all the numbers for a member', function () {
        this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/0001/numbers').respond(200, numbersObject);
        this.CallPickupGroupService.getMemberNumbers('0001').then(function (response) {
          expect(response.length).toEqual(9);
        });
        this.$httpBackend.flush();
      });
    });
  });
});
