import locationCallerIdModule from './index';
import { LocationCallerId } from 'modules/call/locations/shared';

describe('Component: locations-caller-id', () => {
  const CALLER_ID_TOGGLE = 'input#locationCallerIdToggle';
  const CALLER_ID_NAME = 'input#callerIdName';
  const CALLER_ID_NUMBER_SELECT = '.csSelect-container[name="locationCallerIdNumber"]';
  const COMBO_INPUT = '.combo-box input';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const externalNumberOptions = getJSONFixture('huron/json/settings/externalNumbersOptions.json');

  beforeEach(function() {
    this.initModules(locationCallerIdModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucLocationCallerId', {
      showLabel: 'showLabel',
      companyName: 'companyName',
      callerId: 'callerId',
      externalNumberOptions: 'externalNumberOptions',
      onChangeFn: 'onChangeFn(callerId)',
    });
  });

  describe('Initial state: Location Caller Id disabled', () => {
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
      this.$scope.companyName = 'Awesome Sauce';
      this.$scope.companyCallerId = null;
      this.$scope.$apply();
    });

    it('should call onChangeFn when company caller id is toggled', function() {
      this.controller.callerId = null;
      this.controller.$onInit();
      this.view.find(CALLER_ID_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(new LocationCallerId({
        name: 'Awesome Sauce',
        number: '',
        uuid: '',
      }));
    });

    it('should restore the original callerId when toggle is turned off and then on', function() {
      this.controller.callerId = new LocationCallerId({
        name: 'Awesome Sauce',
        number: '',
        uuid: '',
      });
      this.controller.$onInit();
      this.$scope.$apply();
      this.view.find(CALLER_ID_TOGGLE).click();
      this.view.find(CALLER_ID_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(null);
      this.view.find(CALLER_ID_TOGGLE).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(this.controller.callerId);
    });

    it('should have Caller ID Name and Caller ID Number when Caller ID is enabled', function() {
      this.view.find(CALLER_ID_TOGGLE).click();
      expect(this.view).toContainElement(CALLER_ID_NAME);
      expect(this.view).toContainElement(CALLER_ID_NUMBER_SELECT);
    });
  });

  describe('Company Caller Id Enabled: with zero external numbers', () => {
    beforeEach(function() {
      this.$scope.companyName = 'Awesome Sauce';
      this.$scope.callerId = new LocationCallerId({
        name: 'Awesome Sauce',
        number: '',
        uuid: '',
      });
      this.$scope.$apply();
    });

    it('should allow value to be typed in', function() {
      const callerId = new LocationCallerId({
        name: 'Awesome Sauce',
        number: '+19725551212',
        uuid: '',
      });
      expect(this.view).toContainElement(CALLER_ID_NUMBER_SELECT + ' ' + COMBO_INPUT);
      this.view.find(CALLER_ID_NUMBER_SELECT).find(COMBO_INPUT).val('+19725551212').change();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callerId);
    });
  });

  describe('Company Caller Id Enabled: with 3 external numbers', () => {
    beforeEach(function() {
      this.$scope.customerName = 'Awesome Sauce';
      this.$scope.callerId = new LocationCallerId({
        name: 'Awesome Sauce',
        number: '+19725551212',
        uuid: '',
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
      const callerId = new LocationCallerId({
        name: 'Awesome Sauce',
        number: '+19725551414',
        uuid: '',
      });
      this.view.find(CALLER_ID_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(2).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith(callerId);
    });
  });
});
