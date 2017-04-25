export class GoogleCalendarApiInformationComponent implements ng.IComponentOptions {
  public template =
    `<div class="row">
      <div class="cs-input-group medium-6 columns">
        <label class="cs-input__label" for="client-name" translate="hercules.gcalSetupModal.clientName"></label>
        <input
          id="client-name"
          class="cs-input medium-11"
          readonly
          ng-model="$ctrl.clientId">
      </div>
      <div class="cs-input-group medium-6 columns">
        <label class="cs-input__label" for="scope" translate="hercules.gcalSetupModal.scope"></label>
        <input
          id="scope"
          class="cs-input medium-11"
          readonly
          ng-model="$ctrl.scope">
      </div>
    </div>`;
  public bindings = {
    clientId: '<',
    scope: '<',
  };
}
