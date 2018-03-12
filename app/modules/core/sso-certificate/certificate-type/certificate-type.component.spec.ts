import ssoCertificateModuleName from '../index';
import { CertificateTypeController } from './certificate-type.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { CertificateType } from '../sso-certificate.constants';

type Test = atlas.test.IComponentTest<CertificateTypeController, {}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
  };
}>;

describe('Component: certificateType:', () => {
  const DIALOG_CONTENT = '.sso-certificate-content-certificate-type';
  const CONTENT_RADIO = '.sso-certificate-content__radio';
  const CONTENT_ACTION1 = '.sso-certificate-content__paragraph-action1';
  const CONTENT_ACTION2 = '.sso-certificate-content__paragraph-action2';

  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      ssoCertificateModuleName,
      this.components.multiStepModal,
    );
    this.injectDependencies(
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

    it('should show dialog content', function (this: Test) {
      expect(this.view.find(DIALOG_CONTENT)).toExist();
    });

    it('should show radio boxes', function (this: Test) {
      expect(this.view.find(CONTENT_RADIO)).toExist();
    });

    it('should not show action text', function (this: Test) {
      expect(this.view.find(CONTENT_ACTION1)).not.toExist();
      expect(this.view.find(CONTENT_ACTION2)).not.toExist();
    });

    it('should show the Next button as disabled', function (this: Test) {
      expect(this.controller.nextDisabled).toBeTruthy();
    });
  });

  describe('component behavior', () => {
    beforeEach(initComponent);

    it('should show the Next button when MULTIPLE type radio box is chosen', function (this: Test) {
      this.controller.certificateTypeValue = CertificateType.MULTIPLE;
      this.controller.onCertificateTypeValueChanged();
      this.$scope.$apply();

      expect(this.controller.nextDisabled).toBeFalsy();
      expect(this.view.find(CONTENT_ACTION1)).not.toExist();
      expect(this.view.find(CONTENT_ACTION2)).not.toExist();
    });

    it('should also show the Next button when SINGLE type radio box is chosen', function (this: Test) {
      this.controller.certificateTypeValue = CertificateType.SINGLE;
      this.controller.onCertificateTypeValueChanged();
      this.$scope.$apply();

      expect(this.controller.nextDisabled).toBeFalsy();
      expect(this.view.find(CONTENT_ACTION1)).toExist();
      expect(this.view.find(CONTENT_ACTION2)).toExist();
    });
  });
});
