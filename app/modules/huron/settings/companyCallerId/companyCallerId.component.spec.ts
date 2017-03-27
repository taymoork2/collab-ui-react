import companyCallerIdModule from './index';
import { CompanyNumber, ExternalCallerIdType } from 'modules/huron/settings/companyCallerId';

describe('Component: companyCallerId', () => {
  const CALLER_ID_TOGGLE = 'input#companyCallerIdToggle';
  const CALLER_ID_NAME = 'input#callerIdName';
  const CALLER_ID_NUMBER_SELECT = '.csSelect-container[name="companyCallerIdNumber"]';

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

    it('should not have External Voicemail Access and Voicemail to Email checkboxes when voicemail is off', function() {
      expect(this.view).not.toContainElement(CALLER_ID_NAME);
      expect(this.view).not.toContainElement(CALLER_ID_NUMBER_SELECT);
    });
  });

  describe('Enable Company Caller Id: with 0 external numbers available', () => {
    beforeEach(function() {
      this.$scope.customerName = 'Awesome Sauce';
      this.$scope.$apply();
    });

    it('should call onChangeFn when company caller id is toggled', function() {
      let companyNumber = new CompanyNumber({
        name: 'Awesome Sauce',
        externalCallerIdType: ExternalCallerIdType.COMPANY_CALLER_ID_TYPE,
      });
      this.view.find(CALLER_ID_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(companyNumber);
    });

  });

});
