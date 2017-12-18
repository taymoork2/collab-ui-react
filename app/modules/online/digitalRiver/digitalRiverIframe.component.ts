import { DigitalRiverService } from './digitalRiver.service';

class DigitalRiverIframe implements ng.IComponentController {
  public iframeLoading: boolean = true;
  public iframeSrc: string;
  public requestedUrl: string;

  private logoutPromise: ng.IHttpPromise<any>;

  /* @ngInject */
  constructor(
    private $sce: ng.ISCEService,
    private DigitalRiverService: DigitalRiverService,
  ) {}

  public $onChanges(changes: { [property: string]: ng.IChangesObject<any> }): void {
    const iframeSrcChange = changes['iframeSrc'];
    if (iframeSrcChange) {
      if (iframeSrcChange.isFirstChange) {
        this.logoutPromise = this.DigitalRiverService.logout();
      }
      if (iframeSrcChange.currentValue) {
        this.logoutPromise.finally(() => {
          this.requestedUrl = this.$sce.trustAsResourceUrl(iframeSrcChange.currentValue);
        });
      }
    }
  }
}

export class DigitalRiverIframeComponent implements ng.IComponentOptions {
  public controller = DigitalRiverIframe;
  public template = require('modules/online/digitalRiver/digitalRiverIframe.html');
  public bindings = <{ [bindings: string]: string }>{
    iframeSrc: '<',
    iframeLoading: '<',
  };
}
