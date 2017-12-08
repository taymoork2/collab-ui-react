import moduleName from './index';

import { LicenseStatus } from 'modules/core/users/userAdd/assignable-services/shared';

describe('Component: assignableItemCheckbox:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.fakeLicense = {
      licenseId: 'fake-licenseId',
      status: LicenseStatus.ACTIVE,
      usage: 3,
      volume: 5,
    };
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.$scope.stateData = {};
  });

  function initComponent(_transcludeContent) {
    const transcludeContent = _transcludeContent || '';
    this.compileTemplate(`
      <assignable-item-checkbox
        license="fakeLicense"
        l10n-label="fake-label"
        on-update="onUpdate()"
        state-data="stateData">
        ${transcludeContent}
      </assignable-item-checkbox>`);
    this.controller = this.view.controller('assignableItemCheckbox');
  }

  describe('primary behaviors (view):', () => {
    it('should render an input[cs-input][type="checkbox"]', function () {
      initComponent.call(this);
      expect(this.view.find('input[cs-input][type="checkbox"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][id="fake_licenseId"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][name="fake_licenseId"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][cs-input-label="fake-label"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-model="$ctrl.isSelected"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-disabled="$ctrl.isDisabled"]').length).toBe(1);
      expect(this.view.find('input[cs-input][type="checkbox"][ng-change="$ctrl.recvChange()"]').length).toBe(1);
    });

    it('should transclude its contents', function () {
      initComponent.apply(this, ['<span>fake-contents</span>']);
      expect(this.view.find('.sub-content')).toContainText('fake-contents');
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should initialize an entry in "stateData", if one does not exist yet', function () {
      expect(this.$scope.stateData).toEqual({});
      initComponent.call(this);
      expect(this.$scope.stateData).toEqual({
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

    it('should get and set "isSelected" value as bound in "stateData"', function () {
      initComponent.call(this);
      expect(this.controller.isSelected).toBe(false);
      expect(this.$scope.stateData.LICENSE['fake-licenseId'].isSelected).toBe(false);

      this.$scope.stateData.LICENSE['fake-licenseId'].isSelected = true;
      expect(this.controller.isSelected).toBe(true);

      this.controller.isSelected = false;
      expect(this.$scope.stateData.LICENSE['fake-licenseId'].isSelected).toBe(false);
    });

    it('should set "isDisabled" value in "stateData"', function () {
      initComponent.call(this);
      expect(this.controller.isDisabled).toBe(false);
      expect(this.$scope.stateData.LICENSE['fake-licenseId'].isDisabled).toBe(false);

      this.controller.isDisabled = true;
      expect(this.$scope.stateData.LICENSE['fake-licenseId'].isDisabled).toBe(true);
    });

    it('should get "isDisabled" according to value in "stateData", "isLicenseStatusOk()", and "hasVolume()"', function () {
      initComponent.call(this);
      expect(this.controller.isDisabled).toBe(false);
      expect(this.$scope.stateData.LICENSE['fake-licenseId'].isDisabled).toBe(false);

      spyOn(this.controller, 'isLicenseStatusOk').and.returnValue(false);
      expect(this.controller.isDisabled).toBe(true);

      this.controller.isLicenseStatusOk.and.returnValue(true);
      expect(this.controller.isDisabled).toBe(false);

      spyOn(this.controller, 'hasVolume').and.returnValue(false);
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

    describe('recvChange():', () => {
      it('should call "onUpdate()" output binding function', function () {
        initComponent.call(this);
        this.controller.recvChange();
        expect(this.$scope.onUpdate).toHaveBeenCalled();
      });
    });
  });
});
