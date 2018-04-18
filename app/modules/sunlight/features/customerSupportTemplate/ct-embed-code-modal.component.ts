import { CTService } from './services/CTService';
import { SunlightConfigService } from 'modules/sunlight/services/sunlightConfigService';
class CtEmbedCodeModalController implements ng.IComponentController  {
  public isLoading: boolean = true;
  public embedCodeSnippet: string;
  public domainInfo: any;
  public templateId: string;
  public templateName: string;
  public templateHeader: string;
  /* @ngInject*/
  constructor(
    public $window: ng.IWindowService,
    public CTService: CTService,
    public SunlightConfigService: SunlightConfigService,
  ) {
  }

  public $onInit(): void {
    this.setInitialValues();
  }

  public setInitialValues(): void {
    this.embedCodeSnippet = this.CTService.generateCodeSnippet(this.templateId, this.templateName);
    this.SunlightConfigService.getChatConfig()
      .then((response) => {
        let allowedOrigins: any = _.get(response, 'data.allowedOrigins');
        let warn = false;
        if (allowedOrigins.length === 1 && allowedOrigins[0] === '.*') {
          allowedOrigins = null;
          warn = true;
        }
        this.domainInfo = { data: allowedOrigins, error: false, warn: warn };
      })
      .catch(() => {
        this.domainInfo = { data: null, error: true, warn: false };
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  public downloadEmbedCode($event): void {
    const anchorElement: any = this.$window.document.getElementById('downloadChatCodeTxt');
    const blob = new this.$window.Blob([this.embedCodeSnippet], {
      type: 'text/plain;charset=utf-8;',
    });
    if (this.$window.navigator.msSaveOrOpenBlob) {
      this.$window.navigator.msSaveBlob(blob, 'Chat_Code_Snippet');
      $event.preventDefault();
    } else {
      anchorElement.setAttribute('href', this.$window.URL.createObjectURL(blob));
      anchorElement.setAttribute('download', 'Chat_Code_Snippet');
    }
  }
}

export class CtEmbedCodeModalComponent implements ng.IComponentOptions {
  public controller = CtEmbedCodeModalController;
  public template = require('./wizardPagesComponent/ct-embed-code-modal.tpl.html');
  public bindings = {
    templateId : '@',
    templateHeader: '@',
    templateName: '@',
    dismiss: '&',
  };

}

export default angular
  .module('Sunlight')
  .component('ctEmbedCodeModalComponent', new CtEmbedCodeModalComponent())
  .name;
