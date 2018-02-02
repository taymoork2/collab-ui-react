import moduleName from './index';
import { IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';

describe('Component: assignableUserEntitlementCheckbox:', () => {
  beforeEach(function (this) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.isSelected = false;
    this.$scope.isDisabled = false;
    this.$scope.fakeItemId = 'fake-itemId';
    this.$scope.onUpdateSpy = jasmine.createSpy('onUpdateSpy');
    this.$scope.fakeAutoAssignTemplateData = {} as IAutoAssignTemplateData;
    _.set(this.$scope.fakeAutoAssignTemplateData, 'viewData.USER_ENTITLEMENT', {});
  });

  beforeEach(function (this) {
    this.compileTemplate(`
      <assignable-user-entitlement-checkbox
        item-id="fakeItemId"
        l10n-label="fake-l10n-label"
        on-update="onUpdateSpy($event)"
        auto-assign-template-data="fakeAutoAssignTemplateData"
        >
      </assignable-license-checkbox>`);
    this.controller = this.view.controller('assignableUserEntitlementCheckbox');
  });

  describe('primary behaviors (view):', () => {
    it('should render a cr-checkbox-item', function () {
      expect(this.view.find('cr-checkbox-item[l10n-label="fake-l10n-label"]')).toExist();
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should set an entry in "autoAssignTemplateData"', function (this) {
      expect(this.controller.entryData).toBe(this.$scope.fakeAutoAssignTemplateData.viewData.USER_ENTITLEMENT['fake-itemId']);
    });

    it('should call output binding when "recvChange()" is called', function (this) {
      this.controller.recvChange({
        item: {
          isSelected: true,
          isDisabled: true,
        },
      });
      expect(this.$scope.onUpdateSpy).toHaveBeenCalledWith({
        itemId: 'fake-itemId',
        itemCategory: 'USER_ENTITLEMENT',
        item: {
          isSelected: true,
          isDisabled: true,
        },
      });
    });
  });
});
