export class HybridCallPrerequisitesController {

  public expresswayTabHeading: string = this.$translate.instant('servicesOverview.cards.hybridCall.prerequisites.expresswaySetup.tabHeading', {
    checked: 0,
    total: 6,
  });
  public awareTabHeading: string = this.$translate.instant('servicesOverview.cards.hybridCall.prerequisites.awareSetup.tabHeading', {
    checked: 0,
    total: 7,
  });
  public connectTabHeading: string = this.$translate.instant('servicesOverview.cards.hybridCall.prerequisites.connectSetup.tabHeading', {
    checked: 0,
    total: 9,
  });

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
    public callServiceConnectOnly: boolean,
  ) {
  }

  public expresswayData = (options) => {
    if (!_.isUndefined(options.numberChecked) && !_.isUndefined(options.totalNumber)) {
      this.expresswayTabHeading = this.$translate.instant('servicesOverview.cards.hybridCall.prerequisites.expresswaySetup.tabHeading', {
        checked: options.numberChecked,
        total: options.totalNumber,
      });
    }
    if (!_.isUndefined(options.openDocumentation)) {
      this.openDocumentation();
    }
  }

  public awareData = (options) => {
    if (!_.isUndefined(options.numberChecked) && !_.isUndefined(options.totalNumber)) {
      this.awareTabHeading = this.$translate.instant('servicesOverview.cards.hybridCall.prerequisites.awareSetup.tabHeading', {
        checked: options.numberChecked,
        total: options.totalNumber,
      });
    }
    if (!_.isUndefined(options.openDocumentation)) {
      this.openDocumentation();
    }
  }

  public connectData = (options) => {
    if (!_.isUndefined(options.numberChecked) && !_.isUndefined(options.totalNumber)) {
      this.connectTabHeading = this.$translate.instant('servicesOverview.cards.hybridCall.prerequisites.connectSetup.tabHeading', {
        checked: options.numberChecked,
        total: options.totalNumber,
      });
    }
    if (!_.isUndefined(options.openDocumentation)) {
      this.openDocumentation();
    }
  }

  private openDocumentation() {
    this.$window.open('https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cloudCollaboration/spark/hybridservices/callservices/cmgt_b_ciscospark-hybrid-call-service-config-guide/cmgt_b_ciscospark-hybrid-call-service-config-guide_chapter_011.html');
  }

}

export default angular
  .module('services-overview.hybrid-call-prerequisites', [
    require('angular-translate'),
  ])
  .controller('HybridCallPrerequisitesController', HybridCallPrerequisitesController)
  .name;
