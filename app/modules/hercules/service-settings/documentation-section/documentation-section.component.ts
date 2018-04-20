interface IDocumentationSectionCtrl {
  helpLink: string;
  localizedServiceName: string;
  downloadLink: string;
}

class DocumentationSectionCtrl implements IDocumentationSectionCtrl, ng.IComponentController {
  public documentationSection = {
    title: 'common.help',
  };
  public helpLink: string;
  public localizedServiceName: string;
  public downloadLink: string;
  public downloadDemoLink: string;
  private serviceId: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) { }

  public $onInit() {

    this.localizedServiceName = this.$translate.instant('hercules.hybridServiceNames.' + this.serviceId);

    if (this.serviceId === 'squared-fusion-media') {
      this.downloadLink = 'https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/Media-Fusion-Management-Connector/mfusion.ova';
      this.downloadDemoLink = 'https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/hybrid-media-demo/hybridmedia_demo.ova';
      this.helpLink = 'https://www.cisco.com/go/hybrid-services-media';
    }
    if (this.serviceId === 'spark-hybrid-datasecurity') {
      this.downloadLink = 'https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/HybridDataSecurityProduction/hds.ova';
      this.helpLink = 'http://www.cisco.com/go/hybrid-data-security';
    }

    /* Common for Expressway-based Hybrid Services */
    if (this.serviceId === 'squared-fusion-cal' || this.serviceId === 'squared-fusion-uc' || this.serviceId === 'spark-hybrid-impinterop') {
      this.helpLink = 'http://www.cisco.com/go/hybrid-services';
      this.downloadLink = 'https://software.cisco.com/download/find.html?q=expressway&task=default&psaMode=AP';
    }

    if (this.serviceId === 'squared-fusion-cal') {
      this.helpLink = 'https://www.cisco.com/go/hybrid-services-calendar';
    }

    if (this.serviceId === 'squared-fusion-uc') {
      this.helpLink = 'https://www.cisco.com/go/hybrid-services-call';
    }

    if (this.serviceId === 'ept') {
      this.helpLink = 'https://www.cisco.com/go/spark-calling-branch-office';
    }
  }
}

class DocumentationSectionComponent implements ng.IComponentOptions {
  public controller = DocumentationSectionCtrl;
  public template = require('modules/hercules/service-settings/documentation-section/documentation-section.html');
  public bindings = {
    serviceId: '<',
  };
}

export default angular
  .module('Hercules')
  .component('documentationSection', new DocumentationSectionComponent())
  .name;
