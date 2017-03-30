import dialingModule from './index';

const NATIONAL_RADIO = 'input#nationalDialing';
const LOCAL_RADIO = 'input#localDialing';
const AREA_CODE_INPUT = 'input#areacode-input';
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
      isTerminusCustomer: 'isTerminusCustomer',
      onChangeFn: 'onChangeFn(regionCode)',
    });
  });

  describe('Terminus Customer = true: National Dialing selected', () => {
    beforeEach(function() {
      this.$scope.regionCode = null;
      this.$scope.isTerminusCustomer = true;
      this.$scope.$apply();
    });

    it('should have "National Dialing" and "Local Dialing" radio buttons', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view).toContainElement(LOCAL_RADIO);
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

  describe('Terminus Customer = true: Local Dialing selected', () => {
    beforeEach(function() {
      this.$scope.regionCode = '';
      this.$scope.isTerminusCustomer = true;
      this.$scope.$apply();
    });

    it('should have National Dialing radio selected by default', function() {
      expect(this.view).toContainElement(NATIONAL_RADIO);
      expect(this.view).toContainElement(LOCAL_RADIO);
      expect(this.view.find(NATIONAL_RADIO)).toBeChecked();
      expect(this.view.find(LOCAL_RADIO)).not.toBeChecked();
    });

    it('should un-disable area code input when Local Dialing radio is clicked', function() {
      this.view.find(LOCAL_RADIO).click().click();
      expect(this.view).toContainElement(AREA_CODE_INPUT);
      expect(this.view.find(AREA_CODE_INPUT)).not.toBeDisabled();
    });

    it('should call onChangeFn with prefix when a prefix is entered', function() {
      this.view.find(LOCAL_RADIO).click().click();
      this.view.find(AREA_CODE_INPUT).val(AREA_CODE).change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(AREA_CODE);
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

    it('should call onChangeFn with null when None is selected', function() {
      expect(this.view.find(LOCAL_RADIO)).toBeChecked();
      this.view.find(NATIONAL_RADIO).click().click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('');
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
