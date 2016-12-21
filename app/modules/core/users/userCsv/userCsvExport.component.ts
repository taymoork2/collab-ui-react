import { CsvDownloadTypes, CsvDownloadService } from 'modules/core/csvDownload';

interface IToolkitModalSettings extends ng.ui.bootstrap.IModalSettings {
  type: string;
}

interface IToolkitModalService extends ng.ui.bootstrap.IModalService {
  open(options: IToolkitModalSettings): ng.ui.bootstrap.IModalServiceInstance;
}

/* UI for allowing user to export the Csv and Template. Does not do downloading on its own! See csvDownload.component */
export class UserCsvExportComponent {
  public controller = UserCsvExportController;
  public templateUrl = 'modules/core/users/userCsv/userCsvExport.component.html';
  public bindings = {
    onStatusChange: '&',
    isOverExportThreshold: '<',
    asLink: '@',
  };
}

/////////////////
/* @ngInject */
class UserCsvExportController implements ng.IComponentController {
  // bindings
  public onStatusChange: Function;
  public isOverExportThreshold: boolean;
  public asLink: string;

  public displayAsLink: boolean;
  public isDownloading: boolean;

  private exportFilename: string;
  private eventListeners: any = [];

  constructor(
    private $rootScope: ng.IRootScopeService,
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private CsvDownloadService,
    private Notification,
  ) {
  }

  public $onInit(): void {
    this.isDownloading = this.CsvDownloadService.downloadInProgress;
    this.isOverExportThreshold = !!(this.isOverExportThreshold);
    this.displayAsLink = !_.isEmpty(this.asLink);

    this.exportFilename = this.$translate.instant('usersPage.csvFilename');

    this.eventListeners.push(
      this.$rootScope.$on('csv-download-request-started', (): void => { this.onCsvDownloadRequestStarted(); })
    );
    this.eventListeners.push(
      this.$rootScope.$on('csv-download-request-completed', (): void => { this.onCsvDownloadRequestCompleted(); })
    );
  }

  public $onDestroy(): void {
    while (!_.isEmpty(this.eventListeners)) {
      _.attempt(this.eventListeners.pop());
    }
  }

  public exportCsv(): void {
    this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.EXPORT_USER_LIST);

    this.$modal.open({
      type: 'dialog',
      templateUrl: 'modules/core/users/userCsv/userCsvExportConfirm.tpl.html',
    }).result
      .then(() => {
        if (this.isOverExportThreshold) {
          // warn that entitlements won't be exported since there are too many users
          this.$modal.open({
            type: 'dialog',
            templateUrl: 'modules/core/users/userCsv/userCsvExportConfirm10K.tpl.html',
            controller: function () {
              let modalCtrl = this;
              modalCtrl.maxUsers = CsvDownloadService.USER_EXPORT_THRESHOLD;
            },
            controllerAs: 'ctrl',
          }).result
            .then(() => {
              this.beginUserCsvDownload();
            });
        } else {
          this.beginUserCsvDownload();
        }
      });
  }

  public downloadTemplate(): void {
    // start the download
    this.$rootScope.$emit('csv-download-request', {
      csvType: CsvDownloadTypes.TYPE_TEMPLATE,
      tooManyUsers: this.isOverExportThreshold,
      suppressWarning: true,
      filename: 'template.csv',
    });
  }

  public cancelDownload(): void {
    this.CsvDownloadService.cancelDownload();
    this.Notification.warning('userManage.bulk.canceledExport');
  }

  //// private functions

  private beginUserCsvDownload(): void {
    // start the export
    this.$rootScope.$emit('csv-download-request', {
      csvType: CsvDownloadTypes.TYPE_USER,
      tooManyUsers: this.isOverExportThreshold,
      suppressWarning: true,
      filename: this.exportFilename,
    });
  }

  private onCsvDownloadRequestStarted(): void {
    this.isDownloading = true;
    this.onStatusChange({
      isExporting: true,
    });
  }

  private onCsvDownloadRequestCompleted(): void {
    this.isDownloading = false;
    this.onStatusChange({
      isExporting: false,
    });
  }

}
