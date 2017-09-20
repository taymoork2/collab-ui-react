
class DirSyncController implements ng.IComponentController {
  private readonly ENABLE_DIR_SYNC_URL = 'https://www.cisco.com/go/hybrid-services-directory';

  public enabled: boolean;
  private onDisableDirsync: Function;
  public linkTitle: string;

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
    private $translate: ng.translate.ITranslateService,
  ) {
  }

  public $onInit() {
    this.setLinkText();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }) {
    const { enabled } = changes;
    if (enabled && enabled.currentValue) {
      this.enabled = enabled.currentValue;
      this.setLinkText();
    }
  }

  public handleClick(): void {
    if (this.enabled) {
      this.onDisableDirsync();
    } else {
      this.$window.open(this.ENABLE_DIR_SYNC_URL, '_blank');
    }
  }

  private setLinkText(): void {
    if (this.enabled) {
      this.linkTitle = this.$translate.instant('globalSettings.dirsync.turnOffDirSync');
    } else {
      this.linkTitle = this.$translate.instant('globalSettings.dirsync.turnOnDirSync');
    }
  }
}

///////////////////////

export class DirSyncComponent implements ng.IComponentOptions {
  public controller = DirSyncController;
  public template = require('modules/core/settings/dirsync/dirSync.html');
  public bindings = {
    enabled: '<',
    onDisableDirsync: '&',
  };
}
