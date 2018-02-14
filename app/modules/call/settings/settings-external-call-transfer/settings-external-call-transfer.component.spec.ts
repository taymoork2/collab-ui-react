import externalTransferModule from './index';

describe('Component: externalTransfer', () => {
  const EXTERNAL_TRANSFER_TOGGLE = 'input#externalTransferEnabledToggle';

  beforeEach(function () {
    this.initModules(externalTransferModule);
    this.injectDependencies(
      '$scope',
    );
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucExtTransferOrg', {
      allowExternalTransfer: false,
      onChangeFn: 'onChangeFn(allowExternalTransfer)',
    });
  });

  describe('should toggle external transfer switch on click', () => {
    beforeEach(function () {
      this.$scope.allowExternalTransfer = false;
      this.$scope.$apply();
    });

    it('should have a toggle ', function() {
      expect(this.view).toContainElement(EXTERNAL_TRANSFER_TOGGLE);
    });

    it('should have a toggle switch in the off position', function() {
      expect(this.view.find(EXTERNAL_TRANSFER_TOGGLE)).not.toBeChecked();
    });

    it('should call onChangeFn when external transfer is toggled', function() {
      this.view.find(EXTERNAL_TRANSFER_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalled();
      expect(this.$scope.allowExternalTransfer).toBeFalsy();
    });
  });
});
