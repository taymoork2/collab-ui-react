describe('Component: pgEdit', () => {

  const NUMBER_SELECT = '.csSelect-container[labelfield="extension"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const NAME_INPUT = 'input#paging-group-name';
  const SAVE_BUTTON = 'button.btn.btn--primary.ng-isolate-scope';
  const CANCEL_BUTTON = 'button.ng-binding';
  const SEARCH_INPUT = 'input#search-member-box';

  let getNumberSuggestionsFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };

  let pg = getJSONFixture('huron/json/features/pagingGroup/pgWithMembersAndInitiators.json');
  let pg2 = getJSONFixture('huron/json/features/pagingGroup/pgWithEmptyInitiators.json');
  let pgUpdated = getJSONFixture('huron/json/features/pagingGroup/pgUpdated.json');
  let pgUpdate = getJSONFixture('huron/json/features/pagingGroup/pgUpdate.json');
  let invalidName = 'Invalid <>';
  let pilotNumbers = getJSONFixture('huron/json/features/pagingGroup/numberList.json');
  let updateFailureResp = getJSONFixture('huron/json/features/pagingGroup/errorResponse.json');
  let membersList = getJSONFixture('huron/json/features/pagingGroup/membersList2.json');

  let fake_picture_path = 'https://09876/zyxwuv';

  let pagingServiceFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };

  let placeResponse = {
    uuid: '0002',
    sipAddress: '',
    displayName: 'peter desk',
    name: 'peterdesk1476969612793@pagingtest.wbx2.com',
    numbers: [],
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

  let memberFailureResp = {
    data: 'Not Found',
    status: 404,
    statusText: 'Not Found',
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

  let numberData = {
    extension: '2222',
    extensionUUID: '8e33e338-0caa-4579-86df-38ef7590f432',
  };

  beforeEach(function () {
    this.initModules('huron.paging-group.edit');
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'FeatureToggleService',
      'Notification',
      'Authinfo',
      'PagingGroupService',
      'PagingNumberService',
      'FeatureMemberService',
    );

    this.pg = pg;

    this.$scope.pgId = pg.groupId;
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'error');
    spyOn(this.Notification, 'errorResponse');

    this.getPagingGroupDefer = this.$q.defer();
    spyOn(this.PagingGroupService, 'getPagingGroup').and.returnValue(this.getPagingGroupDefer.promise);

    this.updatePagingGroupDefer = this.$q.defer();
    spyOn(this.PagingGroupService, 'updatePagingGroup').and.returnValue(this.updatePagingGroupDefer.promise);

    this.getNumberSuggestionsDefer = this.$q.defer();
    spyOn(this.PagingNumberService, 'getNumberSuggestions').and.returnValue(this.getNumberSuggestionsDefer.promise);

    this.getNumberExtensionDefer = this.$q.defer();
    spyOn(this.PagingNumberService, 'getNumberExtension').and.returnValue(this.getNumberExtensionDefer.promise);

    this.getUserDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getUser').and.returnValue(this.getUserDefer.promise);

    this.getPlaceDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getPlace').and.returnValue(this.getPlaceDefer.promise);

    this.getMemberListDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberSuggestions').and.returnValue(this.getMemberListDefer.promise);

    this.getMemberPictureDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberPicture').and.returnValue(this.getMemberPictureDefer.promise);

    this.getMachineAcctDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMachineAcct').and.returnValue(this.getMachineAcctDefer.promise);

    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
  });

  function initComponent() {
    this.compileComponent('pgEdit', {
      pgId: 'pgId',
    });
  }

  function initInvalidComponent() {
    this.compileComponent('pgEdit', {
      pgId: '',
    });
  }

  describe('onInit ', () => {
    beforeEach(initComponent);

    it('should initialize all the Paging Group data', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      expect(this.controller.loading).toBeTruthy();
      this.$scope.$apply();
      expect(this.PagingGroupService.getPagingGroup).toHaveBeenCalledWith(this.pg.groupId);
      expect(this.controller.name).toEqual(this.pg.name);
      expect(this.controller.number).toEqual(numberData);
      expect(this.controller.members[0].member.displayName).toEqual('peter desk');
      expect(this.controller.members[1].member.firstName).toEqual('rtp2');
      expect(this.controller.loading).toBeFalsy();
      expect(this.PagingNumberService.getNumberSuggestions).toHaveBeenCalled();
    });

    it('should have a selection of numbers in dropdown', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPagingGroupDefer.resolve(pg);
      this.$scope.$apply();
      expect(this.view.find(DROPDOWN_OPTIONS).get(0)).toHaveText(pilotNumbers[0].extension);
      expect(this.view.find(DROPDOWN_OPTIONS).get(1)).toHaveText(pilotNumbers[1].extension);
      expect(this.view.find(DROPDOWN_OPTIONS).get(2)).toHaveText(pilotNumbers[2].extension);
      expect(this.view.find(DROPDOWN_OPTIONS).get(3)).toHaveText(pilotNumbers[3].extension);
    });

    it('should invoke onChange with number on option click', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      expect(this.controller.initiatorType).toEqual('CUSTOM');
      this.view.find(NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
      expect(this.controller.formChanged).toBeTruthy();
    });

    it('should invoke onChange with name change', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(NAME_INPUT).click();
      this.view.find(NAME_INPUT).val(pgUpdated.name).change();
      expect(this.controller.formChanged).toBeTruthy();
    });

    it('should display Notification when getPagingGroup failed', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPagingGroupDefer.reject(pagingServiceFailureResp);
      this.$scope.$apply();
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorUpdate', { message: '' });
    });
  });

  describe('Negative on getNumberSuggestions', function () {
    beforeEach(initComponent);

    it('should notify with error response when number fetch fails', function () {
      this.getPagingGroupDefer.resolve(pg);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getNumberSuggestionsDefer.reject(getNumberSuggestionsFailureResp);
      this.$scope.$apply();
      expect(this.Notification.errorResponse).toHaveBeenCalledWith(jasmine.anything(),
        'pagingGroup.numberFetchFailure');
    });
  });

  describe('onInit with invalid pdId', () => {
    beforeEach(initInvalidComponent);

    it('should go to huronfeatureurl', function () {
      this.$scope.$apply();
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });
  });

  describe('disableSaveForm', () => {
    beforeEach(initComponent);
    it('should disable show Save button', function () {
      this.getPagingGroupDefer.resolve(pg);
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(NAME_INPUT).val(invalidName).change();
      expect(this.controller.errorNameInput).toBeTruthy();
      expect(this.view.find(SAVE_BUTTON)).toBeDisabled();
    });
  });

  describe('saveForm', () => {
    beforeEach(initComponent);
    it('should be able to cancel updatePagingGroup', function () {
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg));
      this.getNumberSuggestionsDefer.resolve(_.cloneDeep(pilotNumbers));
      this.getNumberExtensionDefer.resolve(_.cloneDeep(numberData));
      this.getPlaceDefer.resolve(_.cloneDeep(placeResponse));
      this.$scope.$apply();
      this.view.find(NAME_INPUT).val(pgUpdated.name).change();
      expect(this.view.find(CANCEL_BUTTON)).toExist();
      this.view.find(CANCEL_BUTTON).click();
      expect(this.controller.name).toEqual(pg.name);
      expect(this.controller.errorNameInput).toBeFalsy();
      expect(this.controller.formChanged).toBeFalsy();
    });

    it('should update PagingGroup', function () {
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg));
      this.updatePagingGroupDefer.resolve(_.cloneDeep(pgUpdated));
      this.getNumberSuggestionsDefer.resolve(_.cloneDeep(pilotNumbers));
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPlaceDefer.resolve(placeResponse);
      this.getUserDefer.resolve(userResponse);
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = numberData;
      this.controller.saveForm();
      this.$scope.$apply();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdate);
      expect(this.Notification.success).toHaveBeenCalledWith('pagingGroup.successUpdate');
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });

    it('should update PagingGroup fail and notify', function () {
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg));
      this.updatePagingGroupDefer.reject(updateFailureResp);
      this.getNumberSuggestionsDefer.resolve(_.cloneDeep(pilotNumbers));
      this.getNumberExtensionDefer.resolve(_.cloneDeep(numberData));
      this.getPlaceDefer.resolve(_.cloneDeep(placeResponse));
      this.getUserDefer.resolve(_.cloneDeep(userResponse));
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = numberData;
      this.controller.saveForm();
      this.$scope.$apply();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdate);
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorUpdate', { message: 'A group with this name already exists.' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });

    it('should update PagingGroup fail and not notify', function () {
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg));
      this.updatePagingGroupDefer.reject();
      this.getNumberSuggestionsDefer.resolve(_.cloneDeep(pilotNumbers));
      this.getNumberExtensionDefer.resolve(_.cloneDeep(numberData));
      this.getPlaceDefer.resolve(_.cloneDeep(placeResponse));
      this.getUserDefer.resolve(_.cloneDeep(userResponse));
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = numberData;
      this.controller.saveForm();
      this.$scope.$apply();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdate);
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorUpdate', { message: '' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });
  });

  describe('add member or initiator test', () => {
    beforeEach(initComponent);

    it('should fetch a list of members or initiators', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.controller.memberName = 'por';
      this.getMemberListDefer.resolve(membersList);
      this.getMachineAcctDefer.resolve(getMachineAcctResponse);
      this.controller.fetchMembers('MEMBER');
      this.$scope.$apply();
      expect(this.controller.availableMembers.length).toEqual(3);
      this.controller.initiatorName = 'por';
      this.getMemberListDefer.resolve(membersList);
      this.getMachineAcctDefer.resolve(getMachineAcctResponse);
      this.controller.fetchMembers('INITIATOR');
      this.$scope.$apply();
      expect(this.controller.availableInitiators.length).toEqual(3);
    });

    it('should fetchMembers with member failure', function () {
      this.getMemberListDefer.reject(_.cloneDeep(pagingServiceFailureResp));
      this.controller.memberName = 'por';
      this.controller.fetchMembers('MEMBER');
      this.$scope.$apply();
      expect(this.Notification.errorResponse).toHaveBeenCalledWith(pagingServiceFailureResp, 'pagingGroup.memberFetchFailure');
    });

    it('should fetchMembers with initiator failure', function () {
      this.getMemberListDefer.reject(_.cloneDeep(pagingServiceFailureResp));
      this.controller.memberName = 'por';
      this.controller.fetchMembers('INITIATOR');
      this.$scope.$apply();
      expect(this.Notification.errorResponse).toHaveBeenCalledWith(pagingServiceFailureResp, 'pagingGroup.InitiatorFetchFailure');
    });

    it('should only display subset of fetched initiators if place phone is room device', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      let numberData2 = {
        extension: '5002',
        extensionUUID: '8e33e338-0caa-4579-86df-38ef7590f430',
      };
      this.getNumberExtensionDefer.resolve(numberData2);
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg2));
      this.getUserDefer.resolve(_.cloneDeep(userResponse));
      this.getPlaceDefer.resolve(_.cloneDeep(placeResponse));
      this.$scope.$apply();
      this.controller.memberName = 'por';
      this.getMemberListDefer.resolve(_.cloneDeep(membersList));
      this.getMachineAcctDefer.resolve(_.cloneDeep(getMachineAcctResponse2));
      this.controller.fetchMembers('MEMBER');
      this.$scope.$apply();
      expect(this.controller.availableMembers.length).toEqual(4);
      this.controller.initiatorName = 'por';
      this.controller.initiatorType = 'CUSTOM';
      this.controller.fetchMembers('INITIATOR');
      this.$scope.$apply();
      expect(this.controller.availableInitiators.length).toEqual(4);
    });

    it('should only display subset of fetched initiators if getMachineAcct failed', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      let numberData2 = {
        extension: '5002',
        extensionUUID: '8e33e338-0caa-4579-86df-38ef7590f430',
      };
      this.getNumberExtensionDefer.resolve(numberData2);
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg2));
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.controller.memberName = 'por';
      this.getMemberListDefer.resolve(_.cloneDeep(membersList));
      this.getMachineAcctDefer.reject(pagingServiceFailureResp);
      this.controller.fetchMembers('MEMBER');
      this.$scope.$apply();
      expect(this.controller.availableMembers.length).toEqual(4);
      this.controller.initiatorName = 'por';
      this.controller.fetchMembers('INITIATOR');
      this.$scope.$apply();
      expect(this.controller.availableInitiators.length).toEqual(4);
    });

    it('should be able to select and unselect a member and initiator', function () {
      this.controller.availableMembers = membersList;
      let mem1 = _.cloneDeep(this.controller.availableMembers[0]);
      this.getUserDefer.resolve(userResponse);
      this.controller.selectMembers(mem1);
      this.$scope.$apply();
      expect(this.controller.members.length).toEqual(1);
      expect(this.controller.members[0].member.uuid).toEqual('0001');
      expect(this.controller.members[0].member.type).toEqual('USER_REAL_USER');
      expect(this.controller.members[0].picturePath).toEqual(fake_picture_path);

      this.controller.availableInitiators = membersList;
      let initiator1 = _.cloneDeep(this.controller.availableInitiators[0]);
      this.getUserDefer.resolve(userResponse);
      this.controller.selectInitiators(initiator1);
      this.$scope.$apply();
      expect(this.controller.initiators.length).toEqual(1);
      expect(this.controller.initiators[0].member.uuid).toEqual('0001');
      expect(this.controller.initiators[0].member.type).toEqual('USER_REAL_USER');
      expect(this.controller.initiators[0].picturePath).toEqual(fake_picture_path);

      let memWithPic = {
        member: mem1,
        picturePath: fake_picture_path,
      };

      this.controller.removeMembers(memWithPic);
      expect(this.controller.members.length).toEqual(0);

      this.controller.removeInitiators(memWithPic);
      expect(this.controller.initiators.length).toEqual(0);
    });
  });

  describe('search member test', () => {
    beforeEach(initComponent);

    it('should search firstname of members', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(SEARCH_INPUT).val('rtp2').change();
      expect(this.controller.listOfDisplayMembers.length).toEqual(1);
      expect(this.controller.listOfDisplayMembers[0].member.firstName).toEqual('rtp2');
      expect(this.controller.listOfDisplayMembers[0].member.lastName).toEqual('rtp2lastname');
      expect(this.controller.listOfDisplayMembers[0].member.userName).toEqual('porsche.rtp+phone2@gmail.com');
    });

    it('should search lastname of members', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(SEARCH_INPUT).val('rtp2lastname').change();
      expect(this.controller.listOfDisplayMembers.length).toEqual(1);
      expect(this.controller.listOfDisplayMembers[0].member.firstName).toEqual('rtp2');
      expect(this.controller.listOfDisplayMembers[0].member.lastName).toEqual('rtp2lastname');
      expect(this.controller.listOfDisplayMembers[0].member.userName).toEqual('porsche.rtp+phone2@gmail.com');
    });

    it('should search username of members', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(SEARCH_INPUT).val('porsche.rtp+phone2').change();
      expect(this.controller.listOfDisplayMembers.length).toEqual(1);
      expect(this.controller.listOfDisplayMembers[0].member.firstName).toEqual('rtp2');
      expect(this.controller.listOfDisplayMembers[0].member.lastName).toEqual('rtp2lastname');
      expect(this.controller.listOfDisplayMembers[0].member.userName).toEqual('porsche.rtp+phone2@gmail.com');
    });

    it('should search displayname of members', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(SEARCH_INPUT).val('display').change();
      expect(this.controller.listOfDisplayMembers.length).toEqual(1);
      expect(this.controller.listOfDisplayMembers[0].member.firstName).toEqual('rtp2');
      expect(this.controller.listOfDisplayMembers[0].member.lastName).toEqual('rtp2lastname');
      expect(this.controller.listOfDisplayMembers[0].member.userName).toEqual('porsche.rtp+phone2@gmail.com');
    });

    it('should find no members', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getNumberExtensionDefer.resolve(numberData);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(SEARCH_INPUT).val('Not-there').change();
      expect(this.controller.listOfDisplayMembers.length).toEqual(0);
    });
  });

  describe('ShowMore ShowLess clicked', () => {
    beforeEach(initComponent);

    it('Test ShowMoreClicked', function () {
      this.controller.showMoreClicked('USER_REAL_USER', 'MEMBER');
      expect(this.controller.numberOfCardsUsers).toEqual(undefined);
      this.controller.showMoreClicked('USER_PLACE', 'MEMBER');
      expect(this.controller.numberOfCardsPlaces).toEqual(undefined);
    });

    it('Test showLessClicked', function () {
      this.controller.showLessClicked('USER_REAL_USER', 'MEMBER');
      expect(this.controller.numberOfCardsUsers).toEqual(this.controller.cardThreshold);
      this.controller.showLessClicked('USER_PLACE', 'MEMBER');
      expect(this.controller.numberOfCardsPlaces).toEqual(this.controller.cardThreshold);
    });

    it('Test showMoreButton', function () {
      spyOn(this.controller, 'getUserCount').and.returnValue(7);
      this.controller.numberOfCardsUsers = this.controller.cardThreshold;
      expect(this.controller.showMoreButton('USER_REAL_USER', 'MEMBER')).toBeTruthy;
    });

    it('Test showLessButton', function () {
      spyOn(this.controller, 'getUserCount').and.returnValue(7);
      this.controller.numberOfCardsUsers = undefined;
      expect(this.controller.showLessButton('USER_REAL_USER', 'MEMBER')).toBeTruthy;
    });
  });

  describe('Test getUserCount and getPlaceCount', () => {
    beforeEach(initComponent);

    it('incrementCount test', function () {
      this.controller.userCount = 0;
      this.controller.placeCount = 0;
      let mem = _.cloneDeep(membersList[0]);
      this.controller.incrementCount(mem);
      expect(this.controller.getUserCount()).toEqual(1);
      expect(this.controller.getPlaceCount()).toEqual(0);

      let mem1 = _.cloneDeep(membersList[1]);
      this.controller.incrementCount(mem1);
      expect(this.controller.getUserCount()).toEqual(1);
      expect(this.controller.getPlaceCount()).toEqual(1);
    });

    it('decreaseCount test', function () {
      this.controller.userCount = 1;
      this.controller.placeCount = 1;
      let mem = _.cloneDeep(membersList[0]);
      this.controller.decreaseCount(mem);
      expect(this.controller.getUserCount()).toEqual(0);
      expect(this.controller.getPlaceCount()).toEqual(1);

      let mem1 = _.cloneDeep(membersList[1]);
      this.controller.decreaseCount(mem1);
      expect(this.controller.getUserCount()).toEqual(0);
      expect(this.controller.getPlaceCount()).toEqual(0);
    });
  });

  describe('Test User out of Sync scenario', () => {
    beforeEach(initComponent);

    it('should update pg to clear out outOfSync if not find an user in UPDM', function () {
      this.getNumberSuggestionsDefer.resolve(_.cloneDeep(pilotNumbers));
      this.getNumberExtensionDefer.resolve(_.cloneDeep(numberData));
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg));
      this.getUserDefer.reject(memberFailureResp);
      this.getPlaceDefer.reject(memberFailureResp);
      expect(this.controller.loading).toBeTruthy();
      this.$scope.$apply();
      expect(this.PagingGroupService.getPagingGroup).toHaveBeenCalledWith(this.pg.groupId);
      expect(this.controller.name).toEqual(this.pg.name);
      expect(this.controller.number).toEqual(numberData);
      expect(this.controller.loading).toBeFalsy();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalled();
      expect(this.PagingNumberService.getNumberSuggestions).toHaveBeenCalled();
    });
  });
});
