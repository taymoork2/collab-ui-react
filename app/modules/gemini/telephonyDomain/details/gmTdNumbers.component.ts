import { IToolkitModalService } from 'modules/core/modal';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmTdNumbersCtrl implements ng.IComponentController {

  public panelTitle: string;

  private currentTD: any = {};

  /* @ngInject */
  public constructor(
    private gemService,
    private $window: ng.IWindowService,
    private $state: ng.ui.IStateService,
    private $modal: IToolkitModalService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.currentTD = this.gemService.getStorage('currentTelephonyDomain');
    this.panelTitle = this.currentTD.domainName || this.gemService.getStorage('panelTitle');
    if (this.currentTD) {

    }
  }

  public $onInit() {
    this.$state.current.data.displayName = this.$translate.instant('gemini.cbgs.overview');
  }

  public onDownload() {
    this.$modal.open({
      type: 'dialog',
      templateUrl: 'modules/gemini/telephonyDomain/details/downloadConfirm.html',
    }).result.then(() => {
      this.$window.open(this.TelephonyDomainService.getDownloadUrl());
    });
  }

  public onImportTD() {
    this.$modal.open({
      type: 'default',
      template: '<gm-import-td dismiss="$dismiss()" close="$close()" class="new-field-modal"></gm-import-td>',
    }).result.then(() => {
      this.gemService.getStorage('currentTelephonyDomain'); // TODO, for xiaoyuan
    });
  }
}

export class GmTdNumbersComponent implements ng.IComponentOptions {
  public controller = GmTdNumbersCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdNumbers.html';
}
