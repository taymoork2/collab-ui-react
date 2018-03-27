import ssoCertificateCheckModuleName from './index';
import { SsoCertificateService } from 'modules/core/sso-certificate/shared/index';
import { SsoCertificateCheckController } from './sso-certificate-check.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { CertificateCheck } from 'modules/core/sso-certificate/shared/sso-certificate.constants';

type Test = atlas.test.IComponentTest<SsoCertificateCheckController, {
  SsoCertificateService: SsoCertificateService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
  };
}>;

describe('Component: checkCertificate:', () => {
  const DIALOG_CONTENT = '.sso-certificate-content-check';
  const CONTENT_RADIO = '.sso-certificate-content__radio';
  const CONTENT_ACTION1 = '.sso-certificate-content__paragraph-action1';

  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      ssoCertificateCheckModuleName,
      this.components.multiStepModal,
    );
    this.injectDependencies(
      'SsoCertificateService',
    );

    spyOn(this.SsoCertificateService, 'getAllCiCertificates').and.returnValue(this.$q.resolve());
  });

  function initComponent(this: Test) {
    this.compileComponent('ssoCertificateCheck', {});
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

    it('should not show action1 text', function (this: Test) {
      expect(this.view.find(CONTENT_ACTION1)).not.toExist();
    });

    it('should show the Next button as disabled', function (this: Test) {
      expect(this.controller.nextDisabled).toBeTruthy();
    });

    it('should not show the Submit button', function (this: Test) {
      expect(this.controller.submitRemoved).toBeTruthy();
    });
  });

  describe('component behavior', () => {
    beforeEach(initComponent);

    it('should have called function to add the latest certificate to the org', function (this: Test) {
      expect(this.SsoCertificateService.getAllCiCertificates).toHaveBeenCalled();
    });

    it('should show the Next button as enabled when SIGNING type radio box is chosen', function (this: Test) {
      this.controller.certificateCheckValue = CertificateCheck.SIGNING;
      this.controller.onCertificateCheckValueChanged();
      this.$scope.$apply();

      expect(this.controller.nextDisabled).toBeFalsy();
      expect(this.controller.submitRemoved).toBeTruthy();
      expect(this.view.find(CONTENT_ACTION1)).toExist();
    });

    it('should show the Next button as disabled when NONE type radio box is chosen', function (this: Test) {
      this.controller.certificateCheckValue = CertificateCheck.NONE;
      this.controller.onCertificateCheckValueChanged();
      this.$scope.$apply();

      expect(this.controller.nextDisabled).toBeTruthy();
      expect(this.controller.submitRemoved).toBeFalsy();
      expect(this.view.find(CONTENT_ACTION1)).toExist();
    });
  });
});
