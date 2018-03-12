import ssoCertificateModuleName, {
  SsoCertificateService,
} from '../index';
import { TestSsoController } from './test-sso.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { Notification } from 'modules/core/notifications';

type Test = atlas.test.IComponentTest<TestSsoController, {
  Notification: Notification;
  SsoCertificateService: SsoCertificateService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
  };
}>;

describe('Component: testSso:', () => {
  const DIALOG_CONTENT = '.sso-certificate-content-test-sso';
  const CONTENT_BUTTON = '.sso-certificate-content__button';
  const CONTENT_TITLE = '.sso-certificate-content__paragraph-title';
  const CONTENT_ACTION1 = '.sso-certificate-content__paragraph-action1';

  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      ssoCertificateModuleName,
      this.components.multiStepModal,
    );
    this.injectDependencies(
      'Notification',
      'SsoCertificateService',
    );

    spyOn(this.SsoCertificateService, 'downloadIdpMetadata').and.returnValue(this.$q.resolve());
    spyOn(this.SsoCertificateService, 'switchMetadata').and.returnValue(this.$q.resolve());
    spyOn(this.Notification, 'success');
  });

  function initComponent(this: Test) {
    this.compileComponent('testSso', {});
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

    it('should show content title', function (this: Test) {
      expect(this.view.find(CONTENT_TITLE)).toExist();
    });

    it('should show the test SSO button', function (this: Test) {
      expect(this.view.find(CONTENT_BUTTON)).toExist();
      expect(_.size(this.view.find(CONTENT_BUTTON))).toBe(1);
    });

    it('should not show content action1 text', function (this: Test) {
      expect(this.view.find(CONTENT_ACTION1)).not.toExist();
    });
  });

  describe('component behavior when testing SSO', () => {
    beforeEach(initComponent);
    beforeEach(function (this: Test) {
      this.controller.testSso();
      this.$scope.$apply();
    });

    it('should have called function to get the Idp metadata', function (this: Test) {
      expect(this.SsoCertificateService.downloadIdpMetadata).toHaveBeenCalled();
    });

    it('should show content action1 text and the switch certificate button', function (this: Test) {
      this.controller.ssoTested = true;
      this.$scope.$apply();
      expect(this.view.find(CONTENT_ACTION1)).toExist();
      expect(_.size(this.view.find(CONTENT_BUTTON))).toBe(2);
    });
  });

  describe('component behavior when switching metadata', () => {
    beforeEach(initComponent);
    beforeEach(function (this: Test) {
      this.controller.switchMetadata();
      this.$scope.$apply();
    });

    it('should have called function to switch primary certificate', function (this: Test) {
      expect(this.SsoCertificateService.switchMetadata).toHaveBeenCalled();
    });

    it('should send the success notification', function (this: Test) {
      expect(this.Notification.success).toHaveBeenCalledWith('ssoCertificateModal.switchMetadataSuccess');
    });
  });
});
