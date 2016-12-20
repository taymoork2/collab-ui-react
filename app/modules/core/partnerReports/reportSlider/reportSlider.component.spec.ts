import {
  ITimeSliderFunctions,
  ITimespan,
} from '../partnerReportInterfaces';

describe('Component: reportSlider', () => {
  let defaults = getJSONFixture('core/json/partnerReports/commonReportService.json');
  let updateFunctions: ITimeSliderFunctions = {
    sliderUpdate: jasmine.createSpy('sliderUpdate'),
    update: jasmine.createSpy('update'),
  };
  const timeFilter: Array<ITimespan> = _.cloneDeep(defaults.altTimeFilter);

  // html selectors
  const slider: string = '.slider';
  const sliderLabels: string = '.sliderLabel';
  const filter: string = '.pull-right.report-filter';
  const openFilter: string = 'div.select-list div.dropdown a.select-toggle';
  const dropdown: string = '.dropdown-menu ul.select-options li a';
  const closeCustom: string = '#closeCustom';
  const startDate: string = '#startDate';
  const endDate: string = '#endDate';
  const startDateMenu: string = '#startDateMenu';
  const endDateMenu: string = '#endDateMenu';
  const menuOptions: string = ' .dropdown-menu .filter';

  // screen sizes
  const SCREEN_LG = 'screen-lg';
  const SCREEN_XS = 'screen-xs';

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$rootScope', '$scope', '$timeout');
    this.$scope.selected = timeFilter[0];
    this.$scope.options = timeFilter;
    this.$scope.updateFunctions = updateFunctions;
  });

  it('it should call the appropriate update functions for preset time ranges and custom time ranges', function () {
    this.$rootScope.breakpoint = SCREEN_LG;
    this.compileComponent('reportSlider', {
      selected: 'selected',
      options: 'options',
      updateFunctions: 'updateFunctions',
    });

    expect(this.view).not.toContainElement(slider);
    expect(this.view).not.toContainElement(startDate);
    expect(this.view).not.toContainElement(endDate);
    expect(this.view).not.toContainElement(closeCustom);
    expect(this.view).not.toContainElement(startDateMenu);
    expect(this.view).not.toContainElement(endDateMenu);
    expect(this.view).toContainElement(filter);
    expect(this.view).toContainElement(openFilter);

    // Verify all entries are displayed
    this.view.find(openFilter).click();
    this.$timeout.flush();
    expect(this.view.find(dropdown).length).toEqual(timeFilter.length);
    _.forEach(this.view.find(dropdown), (element: any, index: number): void => {
      expect(element.innerText).toEqual(timeFilter[index].label);
    });

    // Select non-custom option
    this.view.find(dropdown)[1].click();
    expect(this.$scope.selected).toEqual(timeFilter[1]);
    expect(updateFunctions.update).toHaveBeenCalledTimes(1);
    expect(updateFunctions.sliderUpdate).toHaveBeenCalledTimes(0);
    expect(this.view).not.toContainElement(slider);
    expect(updateFunctions.sliderUpdate).toHaveBeenCalledTimes(0);
    expect(updateFunctions.update).toHaveBeenCalledTimes(1);

    // Select custom option
    this.view.find(openFilter).click();
    this.$timeout.flush();
    this.view.find(dropdown)[timeFilter.length - 1].click();
    expect(this.view).toContainElement(slider);
    this.$timeout.flush();
    expect(this.$scope.selected).toEqual(timeFilter[timeFilter.length - 1]);
    expect(updateFunctions.update).toHaveBeenCalledTimes(1);
    expect(updateFunctions.sliderUpdate).toHaveBeenCalledTimes(1);
    expect(this.view.find(sliderLabels).length).toEqual(5);
    expect(updateFunctions.sliderUpdate).toHaveBeenCalledTimes(1);
    expect(updateFunctions.update).toHaveBeenCalledTimes(1);
  });

  it('should use alternate custom display on small screens', function () {
    this.$rootScope.breakpoint = SCREEN_XS;
    this.compileComponent('reportSlider', {
      selected: 'selected',
      options: 'options',
      updateFunctions: 'updateFunctions',
    });

    expect(this.view).not.toContainElement(slider);
    expect(this.view).not.toContainElement(startDate);
    expect(this.view).not.toContainElement(endDate);
    expect(this.view).not.toContainElement(closeCustom);
    expect(this.view).not.toContainElement(startDateMenu);
    expect(this.view).not.toContainElement(endDateMenu);
    expect(this.view).toContainElement(filter);
    expect(this.view).toContainElement(openFilter);

    // Select Custom option
    this.view.find(openFilter).click();
    this.$timeout.flush();
    this.view.find(dropdown)[timeFilter.length - 1].click();
    expect(this.view).not.toContainElement(slider);
    expect(this.view).not.toContainElement(filter);
    expect(this.view).not.toContainElement(openFilter);
    expect(this.view).toContainElement(closeCustom);
    expect(this.view).toContainElement(startDate);
    expect(this.view).toContainElement(endDate);
    expect(this.view).toContainElement(startDateMenu);
    expect(this.view).toContainElement(endDateMenu);
    expect(updateFunctions.sliderUpdate).toHaveBeenCalledTimes(2);
    expect(updateFunctions.update).toHaveBeenCalledTimes(1);

    let dateOne: string = this.view.find(startDate)[0].innerText;
    let dateTwo: string = this.view.find(endDate)[0].innerText;
    expect(dateOne).toContain('reportsPage.fromDate');
    expect(dateTwo).toContain('reportsPage.toDate');

    // change start date
    this.view.find(startDate).click();
    expect(this.view.find(startDateMenu + menuOptions).length).toEqual(51);
    this.view.find(startDateMenu + menuOptions)[6].click();
    expect(this.view.find(startDate)[0].innerText).not.toEqual(dateOne);
    expect(updateFunctions.sliderUpdate).toHaveBeenCalledTimes(3);
    expect(updateFunctions.update).toHaveBeenCalledTimes(1);

    // change end date
    this.view.find(endDate).click();
    expect(this.view.find(endDateMenu + menuOptions).length).toEqual(45);
    this.view.find(endDateMenu + menuOptions)[0].click();
    expect(this.view.find(endDate)[0].innerText).not.toEqual(dateOne);
    expect(updateFunctions.sliderUpdate).toHaveBeenCalledTimes(4);
    expect(updateFunctions.update).toHaveBeenCalledTimes(1);

    // return from custom
    this.view.find(closeCustom).click();
    expect(this.view).not.toContainElement(slider);
    expect(this.view).not.toContainElement(startDate);
    expect(this.view).not.toContainElement(endDate);
    expect(this.view).not.toContainElement(closeCustom);
    expect(this.view).not.toContainElement(startDateMenu);
    expect(this.view).not.toContainElement(endDateMenu);
    expect(this.view).toContainElement(filter);
    expect(this.view).toContainElement(openFilter);
    expect(updateFunctions.sliderUpdate).toHaveBeenCalledTimes(5);
    expect(updateFunctions.update).toHaveBeenCalledTimes(1);
  });
});
