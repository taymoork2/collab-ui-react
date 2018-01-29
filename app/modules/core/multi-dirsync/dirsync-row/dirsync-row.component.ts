import { IDirectoryConnector, IDirectorySync } from '../index';

export class DirsyncRowController {
  public dirsync: IDirectorySync;
  public deleteDomainFn: Function;
  public deactivateConnectorFn: Function;

  public connectors: any[] = [];

  /* @ngInject */
  public constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    this.connectors = _.map(this.dirsync.connectors, (connector: IDirectoryConnector) => {
      return {
        isInService: connector.isInService,
        name: connector.name,
        status: connector.isInService ? 'primary' : 'disabled',
      };
    });
  }

  public get domainName(): string {
    return _.get(this.dirsync, 'domains[0].domainName'); // should only be one domain per dirsync site
  }

  public getTooltip(connector: IDirectoryConnector): string {
    return connector.isInService ?  this.$translate.instant('globalSettings.multiDirsync.pcOnline') :  this.$translate.instant('globalSettings.multiDirsync.pcOffline');
  }

  public deactivateConnector(connector: IDirectoryConnector): void {
    this.deactivateConnectorFn({ connector: connector });
  }

  public deleteDomain(): void {
    this.deleteDomainFn({ domain: this.dirsync.domains[0] });
  }

  public getStatus(): string {
    switch (this.dirsync.siteStatus) {
      case 'danger':
        return 'globalSettings.multiDirsync.outage';
      case 'warning':
        return 'globalSettings.multiDirsync.degraded';
      default: // default option is 'success'
        return 'globalSettings.multiDirsync.operational';
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
