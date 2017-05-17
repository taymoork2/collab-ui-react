// Really, it creates CSV file formated for Excel more than real Excel files
// Opinionated: utf-8 only, expect “,” to be the separator

export class ExcelService {
  private static readonly EOL = '\r\n';
  private static readonly separator = ',';
  // Improve formatting in all versions of Excel even if it means
  // not being 100% CSV-valid
  // See https://github.com/asafdav/ng-csv/issues/28
  private static readonly firstLine = `sep=${ExcelService.separator}${ExcelService.EOL}`;

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private $document: ng.IDocumentService,
    private $timeout: ng.ITimeoutService,
  ) {}

  public createFile(header: string[], content: string[][]): string {
    let csvContent = ExcelService.firstLine;
    // Check if there's a provided header array
    if (_.isArray(header)) {
      const headerString = this.stringifyArray(header);
      csvContent += headerString + ExcelService.EOL;
    }
    const contentString = _.chain(content)
      .map((row) => this.stringifyArray(row))
      .join(ExcelService.EOL)
      .value();
    csvContent += contentString;
    return csvContent;
  }

  public downloadFile(filename: string, textContent: string): void {
    const blob = new this.$window.Blob([textContent], {
      type: 'text/csv;charset=utf-8;',
    });

    if (this.$window.navigator.msSaveOrOpenBlob) {
      // IE…
      this.$window.navigator.msSaveOrOpenBlob(blob, filename);
    } else if (!('download' in this.$window.document.createElement('a'))) {
      // Safari…
      this.$window.location.href = this.$window.URL.createObjectURL(blob);
    } else {
      const downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
      const downloadLink = angular.element(downloadContainer.children()[0]);
      downloadLink.attr({
        href: this.$window.URL.createObjectURL(blob),
        download: filename,
        target: '_blank',
      });
      this.$document.find('body').append(downloadContainer);
      this.$timeout(() => {
        downloadLink[0].click();
        downloadLink.remove();
      });
    }
  }

  private stringifyArray(row: string[]): string {
    return _.chain(row)
      .map((cell) => this.stringifyField(cell))
      .join(ExcelService.separator)
      .value();
  }

  private stringifyField(data: any): string {
    if (_.isString(data)) {
      // Escape double quotes
      data = _.replace(data, /"/g, '""');
      if (data.indexOf(ExcelService.separator) > -1 || data.indexOf('\n') > -1 || data.indexOf('\r') > -1) {
        data = `"${data}"`;
      }
    } else if (typeof data === 'boolean') {
      data = data ? 'TRUE' : 'FALSE';
    }
    return data;
  }
}

export default angular
  .module('hercules.excel', [])
  .service('ExcelService', ExcelService)
  .name;
