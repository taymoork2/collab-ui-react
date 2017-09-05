class LocationsRoutingPrefixCtrl implements ng.IComponentController {
  public ftsw: boolean;
  public routingPrefix: string;
  public routingPrefixLength: string;
  public onChangeFn: Function;
  public routingPrefixForm: ng.IFormController;
  public messages: any = {};
  public minRoutingPrefixLength: string = '1';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { routingPrefixLength } = changes;

    if (routingPrefixLength && routingPrefixLength.currentValue) {
      this.routingPrefixLength = routingPrefixLength.currentValue;
      if (!this.ftsw) {
        this.minRoutingPrefixLength = routingPrefixLength.currentValue;
      }

      this.messages = {
        pattern: this.$translate.instant('serviceSetupModal.routingPrefix.numericOnlyError'),
        minlength: this.$translate.instant('serviceSetupModal.routingPrefix.tooShortErrorParam', { length: this.routingPrefixLength }),
        maxlength: this.$translate.instant('serviceSetupModal.routingPrefix.tooLongError'),
        required: this.$translate.instant('serviceSetupModal.routingPrefix.required'),
      };
    }
  }

  public onRoutingPrefixChanged(): void {
    this.onChangeFn({
      routingPrefix: _.isEmpty(this.routingPrefix) ? null : this.routingPrefix,
    });
  }
}

export class LocationsRoutingPrefixComponent implements ng.IComponentOptions {
  public controller = LocationsRoutingPrefixCtrl;
  public templateUrl = 'modules/call/locations/locations-routing-prefix/locations-routing-prefix.component.html';
  public bindings = {
    ftsw: '<',
    routingPrefix: '<',
    routingPrefixLength: '<',
    onChangeFn: '&',
  };
}
