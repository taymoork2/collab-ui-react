import './reports.scss';
import { ReportsChartService } from './reportsChartService';
import { SearchService } from 'modules/core/customerReports/webexReports/diagnostic/searchService';

class ReportsChart implements ng.IComponentController {
  public size;
  public chartId;
  public provideData;
  public title: string;
  public exportMenu: boolean = false;
  public threeDotsEnable: boolean = false;

  /* @ngInject */
  public constructor(
    private Utils,
    private SearchService: SearchService,
    private $timeout: ng.ITimeoutService,
    private ReportsChartService: ReportsChartService,
  ) {
    this.chartId = this.Utils.getUUID();
  }

  public $onInit(): void {

    if (this.size === 'large') {
      this.chartId = `large_${this.chartId}`;
      this.largeChart();
    }
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { provideData } = changes;

    if (provideData && _.get(provideData, 'currentValue')) {
      this.provideData = _.get(provideData, 'currentValue');
      const unit = _.size(this.provideData.data.unit) ? ` (IN ${_.get(this.provideData, 'data.unit')})` : '';
      this.title = _.get(this.provideData, 'title') + unit;
      this.threeDotsEnable = !!_.size(this.provideData.data.chart);
      const data = this.preData(this.provideData);
      this.$timeout(() => this.ReportsChartService.AmchartsMakeChart(this.chartId, data));
    }
  }

  public toggleExportMenu(): void {
    this.exportMenu = !this.exportMenu;
  }

  private largeChart() {
    const largeChartData = this.SearchService.getStorage('largeChartData');
    this.title = _.get(largeChartData, 'title');
    const data = this.preData(largeChartData);
    this.$timeout(() => this.ReportsChartService.smallToLarge(this.chartId, data));
  }

  private preData(data) {
    const data_ = _.cloneDeep(data.data);
    _.set(data_, 'type', data.type);
    _.map(data_.chart, (item) => this.square(item));

    return data_;
  }

  private square(item) {
    _.mapKeys(item, (value: any, key: any) => {
      if (key === 'point' || key === 'time') {
        return;
      }
      _.set(item, key, _.round(value, 2));
    });
  }
}

export class CustChartComponent implements ng.IComponentOptions {
  public controller = ReportsChart;
  public template = require('modules/gemini/reports/chart.html');
  public bindings = { provideData: '<', close: '&', size: '@' };
}
