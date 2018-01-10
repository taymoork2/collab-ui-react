class HybridTestingActiveCardController implements ng.IComponentController {

  /* @ngInject */
  constructor(
  ) {}

  public $onInit() {
  }

}
export class HybridTestingActiveCardComponent implements ng.IComponentOptions {
  public controller = HybridTestingActiveCardController;
  public template = `
      <article>
        <div class="active-card_header">
          <h4 translate="servicesOverview.cards.hybridTesting.title"></h4>
          <i class="icon icon-question-circle" tooltip="{{::'servicesOverview.cards.hybridTesting.description' | translate}}" tooltip-placement="bottom-right"></i>
        </div>
        <div class="active-card_content">
          <div class="active-card_section">
            <div class="active-card_title" translate="servicesOverview.cards.shared.service"></div>
            <div class="active-card_action"><a ui-sref="taasSuites"><p translate="servicesOverview.cards.hybridTesting.edit"></p></a></div>
          </div>
        </div>
        <div class="active-card_footer">
          <a>
            <span translate="{{'servicesOverview.cardStatus.'+ $ctrl.serviceStatus.status}}"></span>
            <cs-statusindicator ng-model="$ctrl.serviceStatus.cssClass" ng-click="$ctrl.openClusterMapping()"></cs-statusindicator>
          </a>
        </div>
      </article>
    `;
  public bindings = {
    serviceStatus: '<',
  };
}

