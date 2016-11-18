describe('Component: pgEdit', () => {

  const NUMBER_SELECT = '.csSelect-container[labelfield="number"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const NAME_INPUT = 'input#paging-group-name';
  const SAVE_BUTTON = 'button.btn.btn--primary.ng-isolate-scope';
  const CANCEL_BUTTON = 'button.ng-binding';
  const MEMBER_INPUT = 'input#paging-group-member';
  const SEARCH_INPUT = 'input#search-member-box';

  let getNumberSuggestionsFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };

  let pg = getJSONFixture('huron/json/features/pagingGroup/pgWithMembers.json');
  let pgUpdated = getJSONFixture('huron/json/features/pagingGroup/pgUpdated.json');
  let invalidName = 'Invalid <>';
  let pilotNumbers = getJSONFixture('huron/json/features/pagingGroup/numberList.json');
  let updateFailureResp = getJSONFixture('huron/json/features/pagingGroup/errorResponse.json');
  let membersList = getJSONFixture('huron/json/features/pagingGroup/membersList2.json');

  let fake_picture_path = 'https://09876/zyxwuv';

  let getMemberListFailureResp = {
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

  beforeEach(function () {
    this.initModules('huron.paging-group.edit');
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
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

    this.getUserDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getUser').and.returnValue(this.getUserDefer.promise);

    this.getPlaceDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getPlace').and.returnValue(this.getPlaceDefer.promise);

    this.getMemberListDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberSuggestions').and.returnValue(this.getMemberListDefer.promise);

    this.getMemberPictureDefer = this.$q.defer();
    spyOn(this.FeatureMemberService, 'getMemberPicture').and.returnValue(this.getMemberPictureDefer.promise);

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
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      expect(this.controller.loading).toBeTruthy();
      this.$scope.$apply();
      expect(this.PagingGroupService.getPagingGroup).toHaveBeenCalledWith(this.pg.groupId);
      expect(this.controller.name).toEqual(this.pg.name);
      expect(this.controller.number).toEqual(this.pg.extension);
      expect(this.controller.members[0].member.displayName).toEqual('peter desk');
      expect(this.controller.members[1].member.firstName).toEqual('rtp2');
      expect(this.controller.loading).toBeFalsy();
      expect(this.PagingNumberService.getNumberSuggestions).toHaveBeenCalled();
    });

    it('should have a selection of numbers in dropdown', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPagingGroupDefer.resolve(pg);
      this.$scope.$apply();
      expect(this.view.find(DROPDOWN_OPTIONS).get(0)).toHaveText(pilotNumbers[0]);
      expect(this.view.find(DROPDOWN_OPTIONS).get(1)).toHaveText(pilotNumbers[1]);
      expect(this.view.find(DROPDOWN_OPTIONS).get(2)).toHaveText(pilotNumbers[2]);
      expect(this.view.find(DROPDOWN_OPTIONS).get(3)).toHaveText(pilotNumbers[3]);
    });

    it('should invoke onChange with number on option click', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPagingGroupDefer.resolve(pg);
      this.$scope.$apply();
      this.view.find(NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
      expect(this.controller.formChanged).toBeTruthy();
    });

    it('should invoke onChange with name change', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPagingGroupDefer.resolve(pg);
      this.$scope.$apply();
      this.view.find(NAME_INPUT).click();
      this.view.find(NAME_INPUT).val(pgUpdated.name).change();
      expect(this.controller.formChanged).toBeTruthy();
    });
  });

  describe('Negative on getNumberSuggestions', function () {
    beforeEach(initComponent);

    it('should notify with error response when number fetch fails', function () {
      this.getPagingGroupDefer.resolve(pg);
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
      this.getPagingGroupDefer.resolve(pg);
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(NAME_INPUT).val(pgUpdated.name).change();
      expect(this.view.find(CANCEL_BUTTON)).toExist();
      this.view.find(CANCEL_BUTTON).click();
      expect(this.controller.name).toEqual(pg.name);
      expect(this.controller.number).toEqual(pg.extension);
      expect(this.controller.errorNameInput).toBeFalsy();
      expect(this.controller.formChanged).toBeFalsy();
    });

    it('should update PagingGroup', function () {
      this.getPagingGroupDefer.resolve(pg);
      this.updatePagingGroupDefer.resolve(pgUpdated);
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPlaceDefer.resolve(placeResponse);
      this.getUserDefer.resolve(userResponse);
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = pgUpdated.extension;
      this.controller.saveForm();
      this.$scope.$apply();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdated);
      expect(this.Notification.success).toHaveBeenCalledWith('pagingGroup.successUpdate');
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });

    it('should update PagingGroup fail and notify', function () {
      this.getPagingGroupDefer.resolve(pg);
      this.updatePagingGroupDefer.reject(updateFailureResp);
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPlaceDefer.resolve(placeResponse);
      this.getUserDefer.resolve(userResponse);
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = pgUpdated.extension;
      this.controller.saveForm();
      this.$scope.$apply();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdated);
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorUpdate', { message: 'A group with this name already exists.' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });

    it('should update PagingGroup fail and not notify', function () {
      this.getPagingGroupDefer.resolve(pg);
      this.updatePagingGroupDefer.reject();
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPlaceDefer.resolve(placeResponse);
      this.getUserDefer.resolve(userResponse);
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = pgUpdated.extension;
      this.controller.saveForm();
      this.$scope.$apply();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdated);
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorUpdate', { message: '' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });
  });

  describe('add member test', () => {
    beforeEach(initComponent);

    it('should fetch a list of members', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.getPagingGroupDefer.resolve(pg);
      this.getUserDefer.resolve(userResponse);
      this.getPlaceDefer.resolve(placeResponse);
      this.$scope.$apply();
      this.view.find(MEMBER_INPUT).val('por').change();
      this.getMemberListDefer.resolve(membersList);
      this.$scope.$apply();
      expect(this.controller.availableMembers.length).toEqual(3);
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
      this.getUserDefer.resolve(userResponse);
      this.controller.selectMembers(mem1);
      this.$scope.$apply();
      expect(this.controller.members.length).toEqual(1);
      expect(this.controller.members[0].member.uuid).toEqual('0001');
      expect(this.controller.members[0].member.type).toEqual('USER_REAL_USER');
      expect(this.controller.members[0].picturePath).toEqual(fake_picture_path);

      let memWithPic = {
        member: mem1,
        picturePath: fake_picture_path,
      };

      this.controller.removeMembers(memWithPic);
      expect(this.controller.members.length).toEqual(0);
    });

  });

  describe('search member test', () => {
    beforeEach(initComponent);

    it('should search firstname of members', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
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
      this.controller.showMoreClicked('USER_REAL_USER');
      expect(this.controller.numberOfCardsUsers).toEqual(undefined);
      this.controller.showMoreClicked('USER_PLACE');
      expect(this.controller.numberOfCardsPlaces).toEqual(undefined);
    });

    it('Test showLessClicked', function () {
      this.controller.showLessClicked('USER_REAL_USER');
      expect(this.controller.numberOfCardsUsers).toEqual(this.controller.cardThreshold);
      this.controller.showLessClicked('USER_PLACE');
      expect(this.controller.numberOfCardsPlaces).toEqual(this.controller.cardThreshold);
    });

    it('Test showMoreButton', function () {
      spyOn(this.controller, 'getUserCount').and.returnValue(7);
      this.controller.numberOfCardsUsers = this.controller.cardThreshold;
      expect(this.controller.showMoreButton('USER_REAL_USER')).toBeTruthy;
    });

    it('Test showLessButton', function () {
      spyOn(this.controller, 'getUserCount').and.returnValue(7);
      this.controller.numberOfCardsUsers = undefined;
      expect(this.controller.showLessButton('USER_REAL_USER')).toBeTruthy;
    });

    describe('Test getUserCount and getPlaceCount', () => {
      beforeEach(initComponent);

      it('incrementCount test', function () {
        this.controller.userCount = 0;
        this.controller.placeCount = 0;
        let mem = angular.copy(membersList[0]);
        this.controller.incrementCount(mem);
        expect(this.controller.getUserCount()).toEqual(1);
        expect(this.controller.getPlaceCount()).toEqual(0);

        let mem1 = angular.copy(membersList[1]);
        this.controller.incrementCount(mem1);
        expect(this.controller.getUserCount()).toEqual(1);
        expect(this.controller.getPlaceCount()).toEqual(1);
      });

      it('decreaseCount test', function () {
        this.controller.userCount = 1;
        this.controller.placeCount = 1;
        let mem = angular.copy(membersList[0]);
        this.controller.decreaseCount(mem);
        expect(this.controller.getUserCount()).toEqual(0);
        expect(this.controller.getPlaceCount()).toEqual(1);

        let mem1 = angular.copy(membersList[1]);
        this.controller.decreaseCount(mem1);
        expect(this.controller.getUserCount()).toEqual(0);
        expect(this.controller.getPlaceCount()).toEqual(0);
      });

    });
  });
});
