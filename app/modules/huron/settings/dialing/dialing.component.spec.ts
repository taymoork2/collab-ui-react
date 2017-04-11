import dialingModule from './index';

const NATIONAL_RADIO = 'input#nationalDialing';
const LOCAL_RADIO = 'input#localDialing';
const AREA_CODE_INPUT = 'input#areacode-input';
const REQUIRE_ONE_TO_DIAL_CHECKBOX = 'input#requireOneToDial';
const TERMINUS_WARNING = '.terminus-warning';
const AREA_CODE = '214';

describe('Component: dialing', () => {
  beforeEach(function() {
    this.initModules(dialingModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucDialingSetup', {
      regionCode: 'regionCode',
      steeringDigit: 'steeringDigit',
      useSimplifiedNationalDialing: 'useSimplifiedNationalDialing',
      supportsSimplifiedNationalDialing: 'supportsSimplifiedNationalDialing',
      isTerminusCustomer: 'isTerminusCustomer',
      onChangeFn: 'onChangeFn(regionCode, useSimplifiedNationalDialing)',
    });
  });

  describe('Terminus Customer = true: National Dialing selected: Simplified dialing supported', () => {
    beforeEach(function() {
      this.$scope.regionCode = null;
      this.$scope.isTerminusCustomer = true;
      this.$scope.supportsSimplifiedNationalDialing = true;
      this.$scope.$apply();
    });

    it('should have "National Dialing" and "Local Dialing" radio buttons', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view).toContainElement(LOCAL_RADIO);
    });

    it('should have "Require user to dial one..." checkbox', function() {
      expect(this.view).toContainElement(REQUIRE_ONE_TO_DIAL_CHECKBOX);
    });

    it('should have National Dialing selected by default', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view.find(LOCAL_RADIO)).not.toBeChecked();
      expect(this.view.find(NATIONAL_RADIO)).toBeChecked();
    });

    it('should have a disabled Prepended Area Code input box', function() {
      expect(this.view).toContainElement(AREA_CODE_INPUT);
      expect(this.view.find(AREA_CODE_INPUT)).toBeDisabled();
    });
  });

  describe('Terminus Customer = true: National Dialing selected: Simplified dialing NOT supported', () => {
    beforeEach(function() {
      this.$scope.regionCode = null;
      this.$scope.isTerminusCustomer = true;
      this.$scope.supportsSimplifiedNationalDialing = false;
      this.$scope.$apply();
    });

    it('should have "National Dialing" and "Local Dialing" radio buttons', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view).toContainElement(LOCAL_RADIO);
    });

    it('should NOT have "Require user to dial one..." checkbox', function() {
      expect(this.view).not.toContainElement(REQUIRE_ONE_TO_DIAL_CHECKBOX);
    });

  });

  describe('Terminus Customer = true: Local Dialing selected', () => {
    beforeEach(function() {
      this.$scope.regionCode = '';
      this.$scope.isTerminusCustomer = true;
      this.$scope.supportsSimplifiedNationalDialing = true;
      this.$scope.$apply();
    });

    it('should have National Dialing radio selected by default', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view).toContainElement(LOCAL_RADIO);
      expect(this.view.find(NATIONAL_RADIO)).toBeChecked();
      expect(this.view.find(LOCAL_RADIO)).not.toBeChecked();
      expect(this.view.find(REQUIRE_ONE_TO_DIAL_CHECKBOX)).not.toBeChecked();
    });

    it('should call onChangeFn when "Require user to dial one..." is checked', function() {
      this.view.find(REQUIRE_ONE_TO_DIAL_CHECKBOX).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('', true);
    });

    it('should uncheck and disable "Require user to dial one..." when Local Dialing is clicked', function() {
      this.view.find(REQUIRE_ONE_TO_DIAL_CHECKBOX).click();
      this.view.find(LOCAL_RADIO).click().click();
      expect(this.view.find(REQUIRE_ONE_TO_DIAL_CHECKBOX)).not.toBeChecked();
      expect(this.view.find(REQUIRE_ONE_TO_DIAL_CHECKBOX)).toBeDisabled();
    });

    it('should un-disable area code input when Local Dialing radio is clicked', function() {
      this.view.find(LOCAL_RADIO).click().click();
      expect(this.view).toContainElement(AREA_CODE_INPUT);
      expect(this.view.find(AREA_CODE_INPUT)).not.toBeDisabled();
    });

    it('should call onChangeFn with prefix when a prefix is entered', function() {
      this.view.find(LOCAL_RADIO).click().click();
      this.view.find(AREA_CODE_INPUT).val(AREA_CODE).change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(AREA_CODE, false);
    });
  });

  describe('Terminus Customer = true: Area Code set', function() {
    beforeEach(function() {
      this.$scope.regionCode = AREA_CODE;
      this.$scope.isTerminusCustomer = true;
      this.$scope.$apply();
    });

    it('should have Local Dialing radio selected', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view).toContainElement(LOCAL_RADIO);
      expect(this.view.find(NATIONAL_RADIO)).not.toBeChecked();
      expect(this.view.find(LOCAL_RADIO)).toBeChecked();
    });

    it('should show area code input with region code passed in', function() {
      expect(this.view).toContainElement(AREA_CODE_INPUT);
      expect(this.view.find(AREA_CODE_INPUT).val()).toEqual(AREA_CODE);
      expect(this.view.find(AREA_CODE_INPUT)).not.toBeDisabled();
    });

    it('should disable area code input when National Dialing is selected', function() {
      expect(this.view.find(LOCAL_RADIO)).toBeChecked();
      expect(this.view).toContainElement(AREA_CODE_INPUT);
      expect(this.view.find(AREA_CODE_INPUT)).not.toBeDisabled();
      this.view.find(NATIONAL_RADIO).click().click();
      expect(this.view.find(NATIONAL_RADIO)).toBeChecked();
      expect(this.view.find(LOCAL_RADIO)).not.toBeChecked();
      expect(this.view.find(AREA_CODE_INPUT)).toBeDisabled();
    });

    it('should call onChangeFn with "", false Simplified dialing is selected', function() {
      expect(this.view.find(LOCAL_RADIO)).toBeChecked();
      this.view.find(NATIONAL_RADIO).click().click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('', false);
    });
  });

  describe('Terminus Customer = false', () => {
    beforeEach(function() {
      this.$scope.regionCode = '';
      this.$scope.isTerminusCustomer = false;
      this.$scope.$apply();
    });

    it('should have National Dialing radio selected', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view.find(NATIONAL_RADIO)).toBeChecked();
    });

    it('should disable Local Dialing radio button', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view.find(LOCAL_RADIO)).toBeDisabled();
    });

    it('should not show Area Code input', function() {
      expect(this.view).not.toContainElement(AREA_CODE_INPUT);
    });

    it('should show PSTN setup warning', function() {
      expect(this.view.find(TERMINUS_WARNING)).toContainText('serviceSetupModal.warning.localDialing');
    });
  });

});
