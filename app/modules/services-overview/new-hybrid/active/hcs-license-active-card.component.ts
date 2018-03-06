class HcsLicenseActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HcsLicenseActiveCardComponent implements ng.IComponentOptions {
  public controller = HcsLicenseActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="hcs.license.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'hcs.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter" aria-label="{{::'servicesOverview.cards.privateTrunk.description' | translate}}"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title" translate="hcs.license.perpetual"></div>
          <div class="active-card_action"><a translate="hcs.license.perpetual"></a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="hcs.license.subscriptions"></div>
          <div class="active-card_action"><a translate="hcs.license.subscriptions"></a></div>
        </div>
      </div>
      <div class="active-card_footer" style="display:none">
      </div>
    </article>
  `;
  public bindings = {
    serviceStatus: '<',
  };
}
