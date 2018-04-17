import companyCallerIdModule from './index';
import { CompanyNumber, ExternalCallerIdType } from 'modules/call/settings/settings-company-caller-id';

describe('Component: companyCallerId', () => {
  const CALLER_ID_TOGGLE = 'input#companyCallerIdToggle';
  const CALLER_ID_NAME = 'input#callerIdName';
  const CALLER_ID_NUMBER_SELECT = '.csSelect-container[name="companyCallerIdNumber"]';
  const COMBO_INPUT = '.combo-box input';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const externalNumberOptions = getJSONFixture('huron/json/settings/externalNumbersOptions.json');

  beforeEach(function() {
    this.initModules(companyCallerIdModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onNumberFilter = jasmine.createSpy('onNumberFilter');
    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucCompanyCallerId', {
      customerName: 'customerName',
      companyCallerId: 'companyCallerId',
      externalNumberOptions: 'externalNumberOptions',
      onNumberFilter: 'onNumberFilter(filter)',
      onChangeFn: 'onChangeFn(companyCallerId)',
    });
  });

  describe('Initial state: Company Caller Id disabled', () => {
    it('should have a toggle switch', function() {
      expect(this.view).toContainElement(CALLER_ID_TOGGLE);
    });

    it('should have a toggle switch in the off position', function() {
      expect(this.view.find(CALLER_ID_TOGGLE)).not.toBeChecked();
    });

    it('should not have Caller ID Name or Caller ID Number fields when toggle is off', function() {
      expect(this.view).not.toContainElement(CALLER_ID_NAME);
      expect(this.view).not.toContainElement(CALLER_ID_NUMBER_SELECT);
    });
  });

  describe('Enable Company Caller Id', () => {
    beforeEach(function() {
      this.$scope.customerName = 'Awesome Sauce';
      this.$scope.companyCallerId = null;
      this.$scope.$apply();
    });

    it('should call onChangeFn when company caller id is toggled', function() {
      const companyNumber = new CompanyNumber({
        name: 'Awesome Sauce',
        externalCallerIdType: ExternalCallerIdType.COMPANY_CALLER_ID_TYPE,
      });
      this.view.find(CALLER_ID_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(companyNumber);
    });

    it('should have Caller ID Name and Caller ID Number when Caller ID is enabled', function() {
      this.view.find(CALLER_ID_TOGGLE).click();
      expect(this.view).toContainElement(CALLER_ID_NAME);
      expect(this.view).toContainElement(CALLER_ID_NUMBER_SELECT);
    });

  });

  describe('Company Caller Id Enabled: with zero external numbers', () => {
    beforeEach(function() {
      this.$scope.customerName = 'Awesome Sauce';
      this.$scope.companyCallerId = new CompanyNumber({
        name: 'Awesome Sauce',
        pattern: '',
        externalCallerIdType: ExternalCallerIdType.COMPANY_CALLER_ID_TYPE,
      });
      this.$scope.$apply();
    });

    it('should allow value to be typed in', function() {
      const companyNumber = new CompanyNumber({
        name: 'Awesome Sauce',
        pattern: '+19725551212',
        externalCallerIdType: ExternalCallerIdType.COMPANY_CALLER_ID_TYPE,
      });
      expect(this.view).toContainElement(CALLER_ID_NUMBER_SELECT + ' ' + COMBO_INPUT);
      this.view.find(CALLER_ID_NUMBER_SELECT).find(COMBO_INPUT).val('+19725551212').change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(companyNumber);
    });
  });

  describe('Company Caller Id Enabled: with 3 external numbers', () => {
    beforeEach(function() {
      this.$scope.customerName = 'Awesome Sauce';
      this.$scope.companyCallerId = new CompanyNumber({
        name: 'Awesome Sauce',
        pattern: '+19725551212',
        externalCallerIdType: ExternalCallerIdType.COMPANY_CALLER_ID_TYPE,
      });
      this.$scope.externalNumberOptions = externalNumberOptions;
      this.$scope.$apply();
    });

    it('should have a drop down list of numbers.', function() {
      expect(this.view).toContainElement(CALLER_ID_NUMBER_SELECT);
      expect(this.view.find(CALLER_ID_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('(972) 555-1212');
      expect(this.view.find(CALLER_ID_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('(972) 555-1313');
      expect(this.view.find(CALLER_ID_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('(972) 555-1414');
    });

    it('should call onChangeFn when an external number is chosen from list', function() {
      const companyNumber = new CompanyNumber({
        name: 'Awesome Sauce',
        pattern: '+19725551414',
        externalCallerIdType: ExternalCallerIdType.COMPANY_CALLER_ID_TYPE,
      });
      this.view.find(CALLER_ID_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(2).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(companyNumber);
    });

  });
});
