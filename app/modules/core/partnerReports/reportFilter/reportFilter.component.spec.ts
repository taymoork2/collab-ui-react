import {
  IFilterObject,
} from '../partnerReportInterfaces';

describe('Component: reportFilter', () => {
  let ctrlData: any = getJSONFixture('core/json/partnerReports/ctrl.json');
  let reportFilter: Array<IFilterObject> = _.cloneDeep(ctrlData.reportFilter);
  _.forEach(reportFilter, function (filter, index) {
    filter.toggle = jasmine.createSpy('toggle' + index);
  });

  // html selectors
  const NAME = ' span.name';
  const DROPDOWN = 'div.grid-filter div.dropdown-toggle.filter';
  const DROPDOWN_TEXT = DROPDOWN + NAME;
  const DROPDOWN_ICON = DROPDOWN + ' i.icon.icon-chevron-down';
  const MENU = 'div.grid-filter ul';
  const MENU_ITEMS = MENU + ' li.filter';

  // screen sizes
  const SCREEN_LG = 'screen-lg';
  const SCREEN_XS = 'screen-xs';

  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies('$rootScope', '$scope', '$timeout');
    this.$scope.reportFilter = reportFilter;
  });

  it('should display as expanded filter on normal sized screen; toggling should work as expected', function () {
    this.$rootScope.breakpoint = SCREEN_LG;
    this.compileComponent('reportFilter', {
      filterArray: 'reportFilter',
    });

    // should not display the dropdown view on a non-small screen
    expect(this.view).not.toContainElement(DROPDOWN);

    // should display the All/Engagement/Quality filters & clicking filters should call toggle functions //dropdown-menu dropdown-primary
    expect(this.view.find(MENU)).not.toHaveClass('dropdown-menu');
    expect(this.view.find(MENU)).not.toHaveClass('dropdown-primary');
    expect(this.view.find(MENU)).not.toHaveClass('visible-report-filter');
    let view = this.view;
    _.forEachRight(reportFilter, function (filter: IFilterObject, index: number): void {
      expect(view.find(MENU_ITEMS + NAME)[index]).toHaveText(filter.label);
      expect(filter.toggle).toHaveBeenCalledTimes(0);
      expect(view.find(MENU_ITEMS)[index]).toContainElement('#' + filter.id);
      view.find(MENU_ITEMS)[index].click();
      expect(filter.toggle).toHaveBeenCalledTimes(1);
    });
  });

  it('should display as dropdown filter on screen-xs screen; toggling should work as expected', function () {
    this.$rootScope.breakpoint = SCREEN_XS;
    this.compileComponent('reportFilter', {
      filterArray: 'reportFilter',
    });

    // should display default selection in dropdown
    expect(this.view).toContainElement(DROPDOWN);
    expect(this.view).toContainElement(DROPDOWN_TEXT);
    expect(this.view.find(DROPDOWN_TEXT)).toHaveText(reportFilter[0].label);
    expect(this.view).toContainElement(DROPDOWN_ICON);
    expect(this.view.find(MENU)).toHaveClass('dropdown-menu');
    expect(this.view.find(MENU)).toHaveClass('dropdown-primary');
    expect(this.view.find(MENU)).not.toHaveClass('visible-report-filter');

    // clicking filters in the menu should change the displayed option in the dropdown and call toggle functions
    let view = this.view;
    _.forEachRight(reportFilter, function (filter: IFilterObject, index: number): void {
      view.find(DROPDOWN).click();
      expect(view.find(MENU)).toHaveClass('visible-report-filter');
      expect(view.find(MENU_ITEMS + NAME)[index]).toHaveText(filter.label);
      expect(filter.toggle).toHaveBeenCalledTimes(1);
      expect(view.find(MENU_ITEMS)[index]).toContainElement('#' + filter.id);
      view.find(MENU_ITEMS)[index].click();
      expect(filter.toggle).toHaveBeenCalledTimes(2);
      expect(view.find(MENU)).not.toHaveClass('visible-report-filter');
      expect(view.find(DROPDOWN_TEXT)).toHaveText(filter.label);
    });
  });
});
