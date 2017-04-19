import { IToolkitModalService } from 'modules/core/modal';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmTdNumbersCtrl implements ng.IComponentController {

  /* @ngInject */
  public constructor(
    private gemService,
    private $window: ng.IWindowService,
    private $modal: IToolkitModalService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {

  }

  public $onInit() {
    //TODO, for xiaoyuan
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
