import { HcsSetupModalService, HcsSetupModalSelect, HcsControllerService } from 'modules/hcs/hcs-shared/';
import { IToolkitModalService } from 'modules/core/modal';
import { IHcsInstallables } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';
import { CardUtils } from 'modules/core/cards';

export class InstallFilesComponent implements ng.IComponentOptions {
  public controller = InstallFilesCtrl;
  public template = require('./agent-install-files-list.component.html');
}

export class InstallFilesCtrl implements ng.IComponentController {
  public installFilesList: IHcsInstallables[] = [];
  public allInstallFilesList: IHcsInstallables[] = [];
  public loading: boolean = true;
  /* @ngInject */
  constructor(
    private HcsSetupModalService: HcsSetupModalService,
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private HcsControllerService: HcsControllerService,
    private Notification: Notification,
    public CardUtils: CardUtils,
  ) {}

  public $onInit(): void {
    this.listAgentInstallFiles();
  }

  public listAgentInstallFiles(): void {
    this.loading = true;
    this.HcsControllerService.listAgentInstallFile().then(resp => {
      this.loading = false;
      this.allInstallFilesList = resp;
      this.installFilesList = _.cloneDeep(this.allInstallFilesList);
      this.setFileInfo();
    });
  }

  public setFileInfo(): void {
    _.forEach(this.installFilesList, (file) => {
      this.HcsControllerService.getAgentInstallFile(file.uuid)
      .then(resp => {
        file.fileInfo = _.get(resp, 'files');
      });
    });
  }

  public deleteCard(uuid: string, $event: Event): void {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.$modal.open({
      template: '<hcs-delete-modal delete-fn="$ctrl.deleteFn()" dismiss="$dismiss()" modal-title="$ctrl.title" modal-description="$ctrl.description"></hcs-delete-modal>',
      controller: () => {
        return {
          deleteFn: () => this.deleteAgentInstallFile(uuid),
          title: this.$translate.instant('hcs.installFiles.deleteModal.title'),
          description: this.$translate.instant('hcs.installFiles.deleteModal.description'),
        };
      },
      modalClass: 'hcs-delete-modal-class',
      controllerAs: '$ctrl',
      type: 'dialog',
    });
  }

  public deleteAgentInstallFile(uuid): void {
    this.HcsControllerService.deleteAgentInstallFile(uuid)
    .then(() => {
      this.listAgentInstallFiles();
      this.reInstantiateMasonry();
    })
    .catch( error => {
      this.Notification.error('hcs.installFiles.error', error.data);
    });
  }

  public addAgentInstallFile(): void {
    this.HcsSetupModalService.openSetupModal(false, HcsSetupModalSelect.AgentInstallFileSetup);
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public filteredList(searchStr: string): void {
    if (_.isEmpty(searchStr)) {
      this.installFilesList = this.allInstallFilesList;
    }
    this.installFilesList = _.filter(this.allInstallFilesList, file => {
      return file.label.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1;
    });
    this.reInstantiateMasonry();
  }
}
