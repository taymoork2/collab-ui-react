import { HcsUpgradeService, HcsSetupModalService, HcsSetupModalSelect } from 'modules/hcs/shared';
import { SftpServer } from '../../setup/hcs-setup-sftp';
interface IHeaderTab {
  title: string;
  state: string;
}

export class HcsUpgradeSftpListCtrl implements ng.IComponentController {

  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'partner-services-overview';
  public sftpList: SftpServer[];
  public filteredSftpList: SftpServer[];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private HcsUpgradeService: HcsUpgradeService,
    private HcsSetupModalService: HcsSetupModalService,
  ) {}

  public $onInit() {
    this.tabs.push({
      title: this.$translate.instant('hcs.sftp.title'),
      state: `hcs.sftplist`,
    }, {
      title: this.$translate.instant('hcs.softwareProfiles.tabTitle'),
      state: `hcs.sftplist`,
    });

    this.HcsUpgradeService.listSftpServers().then(list => {
      this.sftpList = _.get(list, 'sftpServers');
    });
  }


  public addSftp(): void {
    this.HcsSetupModalService.openSetupModal(false, HcsSetupModalSelect.SftpServerSetup);
  }

  public deleteSftp(): void {}

  public editSftp(): void {}
}

export class HcsUpgradeSftpListComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeSftpListCtrl;
  public template = require('./hcs-upgrade-sftp-list.component.html');
}
