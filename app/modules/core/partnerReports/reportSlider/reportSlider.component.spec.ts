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

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$scope', '$timeout');
    this.$scope.selected = timeFilter[0];
    this.$scope.options = timeFilter;
    this.$scope.updateFunctions = updateFunctions;

    this.compileComponent('reportSlider', {
      selected: 'selected',
      options: 'options',
      updateFunctions: 'updateFunctions',
    });
  });

  it('it should call the appropriate update functions for preset time ranges and custom time ranges', function () {
    expect(this.view).not.toContainElement(slider);
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
  });
});
