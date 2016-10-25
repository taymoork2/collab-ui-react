describe('Component: pgEdit', () => {

  const NUMBER_SELECT = '.csSelect-container[labelfield="number"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const NAME_INPUT = 'input#paging-group-name';
  const SAVE_BUTTON = 'button.btn.btn--primary.ng-isolate-scope';
  const CANCEL_BUTTON = 'button.ng-binding';

  let getNumberSuggestionsFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };

  let pg = getJSONFixture('huron/json/features/pagingGroup/pg.json');
  let pgUpdated = getJSONFixture('huron/json/features/pagingGroup/pgUpdated.json');
  let invalidName = 'Invalid <>';
  let pilotNumbers = getJSONFixture('huron/json/features/pagingGroup/numberList.json');
  let updateFailureResp = getJSONFixture('huron/json/features/pagingGroup/errorResponse.json');

  beforeEach(function () {
    this.initModules('huron.paging-group.edit');
    this.injectDependencies(
      '$q',
      '$scope',
      '$timeout',
      '$state',
      'Notification',
      'Authinfo',
      'PagingGroupService',
      'PagingNumberService',
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
      expect(this.controller.loading).toBeTruthy();
      this.$scope.$apply();
      expect(this.PagingGroupService.getPagingGroup).toHaveBeenCalledWith(this.pg.groupId);
      expect(this.controller.name).toEqual(this.pg.name);
      expect(this.controller.number).toEqual(this.pg.extension);
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
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = pgUpdated.extension;
      this.controller.saveForm();
      this.$timeout.flush();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdated);
      expect(this.Notification.success).toHaveBeenCalledWith('pagingGroup.successUpdate');
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });

    it('should update PagingGroup fail and notify', function () {
      this.getPagingGroupDefer.resolve(pg);
      this.updatePagingGroupDefer.reject(updateFailureResp);
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = pgUpdated.extension;
      this.controller.saveForm();
      this.$timeout.flush();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdated);
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorUpdate', { message: 'A group with this name already exists.' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });

    it('should update PagingGroup fail and not notify', function () {
      this.getPagingGroupDefer.resolve(pg);
      this.updatePagingGroupDefer.reject();
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.$scope.$apply();
      this.controller.name = pgUpdated.name;
      this.controller.number = pgUpdated.extension;
      this.controller.saveForm();
      this.$timeout.flush();
      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pgUpdated);
      expect(this.Notification.error).toHaveBeenCalledWith('pagingGroup.errorUpdate', { message: '' });
      expect(this.$state.go).not.toHaveBeenCalledWith('huronfeatures');
    });
  });
});
