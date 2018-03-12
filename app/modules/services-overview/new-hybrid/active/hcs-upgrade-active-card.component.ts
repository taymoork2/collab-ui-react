class HcsUpgradeActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HcsUpgradeActiveCardComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeActiveCardController;
  public template = `
    <article>
      <div class="cs-card">
        <h4 translate="hcs.upgrade.title"></h4>
      </div>
      <div class="active-card_content active-card-center_content">
        <div class="active-card_section">
          <div class="active-card_action"><a translate="hcs.upgrade.sftp"></a></div>
        </div>
        <div class="active-card_section">
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
