import { CallSettingsData, CallSettingsService } from 'modules/call/settings/shared';
import { IToolkitModalService } from 'modules/core/modal';

const MAX_ROUTING_PREFIX_LENGTH: number = 7;

class RoutingPrefixLengthCtrl implements ng.IComponentController {
  public extenstionLength: string;
  public routingPrefix: string;
  public routingPrefixLength: number;
  public settingsData: CallSettingsData;
  public routingPrefixLengthSavedFn: Function;
  public routingPrefixLengthOptions: number[] = [];
  public helpText: string;
  private originalRoutingPrefixLength: number;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private CallSettingsService: CallSettingsService,
    private $modal: IToolkitModalService,
    private ModalService,
  ) { }

  public $onInit(): void {
    this.routingPrefix = _.get(this.settingsData, 'defaultLocation.routingPrefix');
    this.extenstionLength = _.get(this.settingsData, 'customerVoice.extensionLength');
    this.routingPrefixLength = this.originalRoutingPrefixLength = this.routingPrefix ? this.routingPrefix.length : 0;
    this.routingPrefixLengthOptions = this.buildRoutingPrefixLengthOptions();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { routingPrefixLength } = changes;

    if (routingPrefixLength && routingPrefixLength.currentValue) {
      this.originalRoutingPrefixLength = routingPrefixLength.currentValue;
    }
  }

  public onRoutingPrefixLengthChanged(): void {
    if (_.toSafeInteger(this.routingPrefixLength) > _.toSafeInteger(this.originalRoutingPrefixLength)) {
      if (this.hasPendingChanges()) {
        this.openPendingChangesWarningDialog()
          .then(() => this.openIncreaseRoutingPrefixLengthDialog())
          .then(() => this.openRoutingPrefixModal())
          .then(() => this.onRoutingPrefixLengthSaved())
          .catch(() => {
            this.resetRoutingPrefixLength();
          });
      } else {
        this.openIncreaseRoutingPrefixLengthDialog()
          .then(() => this.openRoutingPrefixModal())
          .then(() => this.onRoutingPrefixLengthSaved())
          .catch(() => {
            this.resetRoutingPrefixLength();
          });
      }
    }
  }

  private hasPendingChanges(): boolean {
    return !this.CallSettingsService.matchesOriginalConfig(this.settingsData as CallSettingsData);
  }

  private onRoutingPrefixLengthSaved(): void {
    this.routingPrefixLengthSavedFn();
  }

  private buildRoutingPrefixLengthOptions(): number[] {
    const options: number[] = [];
    const minExtLength = this.routingPrefixLength ? _.toSafeInteger(this.routingPrefixLength) : 0;
    for (let index = minExtLength; index <= MAX_ROUTING_PREFIX_LENGTH; index++) {
      options.push(_.toSafeInteger(index));
    }
    return options;
  }

  private openRoutingPrefixModal(): ng.IPromise<any> {
    return this.$modal.open({
      type: 'small',
      template: `<uc-routing-prefix-length-modal class="ucRoutingPrefixModal" current-routing-prefix="${this.routingPrefix}" new-routing-prefix-length="${this.routingPrefixLength}" old-routing-prefix-length="${this.originalRoutingPrefixLength}" extension-length="${this.extenstionLength}" dismiss="$dismiss()" close="$close()"></uc-routing-prefix-length-modal>`,
    }).result;
  }

  private openPendingChangesWarningDialog(): any {
    return this.ModalService.open({
      title: this.$translate.instant('serviceSetupModal.saveChangesFirstTitle'),
      message: this.$translate.instant('serviceSetupModal.saveChangesFirstMessage'),
      close: this.$translate.instant('serviceSetupModal.continueWithoutSaving'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'negative',
    }).result;
  }

  private openIncreaseRoutingPrefixLengthDialog(): any {
    return this.ModalService.open({
      title: this.$translate.instant('common.warning'),
      message: this.$translate.instant('serviceSetupModal.routingPrefixLength.increaseWarning'),
      close: this.$translate.instant('common.continue'),
      dismiss: this.$translate.instant('common.cancel'),
      btnType: 'negative',
    }).result;
  }

  private resetRoutingPrefixLength(): void {
    this.routingPrefixLength = this.originalRoutingPrefixLength;
  }
}

export class RoutingPrefixLengthComponent implements ng.IComponentOptions {
  public controller = RoutingPrefixLengthCtrl;
  public template = require('modules/call/settings/settings-routing-prefix-length/settings-routing-prefix-length.component.html');
  public bindings = {
    settingsData: '<',
    routingPrefixLengthSavedFn: '&',
  };
}
