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

  function initComponent(transcludeContent = '', extraBindings = '') {
    this.compileTemplate(`
      <assignable-license-checkbox
        ${extraBindings}
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

    it('should initialize its entry "isSelected" and "isDisabled" values according to input bindings', function () {
      const emptyTranscludeContent = '';
      this.$scope.isSelected = true;
      this.$scope.isDisabled = true;
      const additionalBindingsString = 'is-selected="isSelected" is-disabled="isDisabled"';
      initComponent.call(this, emptyTranscludeContent, additionalBindingsString);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isSelected).toBe(true);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled).toBe(true);
      delete this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'];

      this.$scope.isSelected = false;
      this.$scope.isDisabled = true;
      initComponent.call(this, emptyTranscludeContent, additionalBindingsString);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isSelected).toBe(false);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled).toBe(true);
      delete this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'];

      this.$scope.isSelected = false;
      this.$scope.isDisabled = false;
      initComponent.call(this, emptyTranscludeContent, additionalBindingsString);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isSelected).toBe(false);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled).toBe(false);
    });

    it('should ignore "isSelected" and "isDisabled" input bindings if corresponding entry data already exists', function () {
      initComponent.call(this);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isSelected).toBe(false);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled).toBe(false);

      // manually set entry data
      this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isSelected = true;
      this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled = true;

      // attempt to set both input bindings to "false"
      this.$scope.isSelected = false;
      this.$scope.isDisabled = false;
      const emptyTranscludeContent = '';
      const additionalBindingsString = 'is-selected="isSelected" is-disabled="isDisabled"';
      initComponent.call(this, emptyTranscludeContent, additionalBindingsString);

      // entry data already existed for this license, so entry data values override input binding values
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isSelected).toBe(true);
      expect(this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled).toBe(true);
    });

    describe('isSelectedLicense():', () => {
      it('should return value from its entry in "autoAssignTemplateData"', function () {
        initComponent.call(this);
        expect(this.controller.isSelectedLicense()).toBe(false);
        this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isSelected = true;
        expect(this.controller.isSelectedLicense()).toBe(true);
      });
    });

    describe('isDisabledLicense():', () => {
      it('should return value from its entry in "autoAssignTemplateData", combined with "isLicenseStatusOk()", and "hasVolume()"', function () {
        initComponent.call(this);
        spyOn(this.controller, 'isLicenseStatusOk').and.returnValue(true);
        spyOn(this.controller, 'hasVolume').and.returnValue(true);
        expect(this.controller.isDisabledLicense()).toBe(false);

        // 'isDisabled' in 'autoAssignTemplateData' entry is true
        this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled = true;
        expect(this.controller.isDisabledLicense()).toBe(true);

        // reset 'isDisabled', 'isLicenseStatusOk()' is false
        this.$scope.autoAssignTemplateData.viewData.LICENSE['fake-licenseId'].isDisabled = false;
        this.controller.isLicenseStatusOk.and.returnValue(false);
        expect(this.controller.isDisabledLicense()).toBe(true);

        // reset 'isLicenseStatusOk()', 'hasVolume()' is false
        this.controller.isLicenseStatusOk.and.returnValue(true);
        this.controller.hasVolume.and.returnValue(false);
        expect(this.controller.isDisabledLicense()).toBe(true);
      });
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
