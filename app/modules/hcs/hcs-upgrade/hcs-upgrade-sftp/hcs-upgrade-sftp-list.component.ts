import { HcsUpgradeService, HcsSetupModalService, HcsSetupModalSelect } from 'modules/hcs/shared';
import { SftpServer } from '../../setup/hcs-setup-sftp';
import { CardUtils } from 'modules/core/cards';
import { IToolkitModalService } from 'modules/core/modal';

interface IHeaderTab {
  title: string;
  state: string;
}

export class HcsUpgradeSftpListCtrl implements ng.IComponentController {

  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'partner-services-overview';
  public sftpList: SftpServer[];
  public currentSftpList: SftpServer[];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HcsUpgradeService: HcsUpgradeService,
    private HcsSetupModalService: HcsSetupModalService,
    private $state: ng.ui.IStateService,
    public CardUtils: CardUtils,
    public $modal: IToolkitModalService,
  ) {}

  public $onInit() {
    this.tabs.push({
      title: this.$translate.instant('hcs.sftp.title'),
      state: `hcs.sftplist`,
    }, {
      title: this.$translate.instant('hcs.softwareProfiles.tabTitle'),
      state: `hcs.swprofilelist`,
    });
    this.listSftpServers();
  }

  public listSftpServers(): void {
    this.HcsUpgradeService.listSftpServers().then(list => {
      this.sftpList = _.get(list, 'sftpServers');
      this.currentSftpList = this.sftpList;
    });
  }

  public filteredList(searchStr: string): void {
    if (_.isEmpty(searchStr)) {
      this.currentSftpList = this.sftpList;
    }
    this.currentSftpList = _.filter(this.sftpList, sftp => {
      return sftp.name.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1;
    });
    this.reInstantiateMasonry();
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public reloadPage(): void {
    this.$state.go('hcs.sftpserver-list', { reload: true });
  }

  public addSftp(): void {
    this.HcsSetupModalService.openSetupModal(false, HcsSetupModalSelect.SftpServerSetup);
  }

  public deleteSftp(sftp: SftpServer, $event: Event): void {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.$modal.open({
      template: '<hcs-delete-modal delete-fn="$ctrl.deleteFn()" dismiss="$dismiss()" modal-title="$ctrl.title" modal-description="$ctrl.description"></hcs-delete-modal>',
      controller: () => {
        return {
          deleteFn: () => this.deleteSftpService(sftp),
          title: this.$translate.instant('common.delete') + ' ' + sftp.name + '?',
          description: this.$translate.instant('hcs.sftp.deleteModalDesc'),
        };
      },
      modalClass: 'hcs-delete-modal-class',
      controllerAs: '$ctrl',
      type: 'dialog',
    }).result.then(() => {
      this.reInstantiateMasonry();
    });
  }

  public deleteSftpService(sftp: SftpServer) {
    this.HcsUpgradeService.deleteSftpServer(sftp.uuid).then(() => {
      this.listSftpServers();
    });
  }

  public editSftp(sftp: SftpServer): void {
    this.$state.go('hcs.sftpserver-edit', { sftpServer: sftp });
  }
}

export class HcsUpgradeSftpListComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeSftpListCtrl;
  public template = require('./hcs-upgrade-sftp-list.component.html');
}
