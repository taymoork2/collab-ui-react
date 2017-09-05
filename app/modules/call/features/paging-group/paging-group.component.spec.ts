import pagingGroupModule from './index';

describe('Component: ucPagingGroup', () => {
  const NAME_INPUT = 'input[name="editCallFeatureName"]';
  const SAVE_BUTTON = 'button.btn.btn--primary.ng-isolate-scope';
  const CANCEL_BUTTON = 'button[name="pgCancelButton"]';

  const pg = getJSONFixture('huron/json/features/pagingGroup/pgWithMembersAndInitiators.json');
  const pgUpdated = getJSONFixture('huron/json/features/pagingGroup/pgUpdated.json');
  const invalidName = 'Invalid &<>';

  const pagingServiceFailureResp = {
    data: 'Internal Server Error',
    status: 500,
    statusText: 'Internal Server Error',
  };

  const internalNumberOptions: string[] = ['1000', '1001', '1002'];

  beforeEach(function () {
    this.initModules(pagingGroupModule);
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      '$stateParams',
      'Notification',
      'Authinfo',
      'PagingGroupSettingsService',
      'PagingNumberService',
    );

    this.pg = pg;

    // this.$scope.pgId = pg.groupId;
    spyOn(this.Authinfo, 'getOrgId').and.returnValue('12345');
    spyOn(this.$state, 'go');
    spyOn(this.Notification, 'success');
    spyOn(this.Notification, 'errorWithTrackingId');

    this.getPagingGroupDefer = this.$q.defer();
    spyOn(this.PagingGroupSettingsService, 'get').and.returnValue(this.getPagingGroupDefer.promise);

    this.updatePagingGroupDefer = this.$q.defer();
    spyOn(this.PagingGroupSettingsService, 'savePagingGroup').and.returnValue(this.updatePagingGroupDefer.promise);

    this.getNumbersDefer = this.$q.defer();
    spyOn(this.PagingNumberService, 'getInternalNumbers').and.returnValue(this.getNumbersDefer.promise);

    this.getNumberExtensionDefer = this.$q.defer();
    spyOn(this.PagingNumberService, 'getNumberExtension').and.returnValue(this.getNumberExtensionDefer.promise);
  });

  function initComponent() {
    this.$stateParams.feature = {
      id: this.pg.groupId,
    };
    this.compileComponent('ucPagingGroup', {});
  }

  describe('onInit ', () => {
    beforeEach(initComponent);

    it('should initialize all the Paging Group data', function () {
      this.getNumbersDefer.resolve(internalNumberOptions);
      this.getPagingGroupDefer.resolve(pg);
      expect(this.controller.isLoading).toBeTruthy();
      this.$scope.$apply();
      expect(this.PagingGroupSettingsService.get).toHaveBeenCalledWith(this.pg.groupId);
      expect(this.controller.isLoading).toBeFalsy();
    });

    it('should display Notification when getPagingGroup failed', function () {
      this.getNumbersDefer.resolve(internalNumberOptions);
      this.getPagingGroupDefer.reject(pagingServiceFailureResp);
      this.$scope.$apply();
      expect(this.Notification.errorWithTrackingId).toHaveBeenCalledWith(pagingServiceFailureResp, 'pagingGroup.errorUpdate');
    });
  });

  describe('disableSaveForm', () => {
    beforeEach(initComponent);
    it('should disable show Save button', function () {
      this.getNumbersDefer.resolve(internalNumberOptions);
      this.getPagingGroupDefer.resolve(pg);
      this.$scope.$apply();
      this.view.find(NAME_INPUT).val(invalidName).change();
      expect(this.view.find(SAVE_BUTTON)).toBeDisabled();
    });
  });

  describe('saveForm', () => {
    beforeEach(initComponent);
    beforeEach(function () {
      spyOn(this.controller, 'onCancel');
    });
    it('should be able to cancel updatePagingGroup', function () {
      this.getNumbersDefer.resolve(_.cloneDeep(internalNumberOptions));
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg));
      this.$scope.$apply();
      this.view.find(NAME_INPUT).val(pgUpdated.name).change();
      expect(this.view.find(CANCEL_BUTTON)).toExist();
      this.view.find(CANCEL_BUTTON).click();
      expect(this.controller.onCancel).toHaveBeenCalled();
    });

    it('should update PagingGroup', function () {
      this.getNumbersDefer.resolve(_.cloneDeep(internalNumberOptions));
      this.getPagingGroupDefer.resolve(_.cloneDeep(pg));
      this.$scope.$apply();
      this.view.find(NAME_INPUT).val(pgUpdated.name).change();
      this.controller.save();
      expect(this.PagingGroupSettingsService.savePagingGroup).toHaveBeenCalledWith(pgUpdated);
    });
  });

});
