import moduleName from './index';

import { LicenseStatus } from 'modules/core/users/userAdd/assignable-services/shared';

describe('Component: assignableLicenseCheckbox:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
  });

  beforeEach(function () {
    this.$scope.fakeLicense = {
      licenseId: 'fake-licenseId',
      status: LicenseStatus.ACTIVE,
      usage: 3,
      volume: 5,
    };
    this.$scope.fakeLabel = 'fakeLabel';
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.$scope.autoAssignTemplateData = {};
  });

  function initComponent(_transcludeContent) {
    const transcludeContent = _transcludeContent || '';
    this.compileTemplate(`
      <assignable-license-checkbox
        license="fakeLicense"
        l10n-label="fake-label"
        on-update="onUpdate()"
        auto-assign-template-data="autoAssignTemplateData">
        ${transcludeContent}
      </assignable-license-checkbox>`);
    this.controller = this.view.controller('assignableLicenseCheckbox');
  }

  describe('primary behaviors (view):', () => {
    it('should render a checkbox, named license label, and a usage line by default', function () {
      initComponent.call(this);
      expect(this.view.find('cr-checkbox-item[ng-if="$ctrl.license"]').length).toBe(1);
      expect(this.view.find('cr-checkbox-item div[translate="firstTimeWizard.namedLicense"]').length).toBe(1);
      expect(this.view.find('cr-checkbox-item usage-line').length).toBe(1);
    });

    it('should render a checkbox with transcluded contents if provided', function () {
      initComponent.call(this, '<span>fake-contents</span>');
      expect(this.view.find('cr-checkbox-item div[ng-transclude] span')).toContainText('fake-contents');
      expect(this.view.find('cr-checkbox-item div[translate="firstTimeWizard.namedLicense"]').length).toBe(0);
      expect(this.view.find('cr-checkbox-item usage-line').length).toBe(0);
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should expose license "usage" and "volume" properties', function () {
      initComponent.call(this);
      expect(this.controller.getTotalLicenseUsage()).toBe(3);
      expect(this.controller.getTotalLicenseVolume()).toBe(5);
    });

    it('should initialize an entry in "autoAssignTemplateData", if one does not exist yet', function () {
      expect(this.$scope.autoAssignTemplateData).toEqual({});
      initComponent.call(this);
      expect(this.$scope.autoAssignTemplateData.viewData).toEqual({
        LICENSE: {
          'fake-licenseId': {
            isSelected: false,
            isDisabled: false,
            license: {
              licenseId: 'fake-licenseId',
              status: 'ACTIVE',
              usage: 3,
              volume: 5,
            },
          },
        },
      });
    });

    it('should get "isSelected" according to value in "autoAssignTemplateData"', function () {
      initComponent.call(this);
      expect(this.controller.isSelected).toBe(false);
      this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isSelected = true;
      expect(this.controller.isSelected).toBe(true);
    });

    it('should get "isDisabled" according to value in "autoAssignTemplateData", "isLicenseStatusOk()", and "hasVolume()"', function () {
      initComponent.call(this);
      spyOn(this.controller, 'isLicenseStatusOk').and.returnValue(true);
      spyOn(this.controller, 'hasVolume').and.returnValue(true);
      expect(this.controller.isDisabled).toBe(false);

      // 'isDisabled' in 'autoAssignTemplateData' entry is true
      this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled = true;
      expect(this.controller.isDisabled).toBe(true);

      // reset 'isDisabled', 'isLicenseStatusOk()' is false
      this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled = false;
      this.controller.isLicenseStatusOk.and.returnValue(false);
      expect(this.controller.isDisabled).toBe(true);

      // reset 'isLicenseStatusOk()', 'hasVolume()' is false
      this.controller.isLicenseStatusOk.and.returnValue(true);
      this.controller.hasVolume.and.returnValue(false);
      expect(this.controller.isDisabled).toBe(true);
    });

    describe('isLicenseStatusOk():', () => {
      it('should be true if license status is either "ACTIVE" or "PENDING", false otherwise', function () {
        initComponent.call(this);
        expect(this.controller.isLicenseStatusOk()).toBe(true);
        this.controller.license.status = LicenseStatus.PENDING;
        expect(this.controller.isLicenseStatusOk()).toBe(true);
        this.controller.license.status = LicenseStatus.DISABLED;
        expect(this.controller.isLicenseStatusOk()).toBe(false);
      });
    });

    describe('hasVolume():', () => {
      it('should be true if volume is a positive number, false otherwise', function () {
        initComponent.call(this);
        expect(this.controller.hasVolume()).toBe(true);
        this.controller.license.volume = 0;
        expect(this.controller.hasVolume()).toBe(false);
      });
    });
  });
});
