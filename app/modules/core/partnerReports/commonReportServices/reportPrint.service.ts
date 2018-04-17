import { CommonGraphService } from './commonGraph.service';
import { CommonReportService } from './commonReport.service';
import { ReportConstants } from './reportConstants.service';
import { ChartColors } from '../../config/chartColors';
import {
  IEndpointData,
  IExportDropdown,
  IReportCard,
  IReportDropdown,
  IReportsHeader,
  IReportLabel,
  ITimespan,
  IPartnerCharts,
} from '../partnerReportInterfaces';
import {
  ICharts,
  IMinMax,
} from '../../customerReports/sparkReports/sparkReportInterfaces';
import {
  IPDFMakeContent,
  IPDFMakeLayout,
} from './pdfMakeInterfaces';

export class ReportPrintService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $q: ng.IQService,
    private CommonGraphService: CommonGraphService,
    private CommonReportService: CommonReportService,
    private ReportConstants: ReportConstants,
  ) {}

  // Array Constants
  private readonly DATE_ARRAY: any[] = this.CommonReportService.getReturnLineGraph(this.ReportConstants.THREE_MONTH_FILTER, { date: '' });
  private readonly REPORT_TYPE_FILTERS: string[] = [this.ReportConstants.ALL, this.ReportConstants.ENGAGEMENT, this.ReportConstants.QUALITY];
  private readonly TABLE_STYLES: string[] = [this.ReportConstants.CUSTOMER_DATA, this.ReportConstants.HORIZONTAL_CENTER, this.ReportConstants.NEGATIVE, this.ReportConstants.POSITIVE];

  // Numerical Constants
  private readonly REPORT_WIDTH: number = 515;
  private readonly REPORT_HEIGHT: number = 300;
  private readonly COLUMN_GAP_SMALL: number = 15;
  private readonly MARGIN: number = 8;
  private readonly LINE_WIDTH: number = 0.25;

  // String Constants
  private readonly APPLICATION: string = 'application/';
  private readonly BEFORE: string = 'before';
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
  private readonly TWENTY_PERCENT: string = '20%';

  private get REPORT_HEADER(): IPDFMakeContent {
    return {
      text: this.$translate.instant('reportsPage.pageTitle'),
      style: [this.PAGE_HEADER, this.DEFAULT_MARGINS],
    };
  }

  private readonly REPORT_LINE: IPDFMakeContent = {
    canvas: [{
      type: this.CommonGraphService.LINE,
      x1: 0,
      y1: 0,
      x2: this.REPORT_WIDTH,
      y2: 0,
      lineWidth: this.LINE_WIDTH,
    }],
  };

  get PDF_STYLES(): any {
    const pdfStyles: any = {};

    pdfStyles[this.ReportConstants.CUSTOMER_DATA] = {
      margin: [0, this.MARGIN, 0, this.MARGIN],
    };
    pdfStyles[this.DEFAULT] = {
      fontSize: 10,
      color: ChartColors.grayDarkFour,
    };
    pdfStyles[this.DEFAULT_MARGINS] = {
      margin: [0, 0, 0, this.MARGIN],
    };
    pdfStyles[this.DOUBLE_MARGINS] = {
      margin: [0, this.MARGIN, 0, this.MARGIN],
    };
    pdfStyles[this.ReportConstants.FAIR] = {
      color: ChartColors.attentionBase,
    };
    pdfStyles[this.FILTER] = {
      fontSize: 10,
    };
    pdfStyles[this.FOOTER] = {
      margin: [0, 0, 25, 0],
    };
    pdfStyles[this.GRAY] = {
      color: ChartColors.grayLightOne,
    };
    pdfStyles[this.ReportConstants.GOOD] = {
      color: ChartColors.primaryBase,
    };
    pdfStyles[this.HEADER] = {
      fontSize: 18,
      lineHeight: 1,
      margin: [0, this.MARGIN, 0, this.MARGIN],
      color: ChartColors.grayDarkFour,
    };
    pdfStyles[this.ReportConstants.HORIZONTAL_CENTER] = {
      alignment: this.CommonGraphService.CENTER,
      margin: [0, this.MARGIN, 0, this.MARGIN],
    };
    pdfStyles['mediaText'] = {
      fontSize: 12,
      color: ChartColors.grayLightOne,
    };
    pdfStyles['metricsText'] = {
      fontSize: 12,
      color: ChartColors.grayLightOne,
    };
    pdfStyles[this.ReportConstants.NEGATIVE] = {
      color: ChartColors.negativeBase,
    };
    pdfStyles[this.NO_DATA] = {
      fontSize: 12,
      color: ChartColors.grayDarkFour,
    };
    pdfStyles[this.NUMBER] = {
      fontSize: 18,
    };
    pdfStyles[this.PAGE_HEADER] = {
      color: ChartColors.peopleBase,
      fontSize: 28,
      lineHeight: 1,
    };
    pdfStyles[this.ReportConstants.POOR] = {
      color: ChartColors.negativeBase,
    };
    pdfStyles[this.ReportConstants.POSITIVE] = {
      color: ChartColors.ctaBase,
    };

    return pdfStyles;
  }

  // Full Page Export Functions
  public printCustomerPage(typeFilter: string, timeFilter: ITimespan, minMax: IMinMax, charts: ICharts, chartData: ICharts, chartFilters: ICharts, chartLabels: ICharts): void {
    const layout: IPDFMakeLayout = this.createStarterLayout(typeFilter, timeFilter, minMax);
    const promises: any[] = [];
    const reports: ICharts = {};
    const pagebreaks: ICharts = this.getPagebreaks(true);

    _.forEach(charts, (chart: any, key: string): void => {
      const promise = this.createReport(key, timeFilter, chart, chartData[key], chartFilters[key], chartLabels[key], pagebreaks[key]).then((response: IPDFMakeContent[]) => {
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

  public printPartnerPage(typeFilter: string, timeFilter: ITimespan, charts: IPartnerCharts, chartData: IPartnerCharts): void {
    const layout: IPDFMakeLayout = this.createStarterLayout(typeFilter, timeFilter, undefined);
    const promises: any[] = [];
    const reports: IPartnerCharts = {};
    const pagebreaks: IPartnerCharts = this.getPagebreaks(false);

    _.forEach(chartData, (data: IReportCard, key: string): void => {
      const promise = this.createPartnerReport(timeFilter, charts[key], data, pagebreaks[key]).then((response: IPDFMakeContent[]) => {
        reports[key] = response;
        return;
      });
      promises.push(promise);
    });

    this.$q.all(promises).then((): void => {
      // Engagement Graphs
      if (typeFilter === this.REPORT_TYPE_FILTERS[0] || typeFilter === this.REPORT_TYPE_FILTERS[1]) {
        layout.content.push(reports.active);
        layout.content.push(reports.population);
        layout.content.push(reports.devices);
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

  private createStarterLayout(typeFilter: string, timeFilter: ITimespan, minMax: IMinMax | undefined): IPDFMakeLayout {
    const layout: IPDFMakeLayout = {
      content: [this.REPORT_HEADER, this.REPORT_LINE],
      footer: (page: number): IPDFMakeContent => {
        return {
          alignment: this.RIGHT,
          text: page.toString(),
          style: [this.FOOTER],
        };
      },
      styles: this.PDF_STYLES,
    };

    const typeFilters: IPDFMakeContent[] = [];
    _.forEach(this.REPORT_TYPE_FILTERS, (filter: string): void => {
      let pageFilter: IPDFMakeContent;

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

      typeFilters.push(pageFilter);
    });

    const subHeader: IPDFMakeContent = {
      columns: [{
        columns: typeFilters,
        columnGap: this.COLUMN_GAP_SMALL,
        width: this.FORTY_PERCENT,
      }],
      style: [this.DOUBLE_MARGINS],
    };

    if (timeFilter.value === this.ReportConstants.CUSTOM_FILTER.value && minMax && subHeader.columns) {
      subHeader.columns.push({
        alignment: this.RIGHT,
        text: this.$translate.instant('reportsPage.timeSelected') + this.DATE_ARRAY[minMax.min].date + ' - ' + this.DATE_ARRAY[minMax.max].date,
        style: [this.DEFAULT],
        width: this.SIXTY_PERCENT,
      });
    } else if (subHeader.columns) {
      subHeader.columns.push({
        alignment: this.RIGHT,
        text: this.$translate.instant('reportsPage.timeSelected') + timeFilter.label,
        style: [this.DEFAULT],
        width: this.SIXTY_PERCENT,
      });
    }

    layout.content.push(subHeader);
    const bottomLine: IPDFMakeContent = _.cloneDeep(this.REPORT_LINE);
    bottomLine.style = [this.DEFAULT_MARGINS];
    layout.content.push(bottomLine);

    return layout;
  }

  private createReport(key: string, timeFilter: ITimespan, chart: any, chartData: IReportCard, chartFilter: IReportDropdown | undefined, chartLabels: IReportLabel[] | undefined, pagebreak: string | undefined): ng.IPromise<IPDFMakeContent[]> {
    const report: IPDFMakeContent[] = this.createDefaultReport(chartData, timeFilter, pagebreak);

    // Include Chart Filter to make Graph Display Information obvious
    if (chartFilter) {
      report.push({
        alignment: this.RIGHT,
        text: this.$translate.instant('reportsPage.selectedReportFilter') + chartFilter.selected.label,
        style: [this.DEFAULT, this.DEFAULT_MARGINS],
      });
    }

    // If the graph is not set for any reason, display No Data message
    if (chartData.state !== this.ReportConstants.SET) {
      report.push({
        text: this.$translate.instant('reportsPage.noCustomerData'),
        alignment: this.CommonGraphService.CENTER,
        style: [this.NO_DATA],
      });
    }

    const captured: ng.IPromise<{}> = this.$q((resolve): void => {
      chart.export.capture({}, (): void => {
        chart.export.toJPG({}, (data: any): void => {
          report.push({
            image: data,
            fit: [this.REPORT_WIDTH, this.REPORT_HEIGHT],
          });
          resolve();
        });
      });
    });

    return captured.then((): IPDFMakeContent[] => {
      if (chartLabels) {
        const labelColumns: IPDFMakeContent[] = [];

        _.forEach(chartLabels, (label: IReportLabel): void => {
          const numberStyles: string[] = [this.NUMBER];
          if (label.hidden || _.isUndefined(label.class)) {
            numberStyles.push(this.GRAY);
          } else if (label.class) {
            numberStyles.push(label.class);
          }

          labelColumns.push({
            width: this.THIRTY_THREE_PERCENT,
            stack: [{
              text: label.number.toString(),
              style: numberStyles,
            }, {
              text: this.$translate.instant(label.text),
              style: [key + this.TEXT],
            }],
            alignment: this.CommonGraphService.CENTER,
          });
        });

        report.push({
          columns: labelColumns,
          columnGap: this.COLUMN_GAP_SMALL,
          style: [this.DOUBLE_MARGINS],
        });
      }

      return report;
    });
  }

  private createPartnerReport(timeFilter: ITimespan, chart: any | undefined, chartData: IReportCard, pagebreak: string | undefined): ng.IPromise<IPDFMakeContent[]> {
    const report: IPDFMakeContent[] = this.createDefaultReport(chartData, timeFilter, pagebreak);

    // If the graph is not set for any reason, display No Data message
    if (chartData.state !== this.ReportConstants.SET) {
      report.push({
        text: this.$translate.instant('reportsPage.noCustomerData'),
        alignment: this.CommonGraphService.CENTER,
        style: [this.NO_DATA],
      });
    }

    const captured: ng.IPromise<{}> = this.$q((resolve): void => {
      if (chart) {
        chart.export.capture({}, (): void => {
          chart.export.toJPG({}, (data: any): void => {
            report.push({
              image: data,
              fit: [this.REPORT_WIDTH, this.REPORT_HEIGHT],
            });
            resolve();
          });
        });
      } else if (chartData.table) {
        const tableBody: IPDFMakeContent[][] = [];
        const tableHeaders: IPDFMakeContent[] = [];
        _.forEach(chartData.table.headers, (header: IReportsHeader, index: number): void => {
          const rowStyle: string[] = [this.DEFAULT];
          _.forEach(this.TABLE_STYLES, (style: string): void => {
            if (header.class.indexOf(style) > -1) {
              rowStyle.push(style);
            }
          });

          const headerColumn: IPDFMakeContent = {
            text: this.getHeader(header.title, timeFilter),
            style: rowStyle,
            bold: true,
            fillColor: ChartColors.grayLightThree,
          };
          if (index === 1) {
            headerColumn.colSpan = 2;
            tableHeaders.push(headerColumn);
            tableHeaders.push({});
          } else {
            tableHeaders.push(headerColumn);
          }
        });
        tableBody.push(tableHeaders);

        _.forEach((chartData.table.data), (customer: IEndpointData[]): void => {
          const tableRow: IPDFMakeContent[] = [];
          _.forEach(customer, (datapoint: IEndpointData): void => {
            const rowStyle: string[] = [this.DEFAULT];
            _.forEach(this.TABLE_STYLES, (style: string): void => {
              if (datapoint.class.indexOf(style) > -1 || (datapoint.splitClasses && datapoint.splitClasses.indexOf(style) > -1)) {
                rowStyle.push(style);
              }
            });
            if (datapoint.output.length > 1) {
              tableRow.push({
                text: datapoint.output[0],
                style: rowStyle,
              });
              tableRow.push({
                text: datapoint.output[1],
                style: rowStyle,
              });
            } else {
              tableRow.push({
                text: datapoint.output[0],
                style: rowStyle,
              });
            }
          });
          tableBody.push(tableRow);
        });

        report.push({
          table: {
            widths: [this.FORTY_PERCENT, this.TEN_PERCENT, this.TEN_PERCENT, this.TWENTY_PERCENT, this.TWENTY_PERCENT],
            headerRows: 1,
            body: tableBody,
            style: [this.DEFAULT_MARGINS],
          },
        });
        resolve();
      } else {
        resolve();
      }
    });

    return captured.then((): IPDFMakeContent[] => {
      return report;
    });
  }

  private createDefaultReport(chartData: IReportCard, timeFilter: ITimespan, pagebreak: string | undefined): IPDFMakeContent[] {
    return [{
      text: this.$translate.instant(chartData.headerTitle),
      style: [this.HEADER],
      pageBreak: pagebreak,
    }, {
      alignment: this.JUSTIFY,
      text: this.getDescription(chartData.description, timeFilter),
      style: [this.DEFAULT, this.DEFAULT_MARGINS],
    }];
  }

  // Single Report Export Functions
  public createExportMenu(chart: any): IExportDropdown {
    return {
      header: {
        id: 'saveAs',
        label: this.$translate.instant('reportsPage.saveAs'),
      },
      menu: [{
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
      }],
    };
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
  private getHeader(text: string, timeFilter: ITimespan): string {
    return this.$translate.instant(text, {
      time: timeFilter['label'],
    });
  }

  private getPagebreaks(isCustomer: boolean): ICharts | IPartnerCharts {
    if (isCustomer) {
      return {
        active: this.BEFORE,
        device: this.BEFORE,
        metrics: this.BEFORE,
      };
    } else {
      return {
        population: this.BEFORE,
        media: this.BEFORE,
      };
    }
  }
}
