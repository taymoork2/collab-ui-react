import moduleName from './index';

describe('Component: assignableLicenseCheckbox:', () => {
  beforeEach(function() {
    this.initModules(moduleName);
    this.injectDependencies(
      '$scope',
    );
  });

  beforeEach(function () {
    this.$scope.fakeLicense = {
      usage: 3,
      volume: 5,
    };
    this.$scope.fakeLabel = 'fakeLabel';
    this.$scope.onUpdate = jasmine.createSpy('onUpdate');
    this.$scope.stateData = {};
    this.compileComponent('assignableLicenseCheckbox', {
      license: 'fakeLicense',
    });
  });

  describe('primary behaviors (view):', () => {
    it('should render a checkbox, named license label, and a usage line', function () {
      expect(this.view.find('assignable-item-checkbox[ng-if="$ctrl.license"]').length).toBe(1);
      expect(this.view.find('assignable-item-checkbox > div[translate="firstTimeWizard.namedLicense"]').length).toBe(1);
      expect(this.view.find('assignable-item-checkbox > usage-line').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {
    it('should expose license "usage" and "volume" properties', function () {
      expect(this.controller.getTotalLicenseUsage()).toBe(3);
      expect(this.controller.getTotalLicenseVolume()).toBe(5);
    });
  });
});
