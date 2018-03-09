import checkCertificateModuleName from './index';
import { CheckCertificateController } from './check-certificate.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';

type Test = atlas.test.IComponentTest<CheckCertificateController, {}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
  };
}>;

describe('Component: checkCertificate:', () => {
  const CONTENT_RADIO = '.content__radio';

  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      checkCertificateModuleName,
      this.components.multiStepModal,
    );
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  function initComponent(this: Test) {
    this.compileComponent('checkCertificate', {});
  }

  describe('initial state', () => {
    beforeEach(initComponent);
    it('should have title and dismiss functionality', function (this: Test) {
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('ssoCertificateModal.updateCertificate');

      spyOn(this.controller, 'dismiss');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.controller.dismiss).toHaveBeenCalled();
    });

    it('should show radio boxes', function (this: Test) {
      expect(this.view.find(CONTENT_RADIO)).toExist();
    });

    it('should show the Next button as disabled', function (this: Test) {
      expect(this.controller['nextRemoved']).toBeFalsy();
      expect(this.controller['nextDisabled']).toBeTruthy();
    });

    it('should not show the Submit button', function (this: Test) {
      expect(this.controller['submitRemoved']).toBeTruthy();
    });
  });

  describe('component behavior', () => {
    beforeEach(initComponent);

    it('should show the Next button when SIGNING type radio box is chosen', function (this: Test) {
      this.controller['onCertificateTypeChanged']('SIGNING');
      this.$scope.$apply();

      expect(this.controller['nextRemoved']).toBeFalsy();
      expect(this.controller['nextDisabled']).toBeFalsy();
      expect(this.controller['submitRemoved']).toBeTruthy();
    });

    it('should not show the Next button when NONE type radio box is chosen', function (this: Test) {
      this.controller['onCertificateTypeChanged']('NONE');
      this.$scope.$apply();

      expect(this.controller['nextRemoved']).toBeTruthy();
      expect(this.controller['submitRemoved']).toBeFalsy();
    });
  });
});
