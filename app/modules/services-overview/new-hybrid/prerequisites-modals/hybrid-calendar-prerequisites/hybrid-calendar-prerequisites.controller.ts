import '../_common-hybrid-prerequisites.scss';

export class HybridCalendarPrerequisitesController {

  public expresswayTabHeading: string = this.$translate.instant('servicesOverview.cards.hybridCall.prerequisites.expresswaySetup.tabHeading', {
    checked: 0,
    total: 6,
  });
  public calendarTabHeading: string = this.$translate.instant('servicesOverview.cards.hybridCalendar.premisesBasedPrerequisites.tabHeading', {
    checked: 0,
    total: 8,
  });

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $window: ng.IWindowService,
  ) { }

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

  public calendarData = (options) => {
    if (!_.isUndefined(options.numberChecked) && !_.isUndefined(options.totalNumber)) {
      this.calendarTabHeading = this.$translate.instant('servicesOverview.cards.hybridCalendar.premisesBasedPrerequisites.tabHeading', {
        checked: options.numberChecked,
        total: options.totalNumber,
      });
    }
    if (!_.isUndefined(options.openDocumentation)) {
      this.openDocumentation();
    }
  }

  public openDocumentation() {
    this.$window.open('https://www.cisco.com/c/en/us/td/docs/voice_ip_comm/cloudCollaboration/spark/hybridservices/calendarservice/cmgt_b_deploy-spark-hybrid-calendar-service/cmgt_b_deploy-hybrid-calendar-exchange_chapter_01.html');
  }

}

export default angular
  .module('services-overview.hybrid-calendar-prerequisites', [
    require('angular-translate'),
  ])
  .controller('HybridCalendarPrerequisitesController', HybridCalendarPrerequisitesController)
  .name;
