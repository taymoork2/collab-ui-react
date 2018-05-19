import { Notification } from 'modules/core/notifications';

// Based on /app/modules/core/csvDownload/csvDownload.component.ts
/* This component can be used to download data as a csv file
*  It works in two modes - hidden and visible. Visible (!isHidden) is used when there is already data
*  when the control is initialized. It takes care of displaying the anchor link, loader, status etc.
*  When there is no data initially the control waits for changes to csvData before downloading
*  When it's done downloadFinishedFn gets fired. In this case the parent is reponsible for loader and UI
*/

export class CrCsvDownloadComponent implements ng.IComponentOptions {
  public template = require('./cr-csv-download.component.html');
  public controller = CrCsvDownloadController;
  public bindings = {
    filename: '@',                  // name of the file to use when saving
    statusMessage: '@',             // message to display while downloading
    icon: '@',                      // icon class to use instead of default
    anchorText: '@',                // text to display instead of icon
    isHidden: '<?',                 // if true, hides the visual elements.
    csvData: '<',                   // data to go in csv
    isStringData: '<',              // if true, take csvData as string type rather than string[][]
    l10nSuccessString: '@?',        // success string to display in notification
    downloadFinishedFn: '&?',        // parent function to generate data
  };
}

export class CrCsvDownloadController implements ng.IComponentController {

  // bindings
  public filename: string;
  public anchorText: string;
  public statusMessage: string;
  public icon: string;
  public isHidden: boolean;
  public csvData: string[][];
  public l10nSuccessString: string;
  public downloadFinishedFn: Function;
  public isStringData: boolean;

  public tooltipMessage: string;
  public iconClass = '';
  public downloading = false;
  public downloadingMessage = '';
  public downloadCsv: Function;

  private FILENAME;
  private downloadAnchor;
  private objectBlob;
  private objectUrl;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $window: ng.IWindowService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private Notification: Notification,
  ) {
  }

  public $postLink(): void {
    this.downloadAnchor = $(this.$element.find('a')[0]);
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    if (changes.csvData && !_.isEmpty(changes.csvData.currentValue) && this.isHidden && !this.downloading) {
      this.beginDownloadCsv();
    }
  }

  public $onInit(): void {
    this.FILENAME = this.filename || 'exported_file.csv';
    this.downloadCsv = this.beginDownloadCsv;
    if (!this.isHidden) {
      this.iconClass = (this.icon ? this.icon : 'icon-circle-download');
    }
  }

  public get downloadTranslation(): string {
    return this.anchorText ? this.anchorText : this.$translate.instant('common.download');
  }

  /* Begin process for downloading a file */
  private beginDownloadCsv(): void {
    this.startDownload();
    if (!_.isEmpty(this.csvData)) {
      this.downloadData();
    }
  }

  public downloadData(): void {
    const url = this.isStringData ? this.createObjectUrl(this.csvData, this.FILENAME) : this.getCsv(this.FILENAME, this.csvData);
    this.$timeout(() => {
      this.finishDownload(url);
      this.changeAnchorAttrToOriginalState();
    }, 300);
  }

  /* Update the UI to reflect the start of a download */
  private startDownload(): void {
    // disable the button when download starts
    this.flagDownloading(true);
    this.downloadingMessage = this.$translate.instant('csvDownload.inProgress');

    this.$timeout(() => {
      this.downloadAnchor.attr('disabled', 'disabled');
    });
  }

  private finishDownload(url: string): void {
    // pass the objectUrl to the href of anchor when download is done
    this.changeAnchorAttrToDownloadState(url);

    this.$timeout(() => {
      if (this.downloading) {
        if (_.isUndefined(this.$window.navigator.msSaveOrOpenBlob)) {
          // in IE this causes the page to refresh
          this.downloadAnchor[0].click();
        }
        this.Notification.success(this.l10nSuccessString);
        if (_.isFunction(this.downloadFinishedFn)) {
          this.downloadFinishedFn();
        }
        this.flagDownloading(false);
      }
    });
  }

  private changeAnchorAttrToDownloadState(url: string) {
    this.$timeout(() => {
      if (_.isUndefined(this.$window.navigator.msSaveOrOpenBlob)) {
        this.downloadCsv = this.removeFocus;
        this.downloadAnchor.attr({
          href: url,
          download: this.FILENAME,
        })
          .removeAttr('disabled');
      } else {
        // IE download option since IE won't download the created url
        this.downloadCsv = this.openInIE;
        this.downloadAnchor.removeAttr('disabled');
      }
    });
  }

  private changeAnchorAttrToOriginalState(): void {
    this.$timeout(() => {
      this.downloadCsv = this.beginDownloadCsv;
      this.downloadAnchor.attr({
        href: '',
      })
        .removeAttr('download');
    });
  }

  private removeFocus(): void {
    this.$timeout(() => {
      this.downloadAnchor.blur();
    });
  }

  private flagDownloading(flag): void {
    flag = _.isBoolean(flag) ? flag : false;
    this.downloading = flag;
  }

  public getCsv(fileName: string, csvData: string[][]): string {
    const csvString = ($ as any).csv.fromObjects(csvData);
    return this.createObjectUrl(csvString, fileName);
  }

  public openInIE(fileName: string): void {
    this.$window.navigator.msSaveOrOpenBlob(this.objectBlob, fileName);
  }

  /* Creates the data URL for downloading the blob of data */
  public createObjectUrl(data: any, fileName: string): string {
    const blob = new this.$window.Blob([data], { type: 'text/plain' });
    const oUrl = (this.$window.URL || this.$window.webkitURL).createObjectURL(blob);

    this.objectBlob = blob;
    this.setObjectUrl(oUrl);

    // IE download option since IE won't download the created url
    if (this.$window.navigator.msSaveOrOpenBlob) {
      this.openInIE(fileName);
    }
    return oUrl;
  }

  public revokeObjectUrl(): void {
    if (this.getObjectUrl()) {
      (this.$window.URL || this.$window.webkitURL).revokeObjectURL(this.getObjectUrl());
      this.setObjectUrl(null);
      this.objectBlob = null;
    }
  }

  public getObjectUrl(): string {
    return this.objectUrl;
  }

  private setObjectUrl(oUrl: string | null): void {
    this.objectUrl = oUrl;
  }
}
