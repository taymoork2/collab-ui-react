import { CommonReportService } from './commonReport.service';
import { ReportConstants } from './reportConstants.service';
import { ChartColors } from '../../config/chartColors';
import {
  IExportMenu,
  IReportCard,
  IReportDropdown,
  IReportLabel,
  ITimespan,
} from '../partnerReportInterfaces';
import {
  ICharts,
  IMinMax,
} from '../../customerReports/sparkReports/sparkReportInterfaces';

export class ReportPrintService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
    private chartColors: ChartColors,
  ) {}

  // Array Constants
  private readonly DATE_ARRAY: Array<any> = this.CommonReportService.getReturnLineGraph(this.ReportConstants.THREE_MONTH_FILTER, { date: '' });
  private readonly REPORT_TYPE_FILTERS: Array<string> = [this.ReportConstants.ALL, this.ReportConstants.ENGAGEMENT, this.ReportConstants.QUALITY];

  // Numerical Constants
  private readonly REPORT_WIDTH: number = 515;
  private readonly REPORT_HEIGHT: number = 300;
  private readonly COLUMN_GAP_SMALL: number = 15;
  private readonly MARGIN: number = 8;

  // String Constants
  private readonly BEFORE: string = 'before';
  private readonly DEFAULT: string = 'default';
  private readonly DEFAULT_MARGINS: string = 'defaultMargin';
  private readonly DOUBLE_MARGINS: string = 'doubleMargins';
  private readonly JUSTIFY: string = 'justify';
  private readonly RIGHT: string = 'right';

  private get REPORT_HEADER(): any {
    return {
      text: this.$translate.instant('reportsPage.pageTitle'),
      style: ['pageHeader', this.DEFAULT_MARGINS],
    };
  }

  private readonly REPORT_LINE: any = {
    canvas: [{
      type: 'line',
      x1: 0,
      y1: 0,
      x2: this.REPORT_WIDTH,
      y2: 0,
      lineWidth: 0.25,
    }],
  };

  private readonly PDF_STYLES: any = {
    default: {
      fontSize: 10,
    },
    defaultMargin: {
      margin: [0, 0, 0, this.MARGIN],
    },
    footer: {
      margin: [0, 0, 25, 0],
    },
    header: {
      fontSize: 18,
      lineHeight: 1,
      margin: [0, this.MARGIN, 0, this.MARGIN],
    },
    pageHeader: {
      color: this.chartColors.peopleBase,
      fontSize: 28,
      lineHeight: 1,
    },
    good: {
      color: this.chartColors.primaryBase,
    },
    fair: {
      color: this.chartColors.attentionBase,
    },
    poor: {
      color: this.chartColors.negativeBase,
    },
    gray: {
      color: this.chartColors.grayLightOne,
    },
    mediaText: {
      fontSize: 12,
      color: this.chartColors.grayLightOne,
    },
    number: {
      fontSize: 18,
    },
    metricsText: {
      fontSize: 12,
      color: this.chartColors.grayLightOne,
    },
    doubleMargins: {
      margin: [0, this.MARGIN, 0, this.MARGIN],
    },
  };

  // Full Page Export Functions
  public printCustomerPage(typeFilter: string, timeFilter: ITimespan, minMax: IMinMax, charts: ICharts, chartData: ICharts, chartFilters: ICharts, chartLabels: ICharts): void {
    let layout: any = {
      content: [this.REPORT_HEADER, this.REPORT_LINE],
      footer: (page: number): any => {
        return {
          alignment: this.RIGHT,
          text: page.toString(),
          style: ['footer'],
        };
      },
      styles: this.PDF_STYLES,
    };

    let typeFilters: any = {
      columns: [],
      columnGap: this.COLUMN_GAP_SMALL,
      width: '40%',
    };
    _.forEach(this.REPORT_TYPE_FILTERS, (filter: string): void => {
      let pageFilter: any = {
        text: this.$translate.instant('reportsPage.' + filter),
        style: [this.DEFAULT],
        width: '40%',
      };

      // 'All' requires less space than 'Engagement' or 'Quality'
      if (filter === this.REPORT_TYPE_FILTERS[0]) {
        pageFilter.width = '10%';
      }

      if (filter === typeFilter) {
        pageFilter.style.push('good');
      }

      typeFilters.columns.push(pageFilter);
    });

    let subHeader: any = {
      columns: [typeFilters],
      style: [this.DOUBLE_MARGINS],
    };

    if (timeFilter.value === this.ReportConstants.CUSTOM_FILTER.value) {
      subHeader.columns.push({
        alignment: this.RIGHT,
        text: this.$translate.instant('reportsPage.timeSelected') + this.getDate(minMax.min) + ' - ' + this.getDate(minMax.max),
        style: [this.DEFAULT, 'filter'],
        width: '60%',
      });
    } else {
      subHeader.columns.push({
        alignment: this.RIGHT,
        text: this.$translate.instant('reportsPage.timeSelected') + timeFilter.label,
        style: [this.DEFAULT, 'filter'],
        width: '60%',
      });
    }

    layout.content.push(subHeader);
    let bottomLine: any = _.cloneDeep(this.REPORT_LINE);
    bottomLine.style = [this.DEFAULT_MARGINS];
    layout.content.push(bottomLine);

    let promises: Array<any> = [];
    let reports: ICharts = {
      active: undefined,
      rooms: undefined,
      files: undefined,
      media: undefined,
      device: undefined,
      metrics: undefined,
    };

    let pagebreaks: ICharts = this.getPagebreaks();

    _.forEach(charts, (chart: any, key: string): void => {
      let promise = this.createReport(key, timeFilter, chart, chartData[key], chartFilters[key], chartLabels[key], pagebreaks).then((response: Array<any>) => {
        reports[key] = response;
        return;
      });
      promises.push(promise);
    });

    this.$q.all(promises).then((): void => {
      // Engagement Graphs
      if (typeFilter === this.REPORT_TYPE_FILTERS[0] || typeFilter === this.REPORT_TYPE_FILTERS[1]) {
        layout.content.push(reports.rooms);
        layout.content.push(reports.active);
        layout.content.push(reports.files);
        layout.content.push(reports.device);
      }

      // Quality Graphs
      if (typeFilter === this.REPORT_TYPE_FILTERS[0] || typeFilter === this.REPORT_TYPE_FILTERS[2]) {
        layout.content.push(reports.media);
        layout.content.push(reports.metrics);
      }

      charts.active.export.toPDF(layout, (downloadData: any): void => {
        charts.active.export.download(downloadData, 'application/pdf', 'amCharts.pdf');
      });
    });
  }

  private createReport(key: string, timeFilter: ITimespan, chart: any, chartData: IReportCard, chartFilter: IReportDropdown | undefined, chartLabels: Array<IReportLabel> | undefined, pagebreaks: ICharts): ng.IPromise<Array<any>> {
    let report: Array<any> = [{
      text: this.$translate.instant(chartData.headerTitle),
      style: ['header'],
      pageBreak: pagebreaks[key],
    }];

    report.push({
      alignment: this.JUSTIFY,
      text: this.getDescription(chartData.description, timeFilter),
      style: [this.DEFAULT, this.DEFAULT_MARGINS],
    });

    // Include Chart Filter to make Graph Display Information obvious
    if (chartFilter) {
      report.push({
        alignment: this.RIGHT,
        text: this.$translate.instant('reportsPage.selectedReportFilter') + chartFilter.selected.label,
        style: [this.DEFAULT, this.DEFAULT_MARGINS],
      });
    }

    let captured: ng.IDeferred<{}> = this.$q.defer();
    chart.export.capture({}, (): void => {
      chart.export.toJPG({}, (data: any): void => {
        report.push({
          image: data,
          fit: [this.REPORT_WIDTH, this.REPORT_HEIGHT],
        });
        captured.resolve();
      });
    });

    return captured.promise.then((): Array<any> => {
      if (chartLabels) {
        let labelColumns: any = {
          columns: [],
          columnGap: this.COLUMN_GAP_SMALL,
          style: [this.DOUBLE_MARGINS],
        };

        _.forEach(chartLabels, (label: IReportLabel): void => {
          let numberText: any;
          if (label.hidden || _.isUndefined(label.class)) {
            numberText = {
              text: label.number.toString(),
              style: ['number', 'gray'],
            };
          } else {
            numberText = {
              text: label.number.toString(),
              style: ['number', label.class],
            };
          }

          labelColumns.columns.push({
            width: '33%',
            stack: [numberText, {
              text: this.$translate.instant(label.text),
              style: [key + 'Text'],
            }],
            alignment: 'center',
          });
        });

        report.push(labelColumns);
      }

      return report;
    });
  }

  // Single Report Export Functions
  public createExportMenu(chart: any): Array<IExportMenu> {
    return [{
      id: 'saveAs',
      label: this.$translate.instant('reportsPage.saveAs'),
      click: undefined,
    }, {
      id: 'jpg',
      label: this.$translate.instant('reportsPage.jpg'),
      click: (): void => {
        this.exportJPG(chart);
      },
    }, {
      id: 'png',
      label: this.$translate.instant('reportsPage.png'),
      click: (): void => {
        this.exportPNG(chart);
      },
    }, {
      id: 'pdf',
      label: this.$translate.instant('reportsPage.pdf'),
      click: (): void => {
        this.exportPDF(chart);
      },
    }];
  }

  private exportJPG(chart: any): void {
    if (chart) {
      // 'this' is the AmCharts export object
      chart.export.capture({}, function (): void {
        this.toJPG({}, function (data: any): void {
          this.download(data, 'application/jpg', 'amCharts.jpg');
        });
      });
    }
  }

  private exportPNG(chart: any): void {
    if (chart) {
      // 'this' is the AmCharts export object
      chart.export.capture({}, function (): void {
        this.toPNG({}, function (data: any): void {
          this.download(data, 'application/png', 'amCharts.png');
        });
      });
    }
  }

  private exportPDF(chart: any): void {
    if (chart) {
      // 'this' is the AmCharts export object
      chart.export.capture({}, function (): void {
        this.toJPG({}, function (data: any): void {
          chart.export.toPDF({
            content: [{
              image: data,
              fit: [524, 300],
            }],
          }, function (downloadData: any): void {
            this.download(downloadData, 'application/pdf', 'amCharts.pdf');
          });
        });
      });
    }
  }

  // Helper Functions
  private getDate(index: number): string {
    return this.DATE_ARRAY[index].date;
  }

  private getDescription(text: string, timeFilter: ITimespan): string {
    return this.$translate.instant(text, {
      time: timeFilter['description'],
    });
  }

  private getPagebreaks(): ICharts {
    return {
      active: this.BEFORE,
      rooms: undefined,
      files: undefined,
      media: undefined,
      device: this.BEFORE,
      metrics: this.BEFORE,
    };
  }
}

angular.module('Core')
  .service('ReportPrintService', ReportPrintService);
