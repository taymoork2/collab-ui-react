import certificateTypeModuleName from './index';
import { CertificateTypeController } from './certificate-type.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';

type Test = atlas.test.IComponentTest<CertificateTypeController, {}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
  };
}>;

describe('Component: certificateType:', () => {
  const CONTENT_RADIO = '.content__radio';

  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      certificateTypeModuleName,
      this.components.multiStepModal,
    );
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  function initComponent(this: Test) {
    this.compileComponent('certificateType', {});
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

    it('should not show the Next button', function (this: Test) {
      expect(this.controller['nextRemoved']).toBeTruthy();
    });
  });

  describe('component behavior', () => {
    beforeEach(initComponent);

    it('should show the Next button when MULTIPLE type radio box is chosen', function (this: Test) {
      this.controller['onCertificateTypeChanged']('MULTIPLE');
      this.$scope.$apply();

      expect(this.controller['nextRemoved']).toBeFalsy();
    });

    it('should also show the Next button when SINGLE type radio box is chosen', function (this: Test) {
      this.controller['onCertificateTypeChanged']('SINGLE');
      this.$scope.$apply();

      expect(this.controller['nextRemoved']).toBeFalsy();
    });
  });
});
