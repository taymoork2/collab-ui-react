import { CsvDownloadService } from './csvDownload.service';
import { CsvDownloadTypes } from './csvDownload.service';
import { Notification } from 'modules/core/notifications';

/* Sample usage:
 *  <csv-download type="any" filename="exported_file.csv" no-icon="true"></csv-download>
 *    - $emit event 'csv-download-request' and pass in options object containing
 *    --- { csvType, tooManyUsers, suppressWarning, filename}
 *  <csv-download type="template" filename="template.csv"></csv-download>
 *    - static download type
 *    - call this.downloadCsv()
 */
export class CsvDownloadComponent implements ng.IComponentOptions {
  public template = require('modules/core/csvDownload/csvDownload.component.html');
  public controller = CsvDownloadCtrl;
  public bindings = {
    type: '@',                  // what type of file is being downloaded
    filename: '@',              // name of the file to use when saving
    statusMessage: '@',         // message to display while downloading
    downloadState: '@',         // state to go to if selected while downloading
    analyticsEventname: '@',    // event to send to Analytics when download starts
    anchorText: '@',            // text to display instead of icon
    icon: '@',                  // icon class to use instead of default
    noIcon: '<',                // if true, hides the download icon
  };
}

class CsvDownloadCtrl implements ng.IComponentController {

  // bindings
  public type: string;
  public filename: string;
  public statusMessage: string;
  public downloadState: string;
  public analyticsEventname: string;
  public anchorText: string;
  public icon: string;
  public noIcon: boolean;

  public tooltipMessage: string;
  public iconClass: string;
  public downloading = false;
  public downloadingMessage = '';
  public downloadCsv: Function;

  private eventListeners: any = [];
  // TO-DO: remove newUserExportToggle
  private newUserExportToggle = false;
  private batchServiceToggle = false;
  private FILENAME;
  private downloadAnchor;
  private downloadingIcon;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $rootScope: ng.IRootScopeService,
    private $window: ng.IWindowService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private $timeout: ng.ITimeoutService,
    private $modal,
    private $state: ng.ui.IStateService,
    private Analytics,
    private CsvDownloadService: CsvDownloadService,
    private Notification: Notification,
    private FeatureToggleService,
  ) {
  }

  public $postLink() {
    this.downloadAnchor = $(this.$element.find('a')[0]);
    this.downloadingIcon = $(this.$element.find('i')[1]);
  }

  // public functions
  public $onInit() {
    this.FILENAME = this.filename || 'exported_file.csv';
    this.type = this.type || CsvDownloadTypes.TYPE_ANY;
    this.downloadCsv = this.beginDownloadCsv;

    // TO-DO: remove newUserExportToggle
    this.FeatureToggleService.atlasNewUserExportGetStatus()
      .then((result) => {
        this.newUserExportToggle = result;
      });
    this.FeatureToggleService.atlasCsvImportTaskManagerGetStatus()
      .then((result) => {
        this.batchServiceToggle = result;
      });

    this.iconClass = '';
    if (!this.noIcon) {
      this.iconClass = (this.icon ? this.icon : 'icon-circle-download');
    }

    // if the template Object URL is already loaded, change the anchor's attributes to download from blob
    if (this.type === CsvDownloadTypes.TYPE_USER) {
      this.tooltipMessage = this.$translate.instant('usersPage.csvBtnTitle');
    }

    if (this.type && this.type === 'template' && this.CsvDownloadService.getObjectUrlTemplate()) {
      this.changeAnchorAttrToDownloadState(this.CsvDownloadService.getObjectUrlTemplate());
    }

    this.eventListeners.push(
      this.$rootScope.$on('csv-download-begin', () => {
        this.flagDownloading(true);
      }));

    this.eventListeners.push(
      this.$rootScope.$on('csv-download-end', () => {
        this.flagDownloading(false);
      }));

    // Register handler for all csv download requests
    if (this.type === CsvDownloadTypes.TYPE_ANY) {
      const listener = this.$rootScope.$on('csv-download-request', (_event, options) => {
        this.FILENAME = (options.filename || this.FILENAME);
        const tooManyUsers = !!options.tooManyUsers;
        if (tooManyUsers && this.CsvDownloadService.downloadInProgress) {
          this.Notification.error('csvDownload.isRunning');
        } else {
          // todo - remove the warning once we remove the feature toggle for new User Export API
          // TO-DO: remove newUserExportToggle
          if (this.newUserExportToggle || options.suppressWarning) {
            // start export
            this.downloadCsv(options.csvType, tooManyUsers);
          } else {
            // warn user this might take a while and get confirmation
            this.$modal.open({
              type: 'dialog',
              template: require('modules/core/csvDownload/csvDownloadConfirm.tpl.html'),
              controller: function () {
                const vm = this;
                vm.messageBody1 = this.CsvDownloadService.downloadInProgress ? this.$translate.instant('csvDownload.confirmCsvCancelMsg') : '';
                vm.messageBody2 = this.$translate.instant('csvDownload.confirmCsvDownloadMsg');
              },
              controllerAs: 'csv',
            }).result
              .then(() => {
                return this.cancelDownload();
              })
              .then(() => {
                return this.downloadCsv(options.csvType, tooManyUsers);
              });
          }
        }
      });
      this.eventListeners.push(listener);
    }

    // see if there is a current active download, and set out flag
    this.downloading = this.CsvDownloadService.downloadInProgress;
    this.eventListeners.push(this.$rootScope.$on('csv-download-request-completed', (): void => { this.downloading = this.CsvDownloadService.downloadInProgress; }));
  }

  public $onDestroy() {
    while (!_.isEmpty(this.eventListeners)) {
      _.attempt(this.eventListeners.pop());
    }
  }

  /* Begin process for downloading a file */
  private beginDownloadCsv(csvType, tooManyUsers) {
    csvType = csvType || this.type;
    if (this.analyticsEventname) {
      this.Analytics.trackCsv(this.analyticsEventname);
    }

    if (csvType === CsvDownloadTypes.TYPE_TEMPLATE || csvType === CsvDownloadTypes.TYPE_USER || csvType === CsvDownloadTypes.TYPE_ERROR) {
      this.startDownload(csvType);

      // TO-DO: remove newUserExportToggle
      this.CsvDownloadService.getCsv(csvType, tooManyUsers, this.FILENAME, this.newUserExportToggle, this.batchServiceToggle)
        .then((url) => {
          this.finishDownload(csvType, url);
        })
        .catch((response) => {
          if ((_.isString(response) && response !== 'canceled')
            || (_.isNumber(response.status)
              && (response.status !== -1 || (csvType === CsvDownloadTypes.TYPE_USER && !this.CsvDownloadService.isReportCanceled())))) {
            // download failed, but wasn't canceled.  Means we had an error.
            this.Notification.errorWithTrackingId(response, 'csvDownload.error');
          }
          this.flagDownloading(false);
          this.changeAnchorAttrToOriginalState();
        });
    } else {
      this.Notification.error('csvDownload.unsupported');
    }
  }

  public getDownloadTranslation() {
    return this.anchorText ? this.anchorText : this.$translate.instant('common.download');
  }

  public goToDownload() {
    if (this.downloading && !_.isEmpty(this.downloadState)) {
      this.$state.go(this.downloadState);
    }
  }

  ////////////////////
  // private

  /* Update the UI to reflect the start of a download */
  private startDownload(csvType) {
    // disable the button when download starts
    this.flagDownloading(true);
    this.downloadingMessage = this.$translate.instant('csvDownload.inProgress', {
      type: csvType,
    });

    this.$timeout(() => {
      this.downloadAnchor.attr('disabled', 'disabled');
      if (this.type === CsvDownloadTypes.TYPE_ANY) {
        this.downloadingIcon.mouseover();
        this.$timeout(() => {
          this.downloadingIcon.mouseout();
        }, 3000);
      }
    });
  }

  private finishDownload(csvType, url) {
    // pass the objectUrl to the href of anchor when download is done
    this.changeAnchorAttrToDownloadState(url);

    this.$timeout(() => {
      if (this.downloading) {
        if (this.type === CsvDownloadTypes.TYPE_ANY) {
          this.downloadingIcon.mouseout();
        }
        if (_.isUndefined(this.$window.navigator.msSaveOrOpenBlob)) {
          // in IE this causes the page to refresh
          this.downloadAnchor[0].click();
        }
        this.Notification.success('csvDownload.success', {
          type: csvType,
        });
        this.flagDownloading(false);
      }
    });

    this.$timeout(() => {
      // remove the object URL if it's not a template
      if (this.type !== CsvDownloadTypes.TYPE_TEMPLATE) {
        this.CsvDownloadService.revokeObjectUrl();
        this.changeAnchorAttrToOriginalState();
      }
    }, 500);
  }

  private changeAnchorAttrToDownloadState(url) {
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

  private openInIE() {
    this.CsvDownloadService.openInIE(this.type, this.FILENAME);
  }

  private changeAnchorAttrToOriginalState() {
    this.$timeout(() => {
      this.downloadCsv = this.beginDownloadCsv;
      this.downloadAnchor.attr({
        href: '',
      })
        .removeAttr('download');
    });
  }

  private removeFocus() {
    this.$timeout(() => {
      this.downloadAnchor.blur();
    });
  }

  private flagDownloading(flag) {
    flag = _.isBoolean(flag) ? flag : false;
    this.downloading = flag;
    if (this.type === CsvDownloadTypes.TYPE_ANY) {
      this.CsvDownloadService.downloadInProgress = flag;
    }

    if (flag) {
      this.$rootScope.$emit('csv-download-request-started');
    } else {
      this.$rootScope.$emit('csv-download-request-completed', {
        dataUrl: this.FILENAME,
      });
    }

  }

  private cancelDownload() {
    return this.$q((resolve) => {
      if (this.CsvDownloadService.downloadInProgress) {
        this.CsvDownloadService.cancelDownload();
        this.flagDownloading(false);
        this.changeAnchorAttrToOriginalState();
        this.$timeout(() => {
          // wait a second to allow cancel to finish
          resolve();
        }, 1000);
      } else {
        resolve();
      }
    });
  }
}
