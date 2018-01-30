import { CsvDownloadTypes, CsvDownloadService } from 'modules/core/csvDownload';
import { IToolkitModalService } from 'modules/core/modal';
import { AutoAssignTemplateModel } from 'modules/core/users/shared/auto-assign-template';

/* UI for allowing user to export the Csv and Template. Does not do downloading on its own! See csvDownload.component */
export class UserCsvExportComponent {
  public controller = UserCsvExportController;
  public template = require('modules/core/users/userCsv/userCsvExport.component.html');
  public bindings = {
    onStatusChange: '&',
    asLink: '@',
  };
}

/////////////////
/* @ngInject */
class UserCsvExportController implements ng.IComponentController {
  // bindings
  public onStatusChange: Function;
  public asLink: string;

  public displayAsLink: boolean;
  public isDownloading: boolean;

  private exportFilename: string;
  private eventListeners: any = [];
  private isOverExportThreshold: boolean;

  constructor(
    private $modal: IToolkitModalService,
    private $q: ng.IQService,
    private $rootScope: ng.IRootScopeService,
    private $translate: ng.translate.ITranslateService,
    private Analytics,
    private Authinfo,
    private CsvDownloadService,
    private FeatureToggleService,
    private ModalService,
    private Notification,
    private AutoAssignTemplateModel: AutoAssignTemplateModel,
    private UserListService,
  ) {
  }

  public $onInit(): void {
    this.isDownloading = this.CsvDownloadService.downloadInProgress;

    this.isOverExportThreshold = false;
    if (!this.Authinfo.isCisco()) {
      this.FeatureToggleService.atlasNewUserExportGetStatus()
        .then((enabled) => {
          if (!enabled) {
            // using old export method, so determine if we have too many users to export everything
            this.UserListService.getUserCount()
              .then((count) => {
                //count = CsvDownloadService.USER_EXPORT_THRESHOLD * 2; // todo FOR TESTING! REMOVE THIS!
                this.isOverExportThreshold = (count > CsvDownloadService.USER_EXPORT_THRESHOLD);
              });
          }
        });
    }

    this.displayAsLink = !_.isEmpty(this.asLink);

    this.exportFilename = this.$translate.instant('usersPage.csvFilename');

    this.eventListeners.push(
      this.$rootScope.$on('csv-download-request-started', (): void => { this.onCsvDownloadRequestStarted(); }),
    );
    this.eventListeners.push(
      this.$rootScope.$on('csv-download-request-completed', (): void => { this.onCsvDownloadRequestCompleted(); }),
    );
  }

  public $onDestroy(): void {
    while (!_.isEmpty(this.eventListeners)) {
      _.attempt(this.eventListeners.pop());
    }
  }

  public exportCsv(): void {
    this.Analytics.trackAddUsers(this.Analytics.sections.ADD_USERS.eventNames.EXPORT_USER_LIST);

    this.warnAutoAssignTemplate().then(() => {
      this.$modal.open({
        type: 'dialog',
        template: require('modules/core/users/userCsv/userCsvExportConfirm.tpl.html'),
      }).result
      .then(() => {
        if (this.isOverExportThreshold) {
          // warn that entitlements won't be exported since there are too many users
          this.$modal.open({
            type: 'dialog',
            template: require('modules/core/users/userCsv/userCsvExportConfirm10K.tpl.html'),
            controller: function () {
              const modalCtrl = this;
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
    });
  }

  public downloadTemplate(): void {
    this.warnAutoAssignTemplate().then(() => {
      // start the download
      this.$rootScope.$emit('csv-download-request', {
        csvType: CsvDownloadTypes.TYPE_TEMPLATE,
        tooManyUsers: this.isOverExportThreshold,
        suppressWarning: true,
        filename: 'template.csv',
      });
    });
  }

  public cancelDownload(): void {
    this.CsvDownloadService.cancelDownload();
    this.Notification.warning('userManage.bulk.canceledExport');
  }

  //// private functions

  private warnAutoAssignTemplate(): ng.IPromise<any> {
    if (!this.AutoAssignTemplateModel.isDefaultAutoAssignTemplateActivated) {
      return this.$q.resolve();
    }

    return this.ModalService.open({
      hideDismiss: true,
      message: this.$translate.instant('userManage.autoAssignTemplate.csv.warningMessage'),
      title: this.$translate.instant('userManage.autoAssignTemplate.csv.warningTitle'),
    }).result;
  }

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
