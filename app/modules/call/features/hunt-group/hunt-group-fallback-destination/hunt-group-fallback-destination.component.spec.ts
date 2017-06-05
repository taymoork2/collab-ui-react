import huntGroupFallbackDestinationModule  from './index';

describe ('component: ucHuntGroupFallbackDestination', () => {
  const RADIO_FALLBACK = '#fallback';
  const RADIO_ALTERNATE = '#alternate';
  const RADIO_AUTOMATIC = '#automatic';

  beforeEach(function() {
    this.initModules(huntGroupFallbackDestinationModule);
    this.injectDependencies('$scope',
    );

    this.$scope.onChangeDestinationRuleFn = jasmine.createSpy('onChangeDestinationRuleFn');
    this.$scope.onChangeDestinationFn = jasmine.createSpy('onChangeDestinationFn');
    this.$scope.onChangeAlternateFn = jasmine.createSpy(' onChangeAlternateFn');

    this.compileComponent('ucHuntGroupFallbackDestination', {
      destinationRule: 'TYPEFALLBACKRULE_FALLBACK_DESTINATION',
      fallbackDestination: '',
      alternateDestination: '',
      onChangeDestinationRuleFn: 'onChangeDestinationRuleFn()',
      onChangeDestinationFn: 'onChangeDestinationFn()',
      onChangeAlternateFn: 'onChangeAlternateFn()',
    });
    this.$scope.$apply();
  });

  it('should have the hunt group Fallback radio options and Fallback option to be selected', function () {
    expect(this.view).toContainElement(RADIO_FALLBACK);
    expect(this.view).toContainElement(RADIO_ALTERNATE);
    expect(this.view).toContainElement(RADIO_AUTOMATIC);
  });

  it('should have the hunt group Alternate Fallback radio option to be selected', function () {
    this.view.find(RADIO_ALTERNATE).click().click();
    expect(this.view.find(RADIO_ALTERNATE)).toBeChecked();
    expect(this.$scope.onChangeDestinationRuleFn).toHaveBeenCalled();
  });

  it('should have the hunt group Automatic Fallback radio option to be selected', function () {
    this.view.find(RADIO_AUTOMATIC).click().click();
    expect(this.view.find(RADIO_AUTOMATIC)).toBeChecked();
    expect(this.$scope.onChangeDestinationRuleFn).toHaveBeenCalled();
  });
});
