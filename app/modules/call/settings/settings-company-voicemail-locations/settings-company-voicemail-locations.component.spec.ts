import locationCompanyVoicemail from './index';
import { AvrilCustomerFeatures } from 'modules/huron/avril';

describe('Component: locationCompanyVoicemail', () => {
  const VOICEMAIL_TOGGLE = 'input#companyVoicemailToggle';
  const VOICEMAIL_TO_EMAIL_CHECKBOX = 'input#voicemailToEmail';
  const WITH_ATTACHMENT_RADIO = 'input#withAttachment';
  const WITHOUT_ATTACHMENT_RADIO = 'input#withoutAttachment';
  const USE_TLS_CHECKBOX = 'input#useTLS';
  const ENABLE_OTP_CHECKBOX = 'input#enableOTP';

  beforeEach(function() {
    this.initModules(locationCompanyVoicemail);
    this.injectDependencies(
      '$scope',
      'Authinfo',
      'FeatureToggleService',
      '$q',
    );

    spyOn(this.Authinfo, 'isMessageEntitled').and.returnValue(true);
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    spyOn(this.FeatureToggleService, 'avrilI1558GetStatus').and.returnValue(this.$q.resolve(true));

    this.compileComponent('ucLocationCompanyVoicemail', {
      ftsw: 'ftsw',
      features: 'features',
      companyVoicemailEnabled: 'companyVoicemailEnabled',
      onChangeFn: 'onChangeFn(companyVoicemailEnabled, features)',
    });

  });

  describe('Initial state: Voicemail disabled', () => {
    it('should have a toggle switch', function() {
      expect(this.view).toContainElement(VOICEMAIL_TOGGLE);
    });

    it('should have a toggle switch in the off position', function() {
      expect(this.view.find(VOICEMAIL_TOGGLE)).not.toBeChecked();
    });

    it('should not have External Voicemail Access and Voicemail to Email checkboxes when voicemail is off', function() {
      expect(this.view).not.toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
    });
  });

  describe('Enable Voicemail: enable Voicemail to Email', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilCustomerFeatures();
      this.$scope.$apply();
    });

    it('should show Email Attachment radios, use TLS checkbox and call onChangeFn when Voicemail to Email is checked', function() {
      const avrilFeatures = new AvrilCustomerFeatures({
        VM2E: true,
        VM2E_Attachment: true,
        VMOTP: true,
        VM2E_TLS: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
      this.view.find(VOICEMAIL_TO_EMAIL_CHECKBOX).click();
      expect(this.view).toContainElement(WITH_ATTACHMENT_RADIO);
      expect(this.view.find(WITH_ATTACHMENT_RADIO)).toBeChecked();
      expect(this.view).toContainElement(WITHOUT_ATTACHMENT_RADIO);
      expect(this.view).toContainElement(USE_TLS_CHECKBOX);
      expect(this.view.find(USE_TLS_CHECKBOX)).toBeChecked();
      this.view.find(WITHOUT_ATTACHMENT_RADIO).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(true, avrilFeatures);
    });

    it('should call onChangeFn when Email Notification without Attachment is checked', function() {
      const avrilFeatures = new AvrilCustomerFeatures({
        VM2E: true,
        VM2E_Attachment: false,
        VMOTP: true,
        VM2E_TLS: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
      this.view.find(VOICEMAIL_TO_EMAIL_CHECKBOX).click();
      expect(this.view).toContainElement(WITH_ATTACHMENT_RADIO);
      expect(this.view.find(WITH_ATTACHMENT_RADIO)).toBeChecked();
      expect(this.view).toContainElement(WITHOUT_ATTACHMENT_RADIO);
      this.view.find(WITHOUT_ATTACHMENT_RADIO).click().click();
      expect(this.view.find(WITHOUT_ATTACHMENT_RADIO)).toBeChecked();
      expect(this.$scope.onChangeFn.calls.argsFor(1)).toEqual([true, avrilFeatures]);
    });

    it('should call onChangeFn when use TLS is unchecked', function() {
      const avrilFeatures = new AvrilCustomerFeatures({
        VM2E: true,
        VM2E_Attachment: true,
        VMOTP: true,
        VM2E_TLS: false,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
      this.view.find(VOICEMAIL_TO_EMAIL_CHECKBOX).click();
      expect(this.view).toContainElement(WITH_ATTACHMENT_RADIO);
      expect(this.view.find(WITH_ATTACHMENT_RADIO)).toBeChecked();
      expect(this.view).toContainElement(WITHOUT_ATTACHMENT_RADIO);
      expect(this.view).toContainElement(USE_TLS_CHECKBOX);
      expect(this.view.find(USE_TLS_CHECKBOX)).toBeChecked();
      this.view.find(USE_TLS_CHECKBOX).click();
      expect(this.view.find(USE_TLS_CHECKBOX)).not.toBeChecked();
      expect(this.$scope.onChangeFn.calls.argsFor(1)).toEqual([true, avrilFeatures]);
    });
  });

  describe('Voicemail Enabled: check Enable OTP', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilCustomerFeatures();
      this.$scope.$apply();
    });

    it('should call onChangeFn when enable OTP is checked', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(ENABLE_OTP_CHECKBOX);
      expect(this.view.find(ENABLE_OTP_CHECKBOX)).toBeChecked();
      this.view.find(ENABLE_OTP_CHECKBOX).click();
      expect(this.view.find(ENABLE_OTP_CHECKBOX)).not.toBeChecked();
    });
  });

  describe('Voicemail Enabled: disable voicemail', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilCustomerFeatures();
      this.$scope.companyVoicemailEnabled = true;
      this.$scope.$apply();
    });

    it('should have a toggle switch in the on position', function() {
      expect(this.view.find(VOICEMAIL_TOGGLE)).toBeChecked();
    });

    it('should call onChangeFn when voicemail is turned off', function() {
      const avrilFeatures = new AvrilCustomerFeatures({
        VM2E: false,
        VM2E_Attachment: false,
        VMOTP: true,
        VM2E_TLS: true,
      });
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(false, avrilFeatures);
    });
  });
});
