import outboundDialDigitModule from './index';

describe('Component: outboundDialDigit', () => {
  const OUTBOUND_DIAL_DIGIT_SELECT = '.csSelect-container[name="steeringDigit"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const WARNING_MSG = '.msg-container span.text-wrap';
  const STEERING_DIGIT_NULL = 'null';
  const STEERING_DIGIT_FIVE = '5';
  const STEERING_DIGIT_NINE = '9';
  const internalNumberRanges = getJSONFixture('huron/json/settings/internalNumberRanges.json');

  beforeEach(function() {
    this.initModules(outboundDialDigitModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucOutboundDialDigit', {
      steeringDigit: 'steeringDigit',
      internalNumberRanges: 'internalNumberRanges',
      onChangeFn: 'onChangeFn(steeringDigit)',
    });

    this.$scope.steeringDigit = STEERING_DIGIT_NINE;
    this.$scope.internalNumberRanges = internalNumberRanges;
    this.$scope.$apply();
  });

  it('should have a select box with options', function() {
    expect(this.view).toContainElement(OUTBOUND_DIAL_DIGIT_SELECT);
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('common.none');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('1');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('2');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(3)).toHaveText('3');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(4)).toHaveText('4');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(5)).toHaveText('5');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(6)).toHaveText('6');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(7)).toHaveText('7');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(8)).toHaveText('8');
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(9)).toHaveText('9');
  });

  it('should invoke onChangeFn when a steering digit is chosen', function() {
    this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(STEERING_DIGIT_NULL);
  });

  xit('should show warning message when steering digit starts with internal number range', function() {
    this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(DROPDOWN_OPTIONS).get(5).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(STEERING_DIGIT_FIVE);
    expect(this.view.find(OUTBOUND_DIAL_DIGIT_SELECT).find(WARNING_MSG)).toContainText('serviceSetupModal.warning.siteSteering');
  });

});
