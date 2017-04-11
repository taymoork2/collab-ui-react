import { IToolkitModalService } from 'modules/core/modal';
import { TelephonyDomainService } from '../telephonyDomain.service';

class GmTdNumbersCtrl implements ng.IComponentController {

  /* @ngInject */
  public constructor(
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
}

export class GmTdNumbersComponent implements ng.IComponentOptions {
  public controller = GmTdNumbersCtrl;
  public templateUrl = 'modules/gemini/telephonyDomain/details/gmTdNumbers.html';
}
