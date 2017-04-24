import reportFilter from './index';
import { IFilterObject } from '../partnerReportInterfaces';

describe('Component: reportFilter', () => {
  beforeEach(function () {
    this.initModules(reportFilter);
    this.injectDependencies('$rootScope', '$scope', '$componentController');

    this.ctrlData = getJSONFixture('core/json/partnerReports/ctrl.json');
    this.reportFilter = _.cloneDeep(this.ctrlData.reportFilter);
    _.forEach(this.reportFilter, (filter: IFilterObject, index) => {
      filter.toggle = jasmine.createSpy('toggle' + index);
    });

    this.$rootScope.breakpoint = this.ctrlData.SCREEN_LG;

    this.controller = this.$componentController('reportFilter', {
      $scope: this.$scope,
      $rootScope: this.$rootScope,
    }, { filterArray: this.reportFilter });
    this.$scope.$apply();
  });

  it('should initiallizes with expected defaults', function () {
    expect(this.controller.filterArray).toEqual(this.reportFilter);
    expect(this.controller.isOpen()).toBeFalsy();
  });

  it('toggleOpen - should change toggle whether menu is open', function () {
    this.controller.toggleOpen();
    expect(this.controller.isOpen()).toBeTruthy();
  });

  it('getBreakpoint - should only return false for large screens', function () {
    expect(this.controller.getBreakpoint()).toBeFalsy();

    this.$rootScope.breakpoint = this.ctrlData.SCREEN_XS;
    expect(this.controller.getBreakpoint()).toBeTruthy();

    this.$rootScope.breakpoint = this.ctrlData.SCREEN_SM;
    expect(this.controller.getBreakpoint()).toBeTruthy();

    this.$rootScope.breakpoint = this.ctrlData.SCREEN_MD;
    expect(this.controller.getBreakpoint()).toBeTruthy();
  });

  it('select - should change from default selection to new selection', function () {
    const checkSelect = (selectedIndex: number): void => {
      _.forEach(this.controller.filterArray, (object: IFilterObject, index: number): void => {
        if (index === selectedIndex) {
          expect(object.selected).toBeTruthy();
        } else {
          expect(object.selected).toBeFalsy();
        }
      });
    };
    checkSelect(0);

    this.controller.select(this.reportFilter[1]);
    expect(this.reportFilter[1].toggle).toHaveBeenCalled();
    checkSelect(1);
  });
});
