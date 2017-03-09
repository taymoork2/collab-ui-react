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
  private readonly APPLICATION: string = 'application/';
  private readonly BEFORE: string = 'before';
  private readonly CENTER: string = 'center';
  private readonly DEFAULT: string = 'default';
  private readonly DEFAULT_MARGINS: string = 'defaultMargin';
  private readonly DOUBLE_MARGINS: string = 'doubleMargins';
  private readonly FILE_NAME: string = 'amCharts.';
  private readonly FILTER: string = 'filter';
  private readonly FOOTER: string = 'footer';
  private readonly FORTY_PERCENT: string = '40%';
  private readonly GRAY: string = 'gray';
  private readonly HEADER: string = 'header';
  private readonly JPG: string = 'jpg';
  private readonly JUSTIFY: string = 'justify';
  private readonly NO_DATA: string = 'noData';
  private readonly NUMBER: string = 'number';
  private readonly PAGE_HEADER: string = 'pageHeader';
  private readonly PNG: string = 'png';
  private readonly PDF: string = 'pdf';
  private readonly RIGHT: string = 'right';
  private readonly SIXTY_PERCENT: string = '60%';
  private readonly TEN_PERCENT: string = '10%';
  private readonly TEXT: string = 'Text';
  private readonly THIRTY_THREE_PERCENT: string = '33%';

  private get REPORT_HEADER(): any {
    return {
      text: this.$translate.instant('reportsPage.pageTitle'),
      style: [this.PAGE_HEADER, this.DEFAULT_MARGINS],
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

  get PDF_STYLES(): any {
    let pdfStyles: any = {};

    pdfStyles[this.DEFAULT] = {
      fontSize: 10,
      color: this.chartColors.grayDarkFour,
    };
    pdfStyles[this.DEFAULT_MARGINS] = {
      margin: [0, 0, 0, this.MARGIN],
    };
    pdfStyles[this.DOUBLE_MARGINS] = {
      margin: [0, this.MARGIN, 0, this.MARGIN],
    };
    pdfStyles[this.ReportConstants.FAIR] = {
      color: this.chartColors.attentionBase,
    };
    pdfStyles[this.FILTER] = {
      fontSize: 10,
    };
    pdfStyles[this.FOOTER] = {
      margin: [0, 0, 25, 0],
    };
    pdfStyles[this.GRAY] = {
      color: this.chartColors.grayLightOne,
    };
    pdfStyles[this.ReportConstants.GOOD] = {
      color: this.chartColors.primaryBase,
    };
    pdfStyles[this.HEADER] = {
      fontSize: 18,
      lineHeight: 1,
      margin: [0, this.MARGIN, 0, this.MARGIN],
      color: this.chartColors.grayDarkFour,
    };
    pdfStyles['mediaText'] = {
      fontSize: 12,
      color: this.chartColors.grayLightOne,
    };
    pdfStyles['metricsText'] = {
      fontSize: 12,
      color: this.chartColors.grayLightOne,
    };
    pdfStyles[this.NO_DATA] = {
      fontSize: 12,
      color: this.chartColors.grayDarkFour,
    };
    pdfStyles[this.NUMBER] = {
      fontSize: 18,
    };
    pdfStyles[this.PAGE_HEADER] = {
      color: this.chartColors.peopleBase,
      fontSize: 28,
      lineHeight: 1,
    };
    pdfStyles[this.ReportConstants.POOR] = {
      color: this.chartColors.negativeBase,
    };

    return pdfStyles;
  }

  // Full Page Export Functions
  public printCustomerPage(typeFilter: string, timeFilter: ITimespan, minMax: IMinMax, charts: ICharts, chartData: ICharts, chartFilters: ICharts, chartLabels: ICharts): void {
    let layout: any = {
      content: [this.REPORT_HEADER, this.REPORT_LINE],
      footer: (page: number): any => {
        return {
          alignment: this.RIGHT,
          text: page.toString(),
          style: [this.FOOTER],
        };
      },
      styles: this.PDF_STYLES,
    };

    let typeFilters: any = {
      columns: [],
      columnGap: this.COLUMN_GAP_SMALL,
      width: this.FORTY_PERCENT,
    };
    _.forEach(this.REPORT_TYPE_FILTERS, (filter: string): void => {
      let pageFilter: any;

      if (filter === typeFilter) {
        pageFilter = {
          text: this.$translate.instant('reportsPage.' + filter),
          style: [this.ReportConstants.GOOD, this.FILTER],
          width: this.FORTY_PERCENT,
        };
      } else {{
        pageFilter = {
          text: this.$translate.instant('reportsPage.' + filter),
          style: [this.DEFAULT],
          width: this.FORTY_PERCENT,
        };
      }}

      // 'All' requires less space than 'Engagement' or 'Quality'
      if (filter === this.REPORT_TYPE_FILTERS[0]) {
        pageFilter.width = this.TEN_PERCENT;
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
        text: this.$translate.instant('reportsPage.timeSelected') + this.DATE_ARRAY[minMax.min].date + ' - ' + this.DATE_ARRAY[minMax.max].date,
        style: [this.DEFAULT],
        width: this.SIXTY_PERCENT,
      });
    } else {
      subHeader.columns.push({
        alignment: this.RIGHT,
        text: this.$translate.instant('reportsPage.timeSelected') + timeFilter.label,
        style: [this.DEFAULT],
        width: this.SIXTY_PERCENT,
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
        charts.active.export.download(downloadData, this.APPLICATION + this.PDF, this.FILE_NAME + this.PDF);
      });
    });
  }

  private createReport(key: string, timeFilter: ITimespan, chart: any, chartData: IReportCard, chartFilter: IReportDropdown | undefined, chartLabels: Array<IReportLabel> | undefined, pagebreaks: ICharts): ng.IPromise<Array<any>> {
    let report: Array<any> = [{
      text: this.$translate.instant(chartData.headerTitle),
      style: [this.HEADER],
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
        if (chartData.state !== this.ReportConstants.SET) {
          report.push({
            text: this.$translate.instant('reportsPage.noCustomerData'),
            alignment: this.CENTER,
            style: [this.NO_DATA],
          });
        }
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
              style: [this.NUMBER, this.GRAY],
            };
          } else {
            numberText = {
              text: label.number.toString(),
              style: [this.NUMBER, label.class],
            };
          }

          labelColumns.columns.push({
            width: this.THIRTY_THREE_PERCENT,
            stack: [numberText, {
              text: this.$translate.instant(label.text),
              style: [key + this.TEXT],
            }],
            alignment: this.CENTER,
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
      id: this.JPG,
      label: this.$translate.instant('reportsPage.jpg'),
      click: (): void => {
        this.exportJPG(chart);
      },
    }, {
      id: this.PNG,
      label: this.$translate.instant('reportsPage.png'),
      click: (): void => {
        this.exportPNG(chart);
      },
    }, {
      id: this.PDF,
      label: this.$translate.instant('reportsPage.pdf'),
      click: (): void => {
        this.exportPDF(chart);
      },
    }];
  }

  private exportJPG(chart: any): void {
    if (chart) {
      chart.export.capture({}, (): void => {
        chart.export.toJPG({}, (data: any): void => {
          chart.export.download(data, this.APPLICATION + this.JPG, this.FILE_NAME + this.JPG);
        });
      });
    }
  }

  private exportPNG(chart: any): void {
    if (chart) {
      chart.export.capture({}, (): void => {
        chart.export.toPNG({}, (data: any): void => {
          chart.export.download(data, this.APPLICATION + this.PNG, this.FILE_NAME + this.PNG);
        });
      });
    }
  }

  private exportPDF(chart: any): void {
    if (chart) {
      chart.export.capture({}, (): void => {
        chart.export.toJPG({}, (data: any): void => {
          chart.export.toPDF({
            content: [{
              image: data,
              fit: [524, 300],
            }],
          }, (downloadData: any): void => {
            chart.export.download(downloadData, this.APPLICATION + this.PDF, this.FILE_NAME + this.PDF);
          });
        });
      });
    }
  }

  // Helper Functions
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
