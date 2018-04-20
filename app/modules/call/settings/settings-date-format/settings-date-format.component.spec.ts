import dateFormatModule from './index';

describe('Component: dateFormat', () => {
  const DATE_FORMAT_SELECT = '.csSelect-container[name="dateFormatSelect"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const MONTH_DAY_YR_FORMAT = 'M-D-Y';
  const YR_MONTH_DAY_FORMAT = 'Y-M-D';
  const dateFormatOptions = getJSONFixture('huron/json/settings/dateFormat.json');

  beforeEach(function() {
    this.initModules(dateFormatModule);
    this.injectDependencies(
      '$scope',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');

    this.compileComponent('ucDateFormat', {
      dateFormat: 'dateFormat',
      dateFormatOptions: 'dateFormatOptions',
      onChangeFn: 'onChangeFn(dateFormat)',
    });

    this.$scope.dateFormat = MONTH_DAY_YR_FORMAT;
    this.$scope.dateFormatOptions = dateFormatOptions;
    this.$scope.$apply();
  });

  it('should have a select box with options', function() {
    expect(this.view).toContainElement(DATE_FORMAT_SELECT);
    expect(this.view.find(DATE_FORMAT_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('MM-DD-YYYY');
    expect(this.view.find(DATE_FORMAT_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('DD-MM-YYYY');
    expect(this.view.find(DATE_FORMAT_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('YYYY-MM-DD');
  });

  it('should invoke onChangeFn when a format is chosen', function() {
    this.view.find(DATE_FORMAT_SELECT).find(DROPDOWN_OPTIONS).get(2).click();
    expect(this.$scope.onChangeFn).toHaveBeenCalledWith(YR_MONTH_DAY_FORMAT);
  });

});
