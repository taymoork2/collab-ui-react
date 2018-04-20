import companyVoicemailAvrilModule from './index';
import { AvrilSiteFeatures } from 'modules/call/avril';

describe('Component: companyVoicemailAvril', () => {
  const VOICEMAIL_TOGGLE = 'input#companyVoicemailToggle';
  const EXTERNAL_VM_CHECKBOX = 'input#externalVoicemailAccess';
  const VOICEMAIL_TO_EMAIL_CHECKBOX = 'input#voicemailToEmail';
  const WITH_ATTACHMENT_RADIO = 'input#withAttachment';
  const WITHOUT_ATTACHMENT_RADIO = 'input#withoutAttachment';
  const COMPANY_NUMBER_SELECT = '.csSelect-container[name="companyVoicemailNumber"]';
  const MESSAGE_CONTAINER = '.msg-container';
  const NO_EXTERNAL_NUMBER_WARNING = COMPANY_NUMBER_SELECT + ' ' + MESSAGE_CONTAINER;
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const GENERATED_VM_PILOT_NUMBER = '+150708071004091414081311041300051000081';
  const externalNumberOptions = getJSONFixture('huron/json/settings/externalNumbersOptions.json');
  const USE_TLS_CHECKBOX = 'input#useTLS';
  const ENABLE_OTP_CHECKBOX = 'input#enableOTP';
  const avrilFeatures = new AvrilSiteFeatures({
    VM2E: false,
    VM2E_PT: false,
    VMOTP: true,
    VM2E_TLS: true,
    VM2T: false,
    VM2E_Transcript: false,
    VM2S: false,
    VM2S_Attachment: false,
    VM2S_Transcript: false,
  });
  beforeEach(function() {
    this.initModules(companyVoicemailAvrilModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
      'PhoneNumberService',
      'ServiceSetup',
      'FeatureToggleService',
      '$q',
      'Authinfo',
    );

    spyOn(this.Authinfo, 'isMessageEntitled').and.returnValue(true);
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    spyOn(this.ServiceSetup, 'generateVoiceMailNumber').and.returnValue(GENERATED_VM_PILOT_NUMBER);
    spyOn(this.FeatureToggleService, 'avrilI1558GetStatus').and.returnValue(this.$q.resolve(true));

    this.compileComponent('ucCompanyVoicemailAvril', {
      site: 'site',
      features: 'features',
      dialPlanCountryCode: 'dialPlanCountryCode',
      externalNumberOptions: 'externalNumberOptions',
      companyVoicemailEnabled: 'companyVoicemailEnabled',
      onNumberFilter: 'onNumberFilter(filter)',
      onChangeFn: 'onChangeFn(voicemailPilotNumber, voicemailPilotNumberGenerated, companyVoicemailEnabled, features)',
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
      expect(this.view).not.toContainElement(EXTERNAL_VM_CHECKBOX);
      expect(this.view).not.toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
    });
  });

  describe('Enable Voicemail: with 0 external numbers available', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = [];
      this.$scope.$apply();
    });

    it('should call onChangeFn when voicemail is toggled', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      avrilFeatures.VM2E_TLS = false;
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures);
    });

    it('should have External Voicemail Access and Voicemail to Email checkboxes when voicemail is toggled on', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
      expect(this.view).toContainElement(ENABLE_OTP_CHECKBOX);
    });

    it('should have an empty drop down list of numbers and display warning text when External Voicemail Access is checked.', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      this.view.find(EXTERNAL_VM_CHECKBOX).click();
      expect(this.view).toContainElement(COMPANY_NUMBER_SELECT);
      expect(this.view).toContainElement(NO_EXTERNAL_NUMBER_WARNING);
    });
  });

  describe('Enable Voicemail: with 3 external numbers available', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = externalNumberOptions;
      this.$scope.$apply();
    });

    it('should have a drop down list of numbers and display warning text when External Voicemail Access is checked.', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      this.view.find(EXTERNAL_VM_CHECKBOX).click();
      expect(this.view).toContainElement(COMPANY_NUMBER_SELECT);
      expect(this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('(972) 555-1212');
      expect(this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('(972) 555-1313');
      expect(this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('(972) 555-1414');
    });

    it('should call onChangeFn when an external number is chosen', function() {
      avrilFeatures.VM2E_TLS = false;
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      this.view.find(EXTERNAL_VM_CHECKBOX).click();
      this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn.calls.argsFor(2)).toEqual(['+19725551212', 'false', true, avrilFeatures]);
    });
  });

  describe('Enable Voicemail: enable Voicemail to Email', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = [];
      this.$scope.$apply();
    });

    it('should show Email Attachment radios, use TLS checkbox and call onChangeFn when Voicemail to Email is checked', function() {
      avrilFeatures.VM2E = true;
      avrilFeatures.VM2E_PT = false;
      avrilFeatures.VM2E_TLS = true;
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
      this.view.find(VOICEMAIL_TO_EMAIL_CHECKBOX).click();
      expect(this.view).toContainElement(WITH_ATTACHMENT_RADIO);
      expect(this.view.find(WITH_ATTACHMENT_RADIO)).toBeChecked();
      expect(this.view).toContainElement(WITHOUT_ATTACHMENT_RADIO);
      expect(this.view).toContainElement(USE_TLS_CHECKBOX);
      expect(this.view.find(USE_TLS_CHECKBOX)).toBeChecked();
      this.view.find(WITHOUT_ATTACHMENT_RADIO).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures);
    });

    it('should call onChangeFn when Email Notification without Attachment is checked', function() {
      avrilFeatures.VM2E = false;
      avrilFeatures.VM2E_PT = true;
      avrilFeatures.VM2E_TLS = true;
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
      this.view.find(VOICEMAIL_TO_EMAIL_CHECKBOX).click();
      expect(this.view).toContainElement(WITH_ATTACHMENT_RADIO);
      expect(this.view.find(WITH_ATTACHMENT_RADIO)).toBeChecked();
      expect(this.view).toContainElement(WITHOUT_ATTACHMENT_RADIO);
      this.view.find(WITHOUT_ATTACHMENT_RADIO).click().click();
      expect(this.view.find(WITHOUT_ATTACHMENT_RADIO)).toBeChecked();
      expect(this.$scope.onChangeFn.calls.argsFor(1)).toEqual([GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures]);
    });

    it('should call onChangeFn when use TLS is unchecked', function() {
      avrilFeatures.VM2E = true;
      avrilFeatures.VM2E_TLS = false;
      avrilFeatures.VM2E_PT = false,
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
      expect(this.$scope.onChangeFn.calls.argsFor(1)).toEqual([GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures]);
    });
  });

  describe('Voicemail Enabled: check Enable OTP', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = [];
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
      this.$scope.externalNumberOptions = externalNumberOptions;
      this.$scope.companyVoicemailEnabled = true;
      this.$scope.$apply();
    });

    it('should have a toggle switch in the on position', function() {
      expect(this.view.find(VOICEMAIL_TOGGLE)).toBeChecked();
    });

    it('should call onChangeFn when voicemail is turned off', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(null, null, false, undefined);
    });
  });
});
