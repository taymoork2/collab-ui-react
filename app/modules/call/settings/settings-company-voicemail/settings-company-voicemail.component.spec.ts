import companyVoicemailModule from './index';

describe('Component: companyVoicemail', () => {
  const VOICEMAIL_TOGGLE = 'input#companyVoicemailToggle';
  const EXTERNAL_VM_CHECKBOX = 'input#externalVoicemailAccess';
  const VOICEMAIL_TO_EMAIL_CHECKBOX = 'input#voicemailToEmail';
  const COMPANY_NUMBER_SELECT = '.csSelect-container[name="companyVoicemailNumber"]';
  const MESSAGE_CONTAINER = '.msg-container';
  const NO_EXTERNAL_NUMBER_WARNING = COMPANY_NUMBER_SELECT + ' ' + MESSAGE_CONTAINER;
  const DROPDOWN_FILTER = '.dropdown-menu input.select-filter';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const GENERATED_VM_PILOT_NUMBER = '+150708071004091414081311041300051000081';
  const externalNumberOptions = getJSONFixture('huron/json/settings/externalNumbersOptions.json');

  beforeEach(function() {
    this.initModules(companyVoicemailModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
      'PhoneNumberService',
      'ServiceSetup',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.onVoicemailToEmailChangedFn = jasmine.createSpy('onVoicemailToEmailChangedFn');
    this.$scope.onNumberFilter = jasmine.createSpy('onNumberFilter');
    spyOn(this.ServiceSetup, 'generateVoiceMailNumber').and.returnValue(GENERATED_VM_PILOT_NUMBER);

    this.compileComponent('ucCompanyVoicemail', {
      site: 'site',
      voicemailToEmail: 'voicemailToEmail',
      companyVoicemailEnabled: 'companyVoicemailEnabled',
      dialPlanCountryCode: 'dialPlanCountryCode',
      externalNumberOptions: 'externalNumberOptions',
      onVoicemailToEmailChangedFn: 'onVoicemailToEmailChangedFn(voicemailToEmail)',
      onNumberFilter: 'onNumberFilter(filter)',
      onChangeFn: 'onChangeFn(voicemailPilotNumber, voicemailPilotNumberGenerated, companyVoicemailEnabled)',
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
    it('should call onChangeFn when voicemail is toggled', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true);
    });

    it('should have External Voicemail Access and Voicemail to Email checkboxes when voicemail is toggled on', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
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
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      this.view.find(EXTERNAL_VM_CHECKBOX).click();
      this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn.calls.argsFor(2)).toEqual(['+19725551212', 'false', true]);
    });
  });

  describe('Enable Voicemail: enable Voicemail to Email', () => {
    it('should call onVoicemailToEmailChangedFn when Voicemail to Email is unchecked', function() {
      this.view.find(VOICEMAIL_TOGGLE).click();
      expect(this.view).toContainElement(VOICEMAIL_TO_EMAIL_CHECKBOX);
      this.view.find(VOICEMAIL_TO_EMAIL_CHECKBOX).click();
      expect(this.$scope.onVoicemailToEmailChangedFn).toHaveBeenCalledWith(true);
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
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(null, null, false);
    });
  });

  describe('Voicemail Enabled: External Voicemail Access', () => {
    beforeEach(function() {
      this.$scope.externalNumberOptions = externalNumberOptions;
      this.$scope.companyVoicemailEnabled = true;
      this.$scope.dialPlanCountryCode = '+1';
      this.$scope.site = {
        voicemailPilotNumberGenerated: false,
        voicemailPilotNumber: '+19725551212',
      };
      this.$scope.$apply();
    });

    it('should have External Voicemail Access checkbox checked', function() {
      expect(this.view.find(EXTERNAL_VM_CHECKBOX)).toBeChecked();
    });

    it('should call onNumberFilter when filtering numbers list', function() {
      this.view.find(COMPANY_NUMBER_SELECT).find(DROPDOWN_FILTER).val('search value').change();
      this.$timeout.flush(); // for cs-select
      expect(this.$scope.onNumberFilter).toHaveBeenCalledWith('search value');
    });

    it('should call onChangeFn when External Voicemail Access is disabled', function() {
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      this.view.find(EXTERNAL_VM_CHECKBOX).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(GENERATED_VM_PILOT_NUMBER, 'true', true);
    });
  });

  describe('Voicemail Enabled: Voicemail to Email', () => {
    beforeEach(function() {
      this.$scope.companyVoicemailEnabled = true;
      this.$scope.voicemailToEmail = true;
      this.$scope.$apply();
    });

    it('should have Voicemail to Email checkbox checked', function() {
      expect(this.view.find(VOICEMAIL_TO_EMAIL_CHECKBOX)).toBeChecked();
    });

    it('should call onVoicemailToEmailChangedFn when Voicemail to Email is unchecked', function() {
      this.view.find(VOICEMAIL_TO_EMAIL_CHECKBOX).click();
      expect(this.$scope.onVoicemailToEmailChangedFn).toHaveBeenCalledWith(false);
    });
  });

});
