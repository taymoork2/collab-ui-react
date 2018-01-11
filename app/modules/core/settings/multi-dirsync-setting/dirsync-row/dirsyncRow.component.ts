import { IDirectoryConnector, IDirectorySync } from '../multiDirsyncSetting.component';

type StatusType = 'success' | 'warning' | 'danger';

interface IConnector extends IDirectoryConnector {
  status: 'primary' | 'disabled';
}

export class DirsyncRowController {
  public dirsync: IDirectorySync;
  public deleteSiteFn: Function;
  public deactivateConnectorFn: Function;

  public connectors: IConnector[] = [];
  public siteStatus: StatusType;

  /* @ngInject */
  public constructor() {}

  public $onInit() {
    _.forEach(this.dirsync.connectors, (connector: IDirectoryConnector) => {
      this.connectors.push({
        isInService: connector.isInService,
        name: connector.name,
        status: connector.isInService ? 'primary' : 'disabled',
      });
    });

    const isInService = { isInService: true };
    this.siteStatus = 'success';

    if (!_.every(this.dirsync.connectors, isInService)) {
      if (_.some(this.dirsync.connectors, isInService)) {
        this.siteStatus = 'warning';
      } else {
        this.siteStatus = 'danger';
      }
    }
  }

  public get domainName(): string {
    return this.dirsync.domains[0].domainName; // should only be one domain per dirsync site
  }

  public deactivateConnector(connector: IDirectoryConnector): void {
    this.deactivateConnectorFn({ connector: connector });
  }

  public deleteSite(): void {
    this.deleteSiteFn({ site: this.dirsync.domains[0] });
  }

  public getStatus(): string {
    switch (this.siteStatus) {
      case 'success':
        return 'globalSettings.multiDirsync.operational';
      case 'warning':
        return 'globalSettings.multiDirsync.degraded';
      case 'danger':
        return 'globalSettings.multiDirsync.outage';
    }
  }
}

export class DirsyncRowComponent implements ng.IComponentOptions {
  public controller = DirsyncRowController;
  public template = require('modules/core/settings/multi-dirsync-setting/dirsync-row/dirsyncRow.tpl.html');
  public bindings = {
    dirsync: '<',
    deleteSiteFn: '&',
    deactivateConnectorFn: '&',
  };
}
