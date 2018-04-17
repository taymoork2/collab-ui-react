import companyVoicemailAvrilI1559Module from './index';
import { AvrilSiteFeatures } from 'modules/call/avril';

describe('Component: companyVoicemailAvril', () => {
  const VOICEMAIL_TOGGLE = 'input#companyVoicemailToggle';
  const VOICEMAIL_TO_PHONE = 'input#voicemailToPhone';
  const COMPANY_NUMBER_SELECT = '.csSelect-container[name="companyVoicemailNumber"]';
  const MESSAGE_CONTAINER = '.msg-container';
  const NO_EXTERNAL_NUMBER_WARNING = COMPANY_NUMBER_SELECT + ' ' + MESSAGE_CONTAINER;
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const GENERATED_VM_PILOT_NUMBER = '+150708071004091414081311041300051000081';
  const externalNumberOptions = getJSONFixture('huron/json/settings/externalNumbers.json');

  const VOICEMAIL_TO_EMAIL = 'input#voicemailToEmail';
  const VOICEMAIL_TO_EMAIL_WITH_ATTACHMENT = 'input#emailWithAttachment';
  const VOICEMAIL_TO_EMAIL_WITH_TRANSCRIPT = 'input#emailWithTranscript';
  const VOICEMAIL_TO_EMAIL_USE_TLS = 'input#useTLS';

  const VOICEMAIL_TO_SPARK = 'input#voicemailToSpark';
  const VOICEMAIL_TO_SPARK_WITH_ATTACHMENT = 'input#sparkWithAttachment';
  const VOICEMAIL_TO_SPARK_WITH_TRANSCRIPT = 'input#sparkWithTranscript';
  const ENABLE_OTP = 'input#enableOTP';

  const SITES = getJSONFixture('huron/json/settings/sites.json');
  const AVRIL_FEATURES = new AvrilSiteFeatures({
    VM2T: false,
    VM2E: false,
    VM2E_Attachment: false,
    VM2E_Transcript: false,
    VM2E_TLS: false,
    VM2S: true,
    VM2S_Attachment: true,
    VM2S_Transcript: true,
    VMOTP: true,
  });

  beforeEach(function() {
    this.initModules(companyVoicemailAvrilI1559Module);
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
    spyOn(this.FeatureToggleService, 'avrilI1559GetStatus').and.returnValue(this.$q.resolve(true));

    this.compileComponent('ucCompanyVoicemailAvrilI1559', {
      site: 'sites',
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
      expect(this.view).not.toContainElement(VOICEMAIL_TO_PHONE);
      expect(this.view).not.toContainElement(VOICEMAIL_TO_EMAIL);
    });
  });

  describe('Enable Voicemail: with 0 external numbers available', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = [];
      this.$scope.sites = SITES[0];
      this.$scope.$apply();
    });

    it('should call onChangeFn when voicemail is toggled', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true, AVRIL_FEATURES);
    });

    it('should have External Voicemail Access and Voicemail to Email checkboxes when voicemail is toggled on', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_PHONE);
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL);
      expect(this.view).toContainElement(VOICEMAIL_TO_SPARK);
      expect(this.view).toContainElement(ENABLE_OTP);
    });

    it('should have an empty drop down list of numbers and display warning text when External Voicemail Access is checked.', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_PHONE);
      this.view.find(VOICEMAIL_TO_PHONE).click();
      expect(this.view).toContainElement(COMPANY_NUMBER_SELECT);
      expect(this.view).toContainElement(NO_EXTERNAL_NUMBER_WARNING);
    });
  });

  describe('Enable Voicemail: with 3 external numbers available', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = externalNumberOptions;
      this.$scope.sites = SITES[0];
      this.$scope.$apply();
    });

    it('should have a drop down list of numbers and display warning text when External Voicemail Access is checked.', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      this.view.find(VOICEMAIL_TO_PHONE).click();
      expect(this.view).toContainElement(COMPANY_NUMBER_SELECT);
      expect(this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('(972) 555-1212');
      expect(this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('(972) 555-1313');
      expect(this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('(972) 555-1414');
    });

    it('should call onChangeFn when an external number is chosen', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: true,
        VM2E: false,
        VM2E_Attachment: false,
        VM2E_Transcript: false,
        VM2E_TLS: false,
        VM2S: true,
        VM2S_Attachment: true,
        VM2S_Transcript: true,
        VMOTP: true,
      });
      this.view.find(VOICEMAIL_TOGGLE).click();
      this.view.find(VOICEMAIL_TO_PHONE).click();
      this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn.calls.argsFor(1)).toEqual([GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures]);
    });
  });

  describe('Enable Voicemail with Voicemail to Email (VM2E)', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = [];
      this.$scope.sites = SITES[0];
      this.$scope.$apply();
    });

    it('should call onChangeFn when VM2E checked with features set for Email with Attachment, Email with Transcript, use TLS', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: false,
        VM2E: true,
        VM2E_Attachment: true,
        VM2E_Transcript: true,
        VM2E_TLS: true,
        VM2S: true,
        VM2S_Attachment: true,
        VM2S_Transcript: true,
        VMOTP: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      this.view.find(VOICEMAIL_TO_EMAIL).click();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_ATTACHMENT)).toBeChecked();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_TRANSCRIPT)).toBeChecked();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_USE_TLS)).toBeChecked();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures);
    });

    it('should check VM2E with Attachment unchecked call is made with correct features', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: false,
        VM2E: true,
        VM2E_Attachment: false,
        VM2E_Transcript: true,
        VM2E_TLS: true,
        VM2S: true,
        VM2S_Attachment: true,
        VM2S_Transcript: true,
        VMOTP: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      this.view.find(VOICEMAIL_TO_EMAIL).click();

      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_TRANSCRIPT)).toBeChecked();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_USE_TLS)).toBeChecked();
      this.$scope.features.VM2E = true;

      this.view.find(VOICEMAIL_TO_EMAIL_WITH_ATTACHMENT).click();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_ATTACHMENT)).not.toBeChecked();
      expect(this.$scope.onChangeFn.calls.argsFor(1)).toEqual([GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures]);
    });

    it('should check VM2E with Transcript unchecked call is made with correct features', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: false,
        VM2E: true,
        VM2E_Attachment: true,
        VM2E_Transcript: false,
        VM2E_TLS: true,
        VM2S: true,
        VM2S_Attachment: true,
        VM2S_Transcript: true,
        VMOTP: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      this.view.find(VOICEMAIL_TO_EMAIL).click();

      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_ATTACHMENT)).toBeChecked();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_TRANSCRIPT)).toBeChecked();
      this.$scope.features.VM2E = true;

      this.view.find(VOICEMAIL_TO_EMAIL_WITH_TRANSCRIPT).click();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_TRANSCRIPT)).not.toBeChecked();
      expect(this.$scope.onChangeFn.calls.argsFor(1)).toEqual([GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures]);
    });

    it('should check VM2E with TLS unchecked call is made with correct features', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: false,
        VM2E: true,
        VM2E_Attachment: true,
        VM2E_Transcript: true,
        VM2E_TLS: false,
        VM2S: true,
        VM2S_Attachment: true,
        VM2S_Transcript: true,
        VMOTP: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      this.view.find(VOICEMAIL_TO_EMAIL).click();

      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_ATTACHMENT)).toBeChecked();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_WITH_TRANSCRIPT)).toBeChecked();
      this.$scope.features.VM2E = true;

      this.view.find(VOICEMAIL_TO_EMAIL_USE_TLS).click();
      expect(this.view.find(VOICEMAIL_TO_EMAIL_USE_TLS)).not.toBeChecked();
      expect(this.$scope.onChangeFn.calls.argsFor(1)).toEqual([GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures]);
    });

  });

  describe('Enable Voicemail with Voicemail to Spark(VM2S)', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = [];
      this.$scope.sites = SITES[0];
      this.$scope.$apply();
    });

    it('should enable Voicemail to Spark with Attachment and Transcript features checked', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: false,
        VM2E: false,
        VM2E_Attachment: false,
        VM2E_Transcript: false,
        VM2E_TLS: false,
        VM2S: true,
        VM2S_Attachment: true,
        VM2S_Transcript: true,
        VMOTP: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();

      expect(this.view).toContainElement(VOICEMAIL_TO_SPARK_WITH_ATTACHMENT);
      expect(this.view.find(VOICEMAIL_TO_SPARK_WITH_ATTACHMENT)).toBeChecked();
      expect(this.view.find(VOICEMAIL_TO_SPARK_WITH_TRANSCRIPT)).toBeChecked();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures);
    });

    it('should enable Voicemail to Spark with Attachment unchecked', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: false,
        VM2E: false,
        VM2E_Attachment: false,
        VM2E_Transcript: false,
        VM2E_TLS: false,
        VM2S: true,
        VM2S_Attachment: false,
        VM2S_Transcript: true,
        VMOTP: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_SPARK_WITH_ATTACHMENT);
      expect(this.view.find(VOICEMAIL_TO_SPARK_WITH_ATTACHMENT)).toBeChecked();
      expect(this.view.find(VOICEMAIL_TO_SPARK_WITH_TRANSCRIPT)).toBeChecked();
      this.$scope.features.VM2S = true;
      this.view.find(VOICEMAIL_TO_SPARK_WITH_ATTACHMENT).click();
      expect(this.view.find(VOICEMAIL_TO_SPARK_WITH_ATTACHMENT)).not.toBeChecked();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures);
    });

    it('should enable Voicemail to Spark with Transcript unchecked', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: false,
        VM2E: false,
        VM2E_Attachment: false,
        VM2E_Transcript: false,
        VM2E_TLS: false,
        VM2S: true,
        VM2S_Attachment: true,
        VM2S_Transcript: false,
        VMOTP: true,
      });

      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_SPARK_WITH_ATTACHMENT);
      expect(this.view.find(VOICEMAIL_TO_SPARK_WITH_ATTACHMENT)).toBeChecked();
      expect(this.view.find(VOICEMAIL_TO_SPARK_WITH_TRANSCRIPT)).toBeChecked();
      this.$scope.features.VM2S = true;
      this.view.find(VOICEMAIL_TO_SPARK_WITH_TRANSCRIPT).click();
      expect(this.view.find(VOICEMAIL_TO_SPARK_WITH_TRANSCRIPT)).not.toBeChecked();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures);
    });
  });

  describe('Voicemail Enabled: Enable OTP ', () => {
    beforeEach(function() {
      this.$scope.features = new AvrilSiteFeatures();
      this.$scope.externalNumberOptions = [];
      this.$scope.sites = SITES[0];
      this.$scope.$apply();
    });
    it('should call onChangeFn when enable OTP is unchecked', function() {
      const avrilFeatures = new AvrilSiteFeatures({
        VM2T: false,
        VM2E: false,
        VM2E_Attachment: false,
        VM2E_Transcript: false,
        VM2E_TLS: false,
        VM2S: true,
        VM2S_Attachment: true,
        VM2S_Transcript: true,
        VMOTP: false,
      });
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(ENABLE_OTP);
      expect(this.view.find(ENABLE_OTP)).toBeChecked();
      this.view.find(ENABLE_OTP).click();
      expect(this.view.find(ENABLE_OTP)).not.toBeChecked();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true, avrilFeatures);
    });
  });

  describe('Voicemail Enabled: disable voicemail', () => {
    beforeEach(function() {
      this.$scope.externalNumberOptions = externalNumberOptions;
      this.$scope.companyVoicemailEnabled = true;
      this.$scope.$apply();
    });

    it('should have a toggle switch checked on', function() {
      expect(this.view.find(VOICEMAIL_TOGGLE)).toBeChecked();
    });

    it('should call onChangeFn when voicemail is turned off', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(null, null, false, undefined);
    });
  });
});
