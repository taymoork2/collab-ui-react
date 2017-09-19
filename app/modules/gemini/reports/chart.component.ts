import './reports.scss';
import { IToolkitModalService } from 'modules/core/modal';
import { ReportsChartService } from './reportsChartService';
import { SearchService } from 'modules/core/customerReports/webexReports/search/searchService';

class ReportsChart implements ng.IComponentController {
  public size;
  public chartId;
  public zoomEnable;
  public provideData;
  public title: string;

  /* @ngInject */
  public constructor(
    private Utils,
    private SearchService: SearchService,
    private $modal: IToolkitModalService,
    private $timeout: ng.ITimeoutService,
    private ReportsChartService: ReportsChartService,
  ) {
    this.chartId = this.Utils.getUUID();
  }

  public $onInit(): void {

    if (this.size === 'large') {
      this.largeChart();
    }
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { provideData } = changes;

    if (provideData && _.get(provideData, 'currentValue')) {
      this.provideData = _.get(provideData, 'currentValue');
      this.title = _.get(this.provideData, 'title');
      this.zoomEnable = _.size(this.provideData.data.chart);
      const data = this.preData(this.provideData);
      this.$timeout(() => this.ReportsChartService.AmchartsMakeChart(this.chartId, data));
    }
  }

  public onZoom() {
    this.SearchService.setStorage('largeChartData', this.provideData);
    this.$modal.open({
      type: 'full',
      template: '<cca-chart close="$close()" size="large" class="large-chart" ></cca-chart>',
    });
  }

  private largeChart() {
    const largeChartData = this.SearchService.getStorage('largeChartData');
    this.title = _.get(largeChartData, 'title');
    const data = this.preData(largeChartData);
    this.ReportsChartService.smallToLarge('large_chart_content', data);
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
  public templateUrl = 'modules/gemini/reports/chart.html';
  public bindings = { provideData: '<', close: '&', size: '@' };
}
