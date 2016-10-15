import {
  IFilterObject,
} from '../partnerReportInterfaces';

class ReportFilterCtrl {
  public filterArray: Array<IFilterObject>;
  private open: boolean = false;

  /* @ngInject */
  constructor(
    // cannot access breakpoint when rootscope is typed with ng.IRootScopeService
    private $rootScope
  ) {}

  public getBreakpoint(): string {
    return this.$rootScope.breakpoint;
  }

  public toggleOpen(): void {
    this.open = !this.open;
  }

  public isOpen(): boolean {
    return this.open;
  }

  public select(filterObject: IFilterObject): void {
    let location = _.findIndex(this.filterArray, filterObject);
    if (location > -1) {
      _.forEach(this.filterArray, (object, index) => {
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

angular.module('Core')
  .component('reportFilter', {
    templateUrl: 'modules/core/partnerReports/reportFilter/reportFilter.tpl.html',
    controller: ReportFilterCtrl,
    bindings: {
      filterArray: '<',
    },
});
