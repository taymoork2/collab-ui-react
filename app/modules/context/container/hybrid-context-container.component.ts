import { Authinfo } from 'modules/core/scripts/services/authinfo';

/**
 * Structure of a Tab
 */
type ITab = {
  title: string;
  state: string;
};

/**
 * Hybrid Context Container Controller to setup the tabs and the back state
 */
class HybridContextContainerController implements ng.IComponentController {

  public backState: string;
  public tabs: ITab[];

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Authinfo: Authinfo,
  ) {}

  public $onInit() {
    this.tabs = [{
      title: this.$translate.instant('servicesOverview.cards.hybridContext.buttons.resources'),
      state: 'context-resources',
    }];
    // Add Fields and Fieldsets tabs if the user is not a Partner
    if (!this.Authinfo.isCustomerLaunchedFromPartner()) {
      this.tabs.push({
        title: this.$translate.instant('servicesOverview.cards.hybridContext.buttons.fields'),
        state: 'context-fields',
      }, {
        title: this.$translate.instant('servicesOverview.cards.hybridContext.buttons.fieldsets'),
        state: 'context-fieldsets',
      });
    }
    // Set default backState if it is not provided
    this.backState = this.backState || 'services-overview';
  }
}

/**
 * Hybrid Context Container Component that displays the tabs and back button.
 */
export class HybridContextContainerComponent implements ng.IComponentOptions {
  public controller = HybridContextContainerController;
  public template = require('modules/context/container/hybrid-context-container.html');
  public bindings = {
    backState: '<',
  };
}

export default angular
  .module('Context')
  .component('contextContainer', new HybridContextContainerComponent());
