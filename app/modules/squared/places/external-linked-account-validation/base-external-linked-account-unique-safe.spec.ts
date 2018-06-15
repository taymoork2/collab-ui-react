import { BaseExternalLinkedAccountUniqueSafe, IBaseExternalLinkedAccountUniqueSafeOptions, ValidationState } from './base-external-linked-account-unique-safe';

describe('BaseExternalLinkedAccountUniqueSafe class', () => {
  beforeEach(angular.mock.module('Squared'));

  let state = defaultState();

  function defaultState() {
    return {
      CsdmFilteredViewFactory: <any>{},
      UserListService: <any>{},
      $q: <any>{},
      $rootScope: <any>{},
      $timeout: <any>{},
      $translate: <any>{},
    };
  }

  class TestImplementation extends BaseExternalLinkedAccountUniqueSafe {
    constructor(options: IBaseExternalLinkedAccountUniqueSafeOptions) {
      super(options,
        state.CsdmFilteredViewFactory,
        state.UserListService,
        state.$q,
        state.$timeout,
        state.$translate);
    }
  }

  const getFilteredPlaceViewMockReturningPlace = function(placeResponse) {
    return {
      setFilters: () => {},
      setSearchTimeout: () => {},
      setCurrentFilterValue: () => {},
      refresh: () => {},
      setCurrentSearch: () => {
        return state.$q.resolve(placeResponse);
      },
    };
  };

  afterEach(() => {
    state.$rootScope.$digest();
    state = defaultState();
  });

  beforeEach(inject((_CsdmFilteredViewFactory_, _UserListService_, _$q_, _$rootScope_,  _$timeout_, _$translate_) => {
    state = { CsdmFilteredViewFactory: _CsdmFilteredViewFactory_, UserListService: _UserListService_, $q: _$q_, $rootScope: _$rootScope_, $timeout: _$timeout_, $translate: _$translate_ };
  }));

  describe('options are used to choose error messages', () => {
    it('"nullAccountMessageKey" is used when accountGUID is null', () => {
      const testMessage = 'this is shown when accountGUID is null';
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: testMessage,
        conflictWithUserEmailMessageKey: 'failure',
        conflictWithExternalLinkedAccountMessageKey: 'failure',
      });

      testImplementation.validate(undefined, '');

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(testImplementation.currentValidationMessage).toBe(testMessage);
    });

    it('"conflictWithUserEmailMessageKey" is used when a conflicting user is found', () => {
      const testMessage = 'this is shown when a conflicting user is found';
      const testGUID = 'conflict@example.org';
      const userResponse = { data: { Resources: [ { userName: testGUID } ] } };
      spyOn(state.UserListService, 'listUsersAsPromise').and.returnValue(state.$q.resolve(userResponse));
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: 'failure',
        conflictWithUserEmailMessageKey: testMessage,
        conflictWithExternalLinkedAccountMessageKey: 'failure',
      });

      testImplementation.validate(testGUID, '');

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(testImplementation.currentValidationMessage).toBe(testMessage);
    });

    it('"conflictWithUserEmailMessageKey" is used when a conflicting place is found', () => {
      const testMessage = 'this is shown when a conflicting place is found';
      const testGUID = 'conflict@example.org';
      const testExtLinkedAcctType = 'hybrid_something_or_other';
      const placeResponse = [ { externalLinkedAccounts: [ { accountGUID: testGUID, providerID: testExtLinkedAcctType } ] } ];
      const filteredPlaceViewMock = getFilteredPlaceViewMockReturningPlace(placeResponse);
      spyOn(state.UserListService, 'listUsersAsPromise').and.returnValue(state.$q.resolve({}));
      spyOn(state.CsdmFilteredViewFactory, 'createFilteredPlaceView').and.returnValue(filteredPlaceViewMock);
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: 'failure',
        conflictWithUserEmailMessageKey: 'failure',
        conflictWithExternalLinkedAccountMessageKey: testMessage,
      });

      testImplementation.validate(testGUID, testExtLinkedAcctType);

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(testImplementation.currentValidationMessage).toBe(testMessage);
    });
  });

  describe('state changes when problems are found', () => {
    it('Error when accountGUID is null', () => {
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: '',
        conflictWithUserEmailMessageKey: '',
        conflictWithExternalLinkedAccountMessageKey: '',
      });

      testImplementation.validate(undefined, '');

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(testImplementation.currentValidationState).toBe(ValidationState.Error);
    });

    it('Error when a conflicting user is found', () => {
      const testGUID = 'conflict@example.org';
      const userResponse = { data: { Resources: [ { userName: testGUID } ] } };
      spyOn(state.UserListService, 'listUsersAsPromise').and.returnValue(state.$q.resolve(userResponse));
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: '',
        conflictWithUserEmailMessageKey: '',
        conflictWithExternalLinkedAccountMessageKey: '',
      });

      testImplementation.validate(testGUID, '');

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(testImplementation.currentValidationState).toBe(ValidationState.Error);
    });

    it('Error when a conflicting place is found', () => {
      const testGUID = 'conflict@example.org';
      const testExtLinkedAcctType = 'hybrid_something_or_other';
      const placeResponse = [ { externalLinkedAccounts: [ { accountGUID: testGUID, providerID: testExtLinkedAcctType } ] } ];
      const filteredPlaceViewMock = getFilteredPlaceViewMockReturningPlace(placeResponse);
      spyOn(state.UserListService, 'listUsersAsPromise').and.returnValue(state.$q.resolve({}));
      spyOn(state.CsdmFilteredViewFactory, 'createFilteredPlaceView').and.returnValue(filteredPlaceViewMock);
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: '',
        conflictWithUserEmailMessageKey: '',
        conflictWithExternalLinkedAccountMessageKey: '',
      });

      testImplementation.validate(testGUID, testExtLinkedAcctType);

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(testImplementation.currentValidationState).toBe(ValidationState.Error);
    });

    it('Success when no conflicts are found', () => {
      const testGUID = 'conflict@example.org';
      const filteredPlaceViewMock = getFilteredPlaceViewMockReturningPlace({});
      spyOn(state.UserListService, 'listUsersAsPromise').and.returnValue(state.$q.resolve({}));
      spyOn(state.CsdmFilteredViewFactory, 'createFilteredPlaceView').and.returnValue(filteredPlaceViewMock);
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: '',
        conflictWithUserEmailMessageKey: '',
        conflictWithExternalLinkedAccountMessageKey: '',
      });

      testImplementation.validate(testGUID, '');

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(testImplementation.currentValidationState).toBe(ValidationState.Success);
    });
  });

  describe('timeout before validating', () => {
    it('isValidating should be true during validation', () => {
      const testGUID = 'conflict@example.org';
      const filteredPlaceViewMock = getFilteredPlaceViewMockReturningPlace({});
      spyOn(state.UserListService, 'listUsersAsPromise').and.returnValue(state.$q.resolve({}));
      spyOn(state.CsdmFilteredViewFactory, 'createFilteredPlaceView').and.returnValue(filteredPlaceViewMock);
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: '',
        conflictWithUserEmailMessageKey: '',
        conflictWithExternalLinkedAccountMessageKey: '',
      });

      testImplementation.validate(testGUID, '');

      expect(testImplementation.isValidating).toBe(true);

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(testImplementation.isValidating).toBe(false);
    });

    it('Multiple validate calls shortly after each other should only validate once', () => {
      const testGUID = 'conflict@example.org';
      const filteredPlaceViewMock = getFilteredPlaceViewMockReturningPlace({});
      spyOn(state.UserListService, 'listUsersAsPromise').and.returnValue(state.$q.resolve({}));
      spyOn(state.CsdmFilteredViewFactory, 'createFilteredPlaceView').and.returnValue(filteredPlaceViewMock);
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: '',
        conflictWithUserEmailMessageKey: '',
        conflictWithExternalLinkedAccountMessageKey: '',
      });

      testImplementation.validate(testGUID, '');
      testImplementation.validate(testGUID, '');

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(state.UserListService.listUsersAsPromise).toHaveBeenCalledTimes(1);
    });

    it('Multiple validate calls after timeout should validate again', () => {
      const testGUID = 'conflict@example.org';
      const filteredPlaceViewMock = getFilteredPlaceViewMockReturningPlace({});
      spyOn(state.UserListService, 'listUsersAsPromise').and.returnValue(state.$q.resolve({}));
      spyOn(state.CsdmFilteredViewFactory, 'createFilteredPlaceView').and.returnValue(filteredPlaceViewMock);
      const testImplementation = new TestImplementation({
        nullAccountMessageKey: '',
        conflictWithUserEmailMessageKey: '',
        conflictWithExternalLinkedAccountMessageKey: '',
      });

      testImplementation.validate(testGUID, '');

      state.$timeout.flush();
      state.$rootScope.$digest();

      testImplementation.validate(testGUID, '');

      state.$timeout.flush();
      state.$rootScope.$digest();

      expect(state.UserListService.listUsersAsPromise).toHaveBeenCalledTimes(2);
    });
  });
});
