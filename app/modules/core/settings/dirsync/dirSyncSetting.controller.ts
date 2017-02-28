import { IDirSyncService, IDirectoryConnector } from 'modules/core/featureToggle';
import { IToolkitModalService, IToolkitModalSettings } from 'modules/core/modal';

export class DirSyncSettingController {
  public updatingStatus: boolean;
  public dirSyncEnabled: boolean;
  public connectors: Array<IDirectoryConnector>;

  /* @ngInject */
  constructor(
    private DirSyncService: IDirSyncService,
    private $translate: ng.translate.ITranslateService,
    private ModalService: IToolkitModalService,
    private Notification,
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
        this.DirSyncService.disableSync()
          .then(() => {
            this.Notification.success('globalSettings.dirsync.disableDirSyncSuccess');
          })
          .catch((response) => {
            this.Notification.errorResponse(response, 'globalSettings.dirsync.disableDirSyncFailed');
          })
          .finally(() => {
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
        this.DirSyncService.deregisterConnector(connector)
          .then(() => {
            this.Notification.success('globalSettings.dirsync.deregisterSuccess', { name: connector.name });
          })
          .catch((response) => {
            this.Notification.errorResponse(response, 'globalSettings.dirsync.deregisterFailed', { name: connector.name });
          })
          .finally(() => {
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
