import { HcsSetupModalService, HcsSetupModalSelect } from 'modules/hcs/hcs-shared/';
import { IToolkitModalService } from 'modules/core/modal';

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
  public template = require('./agent-install-files-list.component.html');
}

export class InstallFilesCtrl implements ng.IComponentController {
  public installFilesList: IInstallFileObject[] = [];
  public installFileToBeDeleted: IInstallFileObject;

  /* @ngInject */
  constructor(
    private HcsSetupModalService: HcsSetupModalService,
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
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

  public closeCard(installFile: IInstallFileObject, $event: Event): void {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.installFileToBeDeleted = installFile;
    this.$modal.open({
      template: '<hcs-delete-modal delete-fn="$ctrl.deleteFn()" dismiss="$dismiss()" modal-title="$ctrl.title" modal-description="$ctrl.description"></hcs-delete-modal>',
      controller: () => {
        return {
          deleteFn: () => this.deleteAgentInstallFile(),
          title: this.$translate.instant('hcs.installFiles.deleteModal.title'),
          description: this.$translate.instant('hcs.installFiles.deleteModal.description'),
        };
      },
      modalClass: 'hcs-delete-modal-class',
      controllerAs: '$ctrl',
      type: 'dialog',
    });
  }

  public cardSelected(): void {}

  public deleteAgentInstallFile(): void {
    //delete intsall file && update install file list
  }

  public addAgentInstallFile(): void {
    this.HcsSetupModalService.openSetupModal(false, HcsSetupModalSelect.AgentInstallFileSetup);
  }
}
