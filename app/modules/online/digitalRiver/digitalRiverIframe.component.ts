import { DigitalRiverService } from './digitalRiver.service';

interface IChangesObject {
  iframeSrc: ng.IChangesObject;
  iframeLoading: ng.IChangesObject;
}

class DigitalRiverIframe {
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

  private $onInit(): void {
    this.logoutUrl = this.$sce.trustAsResourceUrl(this.DigitalRiverService.getLogoutUrl());
  }

  private $onChanges(changes: IChangesObject): void {
    if (changes.iframeSrc && changes.iframeSrc.currentValue) {
      this.requestedUrl = this.$sce.trustAsResourceUrl(changes.iframeSrc.currentValue);
    }
  }
}

export class DigitalRiverIframeComponent implements ng.IComponentOptions {
  public controller = DigitalRiverIframe;
  public templateUrl = 'modules/online/digitalRiver/digitalRiverIframe.html';
  public bindings: { [bindings: string]: string} = {
    iframeSrc: '<',
    iframeLoading: '<',
  };
}