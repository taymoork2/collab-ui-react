import './reports.scss';

class CcaReports implements ng.IComponentController {

  public data = {};
  public loading: boolean = true;

  /* @ngInject */
  public constructor(
    private $stateParams: ng.ui.IStateParamsService,
  ) {}

  public $onInit(): void {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    this.loading = true;
    const { reportChartData } = changes;
    const chartData = _.get(reportChartData, 'currentValue');
    if (!chartData) {
      return;
    }
    this.loading = false;
    this.data = _.get(chartData, _.get(this.$stateParams, 'name'));
  }

}

export class CcaReportsComponent implements ng.IComponentOptions {
  public controller = CcaReports;
  public bindings = { reportChartData: '<' };
  public template = require('modules/gemini/reports/ccaReports.html');
}
