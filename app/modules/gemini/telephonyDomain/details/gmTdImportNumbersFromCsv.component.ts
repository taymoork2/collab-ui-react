import { Notification } from 'modules/core/notifications';

class GmTdImportNumbersFromCsvCtrl implements ng.IComponentController {
  private $: any;
  private static readonly MAX_IMPORT: number = 300;

  public file: string;
  public onImported: any;
  public fileName: string;
  public isParsing: boolean;
  public uploadProgress: number;
  public isDisabled: boolean;

  /* @ngInject */
  public constructor(
    private $modal,
    private $scope,
    private $timeout,
    private Notification: Notification,
  ) {
    this.$ = jQuery;
  }

  public $onInit(): void {
    this.$scope.$watchCollection(() => {
      return this.fileName;
    }, (newFile) => {
      if (newFile) {
        this.$timeout(() => {
          this.validateCsv();
          this.fileName = '';
        });
      }
    });
  }

  public onSelectFile(event): void {
    this.$modal.open({
      type: 'dialog',
      template: require('modules/gemini/telephonyDomain/details/gmTdImportNumbersFromCsvConfirm.tpl.html'),
    }).result.then(() => {
      angular.element(event.currentTarget).next().click();
    });
  }

  public validateCsv() {
    this.isParsing = true;
    let lines: any[];
    if (this.file) {
      try {
        this.setProgress(0);
        lines = this.$.csv.toArrays(this.file);

        if (!_.isArray(lines) || lines.length <= 1) {
          this.Notification.error('gemini.tds.numbers.import.resultMsg.noItemFound');
          this.setProgress(100);
          this.isParsing = false;
          return;
        }

        // the `lines` value contains the header
        if (lines.length > GmTdImportNumbersFromCsvCtrl.MAX_IMPORT + 1) {
          this.Notification.error('gemini.tds.numbers.import.resultMsg.exceedMax',
            { max: GmTdImportNumbersFromCsvCtrl.MAX_IMPORT });
          this.setProgress(100);
          this.isParsing = false;
          return;
        }

        if (_.isArray(lines) && lines.length > 1 && _.isArray(lines[0])) {
          lines.shift();
          const items: any[] = this.getItemsFromArray(lines);
          this.onImported({ numbers: items });
        }
      } catch (ex) {
        this.Notification.error('firstTimeWizard.uploadCsvBadFormat');
      }
    }
    this.$timeout(() => {
      this.isParsing = false;
      this.setProgress(100);
    });
  }

  private getItemsFromArray(items: any[]): any[] {
    const numbers: any[] = [];
    let hasError: boolean = false;
    _.forEach(items, (item) => {
      if (item.length < 7) {
        this.Notification.error('firstTimeWizard.uploadCsvBadFormat');
        hasError = true;
        return false;
      }

      numbers.push({
        phone: this.stripFieldValue(item[0]),
        label: this.stripFieldValue(item[1]),
        dnisNumberFormat: this.stripFieldValue(item[2]),
        dnisNumber: _.replace(this.stripFieldValue(item[2]), '+', ''),
        tollType: this.stripFieldValue(item[3]),
        phoneType: this.stripFieldValue(item[4]),
        country: this.stripFieldValue(item[5]),
        isHidden: this.stripFieldValue(item[6]) === 'Hidden',
      });
    });

    return hasError ? [] : numbers;
  }

  private stripFieldValue(value: any): string {
    if (value) {
      value = (value as string).replace(/[="]/g, '');
      return value;
    }
    return '';
  }

  private setProgress(progress: number): void {
    this.uploadProgress = progress;
    this.$scope.$digest();
  }

  public onFileSizeError(): void {
    this.Notification.error('firstTimeWizard.csvMaxSizeError');
  }

  public onFileTypeError(): void {
    this.Notification.error('gemini.tds.numbers.import.invalidFileType');
  }
}

export class GmTdImportNumbersFromCsvComponent implements ng.IComponentOptions {
  public bindings = {
    onImported: '&',
    isDisabled: '<',
  };
  public controller = GmTdImportNumbersFromCsvCtrl;
  public template = require('modules/gemini/telephonyDomain/details/gmTdImportNumbersFromCsv.tpl.html');
}
