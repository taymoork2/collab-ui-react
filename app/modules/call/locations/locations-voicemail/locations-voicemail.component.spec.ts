import locationVoicemailModule from './index';
import { VoicemailPilotNumber } from 'modules/call/locations/shared';

describe('Component: LocationsVoicemailComponent', () => {
  const EXTERNAL_VM_CHECKBOX = 'input#externalVoiceMailAccess';
  const EXTERNAL_NUMBER_SELECT = '.csSelect-container[name="externalVoicemailNumber"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const DROPDOWN_FILTER = '.dropdown-menu input.select-filter';
  const externalNumberOptions = getJSONFixture('huron/json/settings/externalNumbersOptions.json');
  const GENERATED_VM_PILOT_NUMBER = '+150708071004091414081311041300051000081';

  beforeEach(function() {
    this.initModules(locationVoicemailModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
      'ServiceSetup',
    );

    this.$scope.changeFn = jasmine.createSpy('changeFn');
    this.$scope.numberFilterFn = jasmine.createSpy('numberFilterFn');
    spyOn(this.ServiceSetup, 'generateVoiceMailNumber').and.returnValue(GENERATED_VM_PILOT_NUMBER);

    this.compileComponent('ucLocationVoicemail', {
      displayLabel: 'displayLabel',
      voicemailPilotNumber: 'voicemailPilotNumber',
      dialPlanCountryCode: 'dialPlanCountryCode',
      externalNumberOptions: 'externalNumberOptions',
      voicemailToEmailEnabled: 'voicemailToEmailEnabled',
      changeFn: 'changeFn(voicemailPilotNumber)',
      numberFilterFn: 'numberFilterFn(filter)',
    });
  });

  describe('Initial State: External Voicemail Access Off,', () => {
    beforeEach(function () {
      this.$scope.voicemailPilotNumber = null;
      this.$scope.externalNumberOptions = [];
      this.$scope.$apply();
    });
    it('should have an External Voicemail Access checkbox', function () {
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
    });
    it('should have the External Voicemail Access checkbox unchecked', function () {
      expect(this.view.find(EXTERNAL_VM_CHECKBOX)).not.toBeChecked();
    });
    it('should show warning due to no options', function () {
      expect(this.controller.missingDirectNumbers).toEqual(true);
    });
    it('should have externalNumberModel equal to null', function () {
      expect(this.controller.externalNumberModel).toEqual(null);
    });
  });

  describe('Enable External Voicemail Access with 3 external numbers available', () => {
    beforeEach(function () {
      this.$scope.voicemailPilotNumber = null;
      this.$scope.externalNumberOptions = externalNumberOptions;
      this.$scope.$apply();
    });

    it('should have a drop down list of numbers when External Voicemail Access is checked.', function () {
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      this.view.find(EXTERNAL_VM_CHECKBOX).click();
      expect(this.view).toContainElement(EXTERNAL_NUMBER_SELECT);
      expect(this.view.find(EXTERNAL_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('(972) 555-1212');
      expect(this.view.find(EXTERNAL_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('(972) 555-1313');
      expect(this.view.find(EXTERNAL_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('(972) 555-1414');
    });

    it('should call numberFilterFn when filtering numbers list', function() {
      this.view.find(EXTERNAL_NUMBER_SELECT).find(DROPDOWN_FILTER).val('search value').change();
      this.$timeout.flush(); // for cs-select
      expect(this.$scope.numberFilterFn).toHaveBeenCalledWith('search value');
    });

    it('should call onChangeFn when an external number is chosen', function() {
      const voicemailPilotNumber = new VoicemailPilotNumber({
        number: '+19725551212',
        generated: false,
      });
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      this.view.find(EXTERNAL_VM_CHECKBOX).click();
      this.view.find(EXTERNAL_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.changeFn).toHaveBeenCalledWith(voicemailPilotNumber);
    });
  });

  describe('External Voicemail Access enabled', () => {
    beforeEach(function () {
      this.$scope.voicemailPilotNumber = new VoicemailPilotNumber({
        number: '+19725551313',
        generated: false,
      });
      this.$scope.externalNumberOptions = externalNumberOptions;
      this.$scope.$apply();
    });

    it('should have External Voicemail Access checked and show correct number in dropdown', function () {
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      expect(this.view.find(EXTERNAL_VM_CHECKBOX)).toBeChecked();
      expect(this.controller.externalNumberModel).toEqual(externalNumberOptions[1]);
    });

    it('should send correct voicemailPilotNumber when External Voicemail Access is unchecked', function () {
      const voicemailPilotNumber = new VoicemailPilotNumber({
        number: GENERATED_VM_PILOT_NUMBER,
        generated: true,
      });
      expect(this.view).toContainElement(EXTERNAL_VM_CHECKBOX);
      expect(this.view.find(EXTERNAL_VM_CHECKBOX)).toBeChecked();
      this.view.find(EXTERNAL_VM_CHECKBOX).click();
      expect(this.$scope.changeFn).toHaveBeenCalledWith(voicemailPilotNumber);
    });
  });
});
