import { Authinfo } from 'modules/core/scripts/services/authinfo';

class HybridContextActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
    private Authinfo: Authinfo,
    private FeatureToggleService,
  ) {}

  protected isPartnerAdmin = this.Authinfo.isCustomerLaunchedFromPartner();
  protected hasContextServiceOnboardingFeature: boolean = false;

  public $onInit() {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasContextServiceOnboarding)
      .then(supports => this.hasContextServiceOnboardingFeature = supports);
  }
}

export class HybridContextActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridContextActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="servicesOverview.cards.hybridContext.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.hybridContext.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.resources"></div>
          <div class="active-card_action"><a ui-sref="context-resources" translate="servicesOverview.cards.shared.viewAll"></a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
          <div class="active-card_action">
            <a ui-sref="context-fields" ng-if="!$ctrl.isPartnerAdmin" translate="servicesOverview.cards.hybridContext.buttons.fields"></a><br>
            <a ui-sref="context-fieldsets" ng-if="!$ctrl.isPartnerAdmin" translate="servicesOverview.cards.hybridContext.buttons.fieldsets"></a><br>
            <a ui-sref="context-settings" ng-if="$ctrl.hasContextServiceOnboardingFeature" translate="servicesOverview.cards.hybridContext.buttons.settings"></a>
          </div>
        </div>
      </div>
      <div class="active-card_footer">
        <a ui-sref="context-resources">
          <span translate="{{'servicesOverview.cardStatus.'+$ctrl.serviceStatus.status}}"></span>
          <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass"></cs-statusindicator>
        </a>
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}
