class HcsLicenseActiveCardController implements ng.IComponentController {
  /* @ngInject */
  constructor(
  ) {}
}

export class HcsLicenseActiveCardComponent implements ng.IComponentOptions {
  public controller = HcsLicenseActiveCardController;
  public template = `
    <article>
      <div class="cs-card">
        <h4 translate="hcs.license.title"></h4>
      </div>
      <div class="active-card_content active-card-center_content">
        <div class="active-card_section">
          <div class="active-card_action"><a translate="hcs.license.perpetual"></a></div>
        </div>
        <div class="active-card_section">
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
