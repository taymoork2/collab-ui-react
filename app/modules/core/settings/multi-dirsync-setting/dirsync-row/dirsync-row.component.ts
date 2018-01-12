import { IDirectoryConnector, IDirectorySync } from '../multiDirsyncSetting.component';

type StatusType = 'success' | 'warning' | 'danger';


export class DirsyncRowController {
  public dirsync: IDirectorySync;
  public deleteDomainFn: Function;
  public deactivateConnectorFn: Function;

  public connectors: any[] = [];
  public domainStatus: StatusType;

  /* @ngInject */
  public constructor() {}

  public $onInit() {
    this.connectors = _.map(this.dirsync.connectors, (connector: IDirectoryConnector) => {
      return {
        isInService: connector.isInService,
        name: connector.name,
        status: connector.isInService ? 'primary' : 'disabled',
      };
    });

    const isInService = { isInService: true };
    this.domainStatus = 'success';

    if (!_.every(this.dirsync.connectors, isInService)) {
      if (_.some(this.dirsync.connectors, isInService)) {
        this.domainStatus = 'warning';
      } else {
        this.domainStatus = 'danger';
      }
    }
  }

  public get domainName(): string {
    return _.get(this.dirsync, 'domains[0].domainName'); // should only be one domain per dirsync site
  }

  public deactivateConnector(connector: IDirectoryConnector): void {
    this.deactivateConnectorFn({ connector: connector });
  }

  public deleteDomain(): void {
    this.deleteDomainFn({ domain: this.dirsync.domains[0] });
  }

  public getStatus(): string {
    switch (this.domainStatus) {
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
  public template = require('./dirsync-row.tpl.html');
  public bindings = {
    dirsync: '<',
    deleteDomainFn: '&',
    deactivateConnectorFn: '&',
  };
}
