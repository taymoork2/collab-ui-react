import { HcsSetupModalService, HcsSetupModalSelect, ISoftwareProfile } from 'modules/hcs/hcs-shared';
import { CardUtils } from 'modules/core/cards';
import { IToolkitModalService } from 'modules/core/modal';
import { HcsUpgradeService } from 'modules/hcs/hcs-shared';

interface IHeaderTab {
  title: string;
  state: string;
}

export class HcsUpgradeSwprofileListCtrl implements ng.IComponentController {

  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'partner-services-overview';
  public swprofileList: ISoftwareProfile[];
  public currentList: ISoftwareProfile[];
  public loading: boolean = true;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    public CardUtils: CardUtils,
    public HcsSetupModalService: HcsSetupModalService,
    private $state: ng.ui.IStateService,
    public $modal: IToolkitModalService,
    private HcsUpgradeService: HcsUpgradeService,
  ) {}

  public $onInit() {
    this.tabs.push({
      title: this.$translate.instant('hcs.sftp.title'),
      state: `hcs.sftplist`,
    }, {
      title: this.$translate.instant('hcs.softwareProfiles.tabTitle'),
      state: `hcs.swprofilelist`,
    });
    this.listSwProfile();
  }

  public listSwProfile(): void {
    this.loading = true;
    this.HcsUpgradeService.listSoftwareProfiles().then(data => {
      this.swprofileList = _.get(data, 'softwareProfiles');
      this.currentList = this.swprofileList;
    }).finally(() => this.loading = false);
  }

  public filteredList(searchStr: string): void {
    if (_.isEmpty(searchStr)) {
      this.currentList = this.swprofileList;
    }
    this.currentList = _.filter(this.swprofileList, swprofile => {
      return swprofile.name.toLowerCase().indexOf(searchStr.toLowerCase()) !== -1;
    });
    this.reInstantiateMasonry();
  }

  public reInstantiateMasonry(): void {
    this.CardUtils.resize();
  }

  public addSwProfile(): void {
    this.HcsSetupModalService.openSetupModal(false, HcsSetupModalSelect.SoftwareProfileSetup);
  }

  public deleteSwProfile( swProfile: ISoftwareProfile, $event: Event): void {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.$modal.open({
      template: '<hcs-delete-modal delete-fn="$ctrl.deleteFn()" dismiss="$dismiss()" modal-title="$ctrl.title" modal-description="$ctrl.description"></hcs-delete-modal>',
      controller: () => {
        return {
          deleteFn: () => this.deleteSwProfileService(_.get(swProfile, 'uuid')),
          title: this.$translate.instant('common.delete') + ' ' + swProfile.name + '?',
          description: this.$translate.instant('hcs.softwareProfiles.deleteModalDesc'),
        };
      },
      modalClass: 'hcs-delete-modal-class',
      controllerAs: '$ctrl',
      type: 'dialog',
    }).result.then(() => {
      this.reInstantiateMasonry();
    });
  }

  public deleteSwProfileService(uuid: string): void {
    this.HcsUpgradeService.deleteSoftwareProfile(uuid).then(() => this.listSwProfile());
  }

  public editSwProfile(swprofile: ISoftwareProfile): void {
    this.$state.go('hcs.swprofile-edit', { swprofile: swprofile });
  }
}

export class HcsUpgradeSwprofileListComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeSwprofileListCtrl;
  public template = require('./hcs-upgrade-swprofile-list.component.html');
}
