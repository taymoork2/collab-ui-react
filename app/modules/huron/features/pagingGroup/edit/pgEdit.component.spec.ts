import { INumber } from '../pgNumber.service';
import { IPagingGroup } from '../pagingGroup';

describe('Component: pgEdit', () => {

  const NUMBER_SELECT = '.csSelect-container[labelfield="number"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li a';
  const NAME_INPUT = 'input#paging-group-name';
  const SAVE_BUTTON = 'button.btn.btn--primary.ng-isolate-scope';
  const CANCEL_BUTTON = 'button.ng-binding';

  let pg: IPagingGroup = <IPagingGroup>{
    name: 'PG 1',
    number: <INumber>{
      number: '5004',
      uuid: '1234',
    },
    uuid: 'PG 1',
  };

  let getNumberSuggestionsFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };

  let pilotNumbers = getJSONFixture('huron/json/features/edit/pilotNumbers.json');

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

    this.$scope.pgId = pg.uuid;
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.PagingGroupService, 'getPagingGroup').and.returnValue(this.pg);
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorResponse');

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
      this.$scope.$apply();
      expect(this.PagingGroupService.getPagingGroup).toHaveBeenCalledWith(this.pg.uuid);
      expect(this.PagingNumberService.getNumberSuggestions).toHaveBeenCalled();
    });

    it('should have a selection of numbers in dropdown', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.$scope.$apply();
      expect(this.view.find(NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('1001');
      expect(this.view.find(NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('1002');
      expect(this.view.find(NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('1005');
      expect(this.view.find(NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('1006');
    });

    it('should invoke onChange with number on option click', function () {
      this.getNumberSuggestionsDefer.resolve(pilotNumbers);
      this.$scope.$apply();
      this.view.find(NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
      this.view.find(NAME_INPUT).click();
      this.view.find(NAME_INPUT).val('abcd').change();
      this.view.find(SAVE_BUTTON).click();
      expect(this.controller.formChanged).toBeTruthy();
    });
  });

  describe('Negative on getNumberSuggestions', function () {
    beforeEach(initComponent);

    it('should notify with error response when number fetch fails', function () {
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

      this.view.find(NAME_INPUT).val('PG 1<>').change();
      expect(this.controller.errorNameInput).toBeTruthy();
      expect(this.view.find(SAVE_BUTTON)).toBeDisabled();
    });
  });

  describe('saveForm', () => {
    beforeEach(initComponent);

    it('should be able to cancel updatePagingGroup', function () {
      this.view.find(NAME_INPUT).val('Canceled Name').change();

      expect(this.view.find(CANCEL_BUTTON)).toExist();
      this.view.find(CANCEL_BUTTON).click();

      expect(this.controller.name).toEqual(pg.name);
      expect(this.controller.number).toEqual(pg.number);
      expect(this.controller.errorNameInput).toBeFalsy();
      expect(this.controller.formChanged).toBeFalsy();
    });

    it('should update PagingGroup', function () {
      spyOn(this.PagingGroupService, 'updatePagingGroup');

      let name: string = 'updated_name';
      let number: INumber = <INumber>{
        uuid: '1',
        number: '5000',
      };
      let pg_update: IPagingGroup = <IPagingGroup>{
        name: name,
        number: number,
        uuid: pg.uuid, //TODO will hookup with real uuid when backend is ready
      };
      this.controller.name = pg_update.name;
      this.controller.number = pg_update.number;
      this.controller.saveForm();

      expect(this.PagingGroupService.updatePagingGroup).toHaveBeenCalledWith(pg_update);
      expect(this.$state.go).toHaveBeenCalledWith('huronfeatures');
    });
  });
});
