import { DigitalRiverService } from './digitalRiver.service';

class DigitalRiverIframe implements ng.IComponentController {
  public iframeLoading: boolean = true;
  public logoutLoading: boolean = true;

  public iframeSrc: string;
  public logoutUrl: string;
  public requestedUrl: string;

  /* @ngInject */
  constructor(
    private $sce: ng.ISCEService,
    private DigitalRiverService: DigitalRiverService
  ) {}

  public $onInit(): void {
    this.logoutUrl = this.$sce.trustAsResourceUrl(this.DigitalRiverService.getLogoutUrl());
  }

  public $onChanges(changes: { [property: string]: ng.IChangesObject }): void {
    let iframeSrcChange = changes['iframeSrc'];
    if (iframeSrcChange && iframeSrcChange.currentValue) {
      this.requestedUrl = this.$sce.trustAsResourceUrl(iframeSrcChange.currentValue);
    }
  }
}

export class DigitalRiverIframeComponent implements ng.IComponentOptions {
  public controller = DigitalRiverIframe;
  public templateUrl = 'modules/online/digitalRiver/digitalRiverIframe.html';
  public bindings = <{ [bindings: string]: string }>{
    iframeSrc: '<',
    iframeLoading: '<',
  };
}
