class HcsUpgradeActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HcsUpgradeActiveCardComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeActiveCardController;
  public template = `
    <article>
      <div class="active-card_header">
        <h4 translate="hcs.upgrade.title"></h4>
        <i class="icon icon-question-circle" tooltip="{{::'hcs.upgrade.description' | translate}}" tooltip-placement="bottom-right" tabindex="0" tooltip-trigger="focus mouseenter" aria-label="{{::'servicesOverview.cards.privateTrunk.description' | translate}}"></i>
      </div>
      <div class="active-card_content">
        <div class="active-card_section">
          <div class="active-card_title" translate="hcs.upgrade.sftp"></div>
          <div class="active-card_action"><a translate="hcs.upgrade.sftp"></a></div>
        </div>
        <div class="active-card_section">
          <div class="active-card_title" translate="hcs.upgrade.softwareProfiles"></div>
          <div class="active-card_action"><a translate="hcs.upgrade.softwareProfiles"></a></div>
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
