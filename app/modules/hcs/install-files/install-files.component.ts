import { HcsSetupModalService } from 'modules/hcs/shared/';

interface IInstallFileObject {
  id: string;
  name: string;
  version: string;
  httpProxies: string[];
  copFileLink?: string;
  tarFileLink?: string;
}

export class InstallFilesComponent implements ng.IComponentOptions {
  public controller = InstallFilesCtrl;
  public template = require('./install-files.component.html');
}

export class InstallFilesCtrl implements ng.IComponentController {
  public installFilesList: IInstallFileObject[] = [];

  /* @ngInject */
  constructor(
    private HcsSetupModalService: HcsSetupModalService,
  ) {}

  public $onInit(): void {
    this.installFilesList.push({
      id: 'ax1234b',
      name: 'Atlanta-dc1',
      version: 'v20171130',
      httpProxies: ['192.168.1.9:8088', '10.94.148.12:8080'],
    }, {
      id: 'ax1234v',
      name: 'Atlanta-dc2',
      version: 'v20171130',
      httpProxies: ['192.168.1.9:8088', '10.94.148.12:8080'],
    }, {
      id: 'ax1234n',
      name: 'Louisville-dc1',
      version: 'v20171450',
      httpProxies: ['182.41.33.7:8079', '130.80.4.4:8079', '10.84.3.3:8070'],
    }, {
      id: 'ax1234o',
      name: 'Louisville-dc2',
      version: 'v20171450',
      httpProxies: ['192.168.1.9:8088', '10.94.148.12:8080'],
    }, {
      id: 'ax1234t',
      name: 'London-dc1',
      version: 'v20171130',
      httpProxies: ['192.168.1.9:8088', '10.94.148.12:8080'],
    }, {
      id: 'ax1234s',
      name: 'London-dc1',
      version: 'v20171450',
      httpProxies: ['182.41.33.7:8079'],
    });
  }

  public proxieRange(min: number, max: number, step: number): number[] {
    step = step || 1;
    let input: number[];
    input = [];
    for (let i = min; i <= max; i += step) {
      input.push(i);
    }
    return input;
  }

  public closeCard(): void {}

  public cardSelected(): void {}

  public addAgentInstallFile(): void {
    this.HcsSetupModalService.openAgentInstallFileModal();
  }
}
