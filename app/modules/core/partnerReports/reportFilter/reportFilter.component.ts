import { IFilterObject } from '../partnerReportInterfaces';

class ReportFilterCtrl {
  public filterArray: IFilterObject[];
  private open: boolean = false;

  /* @ngInject */
  constructor(
    // cannot access breakpoint when rootscope is typed with ng.IRootScopeService
    private $rootScope,
  ) {}

  public getBreakpoint(): boolean {
    return this.$rootScope.breakpoint === 'screen-xs' || this.$rootScope.breakpoint === 'screen-sm' || this.$rootScope.breakpoint === 'screen-md';
  }

  public toggleOpen(): void {
    this.open = !this.open;
  }

  public isOpen(): boolean {
    return this.open;
  }

  public select(filterObject: IFilterObject): void {
    const location = _.findIndex(this.filterArray, filterObject);
    if (location > -1) {
      _.forEach(this.filterArray, (object: IFilterObject, index: number): void => {
        if (index === location) {
          object.selected = true;
        } else {
          object.selected = false;
        }
      });
    }
    this.open = false;
    if (filterObject.toggle) {
      filterObject.toggle();
    }
  }
}

export class ReportFilterComponent implements ng.IComponentOptions {
  public template = require('modules/core/partnerReports/reportFilter/reportFilter.tpl.html');
  public controller = ReportFilterCtrl;
  public bindings = {
    filterArray: '<',
  };
}
