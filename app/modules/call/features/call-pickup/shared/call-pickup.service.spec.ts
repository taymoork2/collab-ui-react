import callPickupServiceModule from './index';

describe('Service: callPickupService', () => {
  const membersList = getJSONFixture('huron/json/features/callPickup/membersList.json');
  const numbersObject = getJSONFixture('huron/json/features/callPickup/numbersList.json');
  const numbersArray = _.result(numbersObject, 'numbers');
  const fake_picture_path = 'https://abcde/12345';
  let successSpy, failureSpy;
  const cp = getJSONFixture('huron/json/features/callPickup/pickup.json');

  beforeEach(function () {
    this.initModules(callPickupServiceModule);
    this.injectDependencies(
      '$scope',
      '$q',
      'FeatureMemberService',
      '$httpBackend',
      'Authinfo',
      'HuronConfig',
      'CallPickupGroupService',
      '$translate',
    );

    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    this.$scope.$apply();
    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
    this.isLineInPickupGroupDefer = this.$q.defer();
    spyOn(this.CallPickupGroupService, 'isLineInPickupGroup').and.returnValue(this.isLineInPickupGroupDefer.promise);
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
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail', function () {
      this.$httpBackend.expectPOST(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups?wide=true').respond(500);
      this.CallPickupGroupService.saveCallPickupGroup(cp).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('verify line selected', () => {
    const selectedMembers = getJSONFixture('huron/json/features/callPickup/member.json');
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
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail', function () {
      this.$httpBackend.expectPUT(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(500);
      this.CallPickupGroupService.updateCallPickup(cp.uuid, cp).then(
        successSpy,
        failureSpy,
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
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should call failureSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups?wide=true').respond(500);
      this.CallPickupGroupService.getListOfPickupGroups().then(
        successSpy,
        failureSpy,
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
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should call failureSpy', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(500);
      this.CallPickupGroupService.getCallPickupGroup(cp.uuid).then(
        successSpy,
        failureSpy,
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
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should fail', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/features/callpickups/' + cp.uuid + '?wide=true').respond(500);
      this.CallPickupGroupService.deletePickupGroup(cp.uuid).then(
        successSpy,
        failureSpy,
      );
      this.$httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('create checkboxes for member test', () => {
    let member1, memberData, checkboxesList, allNumbers;

    beforeEach(initComponent);

    beforeEach(function () {
      checkboxesList = getJSONFixture('huron/json/features/callPickup/checkboxesList.json');
      member1 = _.cloneDeep(membersList[0]);
      memberData = {
        member: member1,
        picturePath: fake_picture_path,
        checkboxes: checkboxesList,
        saveNumbers: [],
      };
      allNumbers = getJSONFixture('huron/json/features/callPickup/numbersList.json');
      spyOn(this.CallPickupGroupService, 'createCheckboxes').and.callThrough();
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/0001/numbers').respond(200, allNumbers);
      this.$scope.$digest();

    });

    it('should create a disabled checkbox numbers', function () {
      spyOn(this.$translate, 'instant').and.callThrough();

      this.isLineInPickupGroupDefer.resolve('helpdesk');
      this.CallPickupGroupService.createCheckboxes(memberData, numbersArray).then(() => {
        expect(memberData.checkboxes[0].label).toEqual('3081');
        expect(memberData.checkboxes[0].value).toEqual(false);
        expect(memberData.checkboxes[0].numberUuid).toEqual('920b3f0f-fb6d-406c-b5b3-58c1bd390478');
        expect(memberData.checkboxes[0].disabled).toEqual(true);
      });
      this.$scope.$digest();
      expect(this.$translate.instant).toHaveBeenCalled();
    });

    it('should create checkboxes for all numbers', function () {
      this.isLineInPickupGroupDefer.resolve('');
      this.CallPickupGroupService.createCheckboxes(memberData, numbersArray);
      expect(memberData.checkboxes[0].label).toEqual('3081');
      expect(memberData.checkboxes[0].numberUuid).toEqual('920b3f0f-fb6d-406c-b5b3-58c1bd390478');
    });

    it('should create checkboxes for all numbers and mark only primary number as true', function () {
      this.isLineInPickupGroupDefer.resolve('');
      this.CallPickupGroupService.createCheckboxes(memberData, numbersArray);
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

  describe('get pickup', () => {

    it('should return group name if line is in a pickup group', function () {

      const lineInPickupGroup = getJSONFixture('huron/json/features/callPickup/lineInPickupGroup.json');
      const lineFeaturesInPickupGroup = getJSONFixture('huron/json/features/callPickup/lineFeaturesInPickupGroup.json');
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers?number=3081&wide=true').respond(200, lineInPickupGroup);
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers/29812608-555c-4e41-92dc-409555ab93cd?wide=true').respond(200, lineFeaturesInPickupGroup);
      this.$scope.$digest();
      this.CallPickupGroupService.isLineInPickupGroup('3081')
        .then((response: string) => {
          expect(response).toMatch('helpdesk');
        });
    });

    it('should return false if line is not in a pickup group', function () {
      const lineNotInPickupGroup = getJSONFixture('huron/json/features/callPickup/lineNotInPickupGroup.json');
      const lineFeaturesNotInPickupGroup = getJSONFixture('huron/json/features/callPickup/lineFeaturesNotInPickupGroup.json');
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers?number=2064&wide=true').respond(200, lineNotInPickupGroup);
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers/b9c3e94b-3399-4ab4-8e39-7367f77c12f?wide=true').respond(200, lineFeaturesNotInPickupGroup);
      this.CallPickupGroupService.isLineInPickupGroup('2064')
        .then((response: string) => {
          expect(response).toEqual('');
        });
    });

    it('should return true if ALL lines are in a pickup group', function () {
      const member = getJSONFixture('huron/json/features/callPickup/memberWithAllLinesInPickupGroup.json');
      const memberNumbers = getJSONFixture('huron/json/features/callPickup/memberWithAllLinesInPickupGroupNumbers.json');

      const memberWithAllLinesInPickupGroupNumber1 = getJSONFixture('huron/json/features/callPickup/memberWithAllLinesInPickupGroupNumber1.json');
      const memberWithAllLinesInPickupGroupNumber1Features = getJSONFixture('huron/json/features/callPickup/memberWithAllLinesInPickupGroupNumber1Features.json');

      const memberWithAllLinesInPickupGroupNumber2 = getJSONFixture('huron/json/features/callPickup/memberWithAllLinesInPickupGroupNumber2.json');
      const memberWithAllLinesInPickupGroupNumber2Features = getJSONFixture('huron/json/features/callPickup/memberWithAllLinesInPickupGroupNumber2Features.json');

      //all numbers of member
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/users/ccf6f31f-b87c-4a0f-8ddf-bd3e489eeaed/numbers').respond(200, memberNumbers);
      //calls for first number
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers?number=2176&wide=true').respond(200, memberWithAllLinesInPickupGroupNumber1);
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers/29812608-555c-4e41-92dc-409555ab93cd?wide=true').respond(200, memberWithAllLinesInPickupGroupNumber1Features);
      //calls for second number
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers?number=3081&wide=true').respond(200, memberWithAllLinesInPickupGroupNumber2);
      this.$httpBackend.whenGET(this.HuronConfig.getCmiV2Url() + '/customers/' + this.Authinfo.getOrgId() + '/numbers/29812608-555c-4e41-92dc-409555ab93cd?wide=true').respond(200, memberWithAllLinesInPickupGroupNumber2Features);

      this.CallPickupGroupService.areAllLinesInPickupGroup(member).then((response: boolean) => {
        expect(response).toEqual(true);
      });
      this.$httpBackend.flush();
    });
  });
});
