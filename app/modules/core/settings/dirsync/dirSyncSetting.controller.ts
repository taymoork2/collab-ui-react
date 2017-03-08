import { IDirSyncService, IDirectoryConnector } from 'modules/core/featureToggle';
import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';

export class DirSyncSettingController {

  public static readonly CONNECTOR_DEREGISTERED = 'Connector Deregistered';
  public static readonly DIRSYNC_DISABLED = 'DirSync Disabled';

  public updatingStatus: boolean;
  public dirSyncEnabled: boolean;
  public connectors: Array<IDirectoryConnector>;

  /* @ngInject */
  constructor(
    private DirSyncService: IDirSyncService,
    private $translate: ng.translate.ITranslateService,
    private ModalService: IToolkitModalService,
    private Notification,
    private LogMetricsService,
    private Authinfo,
  ) {
  }

  public $onInit(): void {
    this.refresh();
  }

  public disableDirSync(): void {
    let options = <IToolkitModalSettings>{
      type: 'dialog',
      title: this.$translate.instant('globalSettings.dirsync.turnOffDirSync'),
      message: this.$translate.instant('globalSettings.dirsync.turnOffDirSyncWarning'),
      close: this.$translate.instant('common.turnOff'),
      btnType: 'alert',
    };
    this.ModalService.open(options).result
      .then(() => {
        let startTime = moment();
        let status = 200;
        this.DirSyncService.disableSync()
          .then(() => {
            this.Notification.success('globalSettings.dirsync.disableDirSyncSuccess');
          })
          .catch((response) => {
            status = response.status;
            this.Notification.errorResponse(response, 'globalSettings.dirsync.disableDirSyncFailed');
          })
          .finally(() => {
            this.LogMetricsService.logMetrics(
              DirSyncSettingController.DIRSYNC_DISABLED,
              this.LogMetricsService.getEventType('dirSyncDisabled'),
              this.LogMetricsService.getEventAction('buttonClick'), status, startTime, 1,
              { userId: this.Authinfo.getUserId(), orgId: this.Authinfo.getOrgId() });

            this.refresh();
          });
      });
  }

  public deregisterConnector(connector: IDirectoryConnector): void {
    let options = <IToolkitModalSettings>{
      type: 'dialog',
      title: `${this.$translate.instant('globalSettings.dirsync.deregister')} ${connector.name}`,
      message: this.$translate.instant('globalSettings.dirsync.deregisterWarning'),
      close: this.$translate.instant('globalSettings.dirsync.deregister'),
      btnType: 'alert',
    };
    this.ModalService.open(options).result
      .then(() => {
        let startTime = moment();
        let status = 200;
        this.DirSyncService.deregisterConnector(connector)
          .then(() => {
            this.Notification.success('globalSettings.dirsync.deregisterSuccess', { name: connector.name });
          })
          .catch((response) => {
            status = response.status;
            this.Notification.errorResponse(response, 'globalSettings.dirsync.deregisterFailed', { name: connector.name });
          })
          .finally(() => {
            this.LogMetricsService.logMetrics(
              DirSyncSettingController.CONNECTOR_DEREGISTERED,
              this.LogMetricsService.getEventType('connectorDeregistered'),
              this.LogMetricsService.getEventAction('buttonClick'), status, startTime, 1,
              { userId: this.Authinfo.getUserId(), orgId: this.Authinfo.getOrgId(), connectorName: connector.name });

            this.refresh();
          });
      });
  }

  //////////////////

  private refresh(): void {
    this.updatingStatus = true;
    this.DirSyncService.refreshStatus().then(() => {
      this.dirSyncEnabled = this.DirSyncService.isDirSyncEnabled();
      this.connectors = this.DirSyncService.getConnectors();
      this.updatingStatus = false;
    });
  }

}
