export class SipDestinationTestResultRowComponent implements ng.IComponentOptions {
  public template = `
  <div class="row row-test">
    <div class="columns medium-4"><p>{{::$ctrl.titleKey | translate}}</p></div>
    <div class="columns medium-2">
      <div ng-if="$ctrl.data === null" class="not-performed"><p translate="hercules.settings.verifySipDestination.notPerformed"></p></div>
      <div ng-if="$ctrl.data.status === 'success'" class="success"><p translate="hercules.settings.verifySipDestination.successful"></p></div>
      <div ng-if="$ctrl.data.status === 'error'" class="fail"><p translate="hercules.settings.verifySipDestination.failed"></p></div>
    </div>
    <div class="columns medium-6">
      <p ng-if="$ctrl.data.status === 'error'" ng-bind-html="'hercules.settings.verifySipDestination.fixes.' + $ctrl.data.type | translate"></p>
    </div>
  </div>
  `;
  public bindings = {
    data: '<',
    titleKey: '<',
  };
}
