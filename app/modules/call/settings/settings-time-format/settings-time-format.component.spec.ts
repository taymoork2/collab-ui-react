import timeFormatModule from './index';

describe('Component: timeFormat', () => {
  const TIME_FORMAT_SELECT = '.csSelect-container[name="timeFormatSelect"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const TWELVE_HOUR_FORMAT = '12-hour';
  const TWENTY_FOUR_HOUR_FORMAT = '24-hour';
  const timeFormatOptions = getJSONFixture('huron/json/settings/timeFormats.json');

  beforeEach(function() {
    this.initModules(timeFormatModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucTimeFormat', {
      timeFormat: 'timeFormat',
      timeFormatOptions: 'timeFormatOptions',
      onChangeFn: 'onChangeFn(timeFormat)',
    });

    this.$scope.timeFormat = TWELVE_HOUR_FORMAT;
    this.$scope.timeFormatOptions = timeFormatOptions;
    this.$scope.$apply();
  });

  it('should have a select box with options', function() {
    expect(this.view).toContainElement(TIME_FORMAT_SELECT);
    expect(this.view.find(TIME_FORMAT_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('12 hour');
    expect(this.view.find(TIME_FORMAT_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('24 hour');
  });

  it('should invoke onChangeFn when a format is chosen', function() {
    this.view.find(TIME_FORMAT_SELECT).find(DROPDOWN_OPTIONS).get(1).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(TWENTY_FOUR_HOUR_FORMAT);
  });

});
