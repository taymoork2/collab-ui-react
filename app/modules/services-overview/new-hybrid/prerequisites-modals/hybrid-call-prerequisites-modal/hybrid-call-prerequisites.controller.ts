export class HybridCallPrerequisitesController {

  public expresswayTabHeading: string = 'Expressway-C Connector Host (0/6)';
  public awareTabHeading: string = 'Hybrid Call Service Aware (0/7)';
  public connectTabHeading: string = 'Hybrid Call Service Connect (0/9)';

  /* @ngInject */
  constructor(
    private $window: ng.IWindowService,
  ) {
  }

  public expresswayData = (options) => {
    if (!_.isUndefined(options.numberChecked) && !_.isUndefined(options.totalNumber)) {
      this.expresswayTabHeading = `Expressway-C Connector Host (${options.numberChecked}/${options.totalNumber})`;
    }
    if (!_.isUndefined(options.openDocumentation)) {
      this.openDocumentation();
    }
  }

  public awareData = (options) => {
    if (!_.isUndefined(options.numberChecked) && !_.isUndefined(options.totalNumber)) {
      this.awareTabHeading = `Hybrid Call Service Aware (${options.numberChecked}/${options.totalNumber})`;
    }
    if (!_.isUndefined(options.openDocumentation)) {
      this.openDocumentation();
    }
  }

  public connectData = (options) => {
    if (!_.isUndefined(options.numberChecked) && !_.isUndefined(options.totalNumber)) {
      this.connectTabHeading = `Hybrid Call Service Connect (${options.numberChecked}/${options.totalNumber})`;
    }
    if (!_.isUndefined(options.openDocumentation)) {
      this.openDocumentation();
    }
  }

  private openDocumentation() {
    this.$window.open('https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cloudCollaboration/spark/hybridservices/callservices/cmgt_b_ciscospark-hybrid-call-service-config-guide/cmgt_b_ciscospark-hybrid-call-service-config-guide_chapter_011.html');
  }

}

angular
  .module('Hercules')
  .controller('HybridCallPrerequisitesController', HybridCallPrerequisitesController);
