class LocationsRoutingPrefixCtrl implements ng.IComponentController {
  public routingPrefix: string;
  public onChangeFn: Function;
  public messages: any = {};
  public routingPrefixLength: number;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): void {
    this.messages = {
      pattern: this.$translate.instant('serviceSetupModal.routingPrefix.numericOnlyError'),
      minlength: this.$translate.instant('serviceSetupModal.routingPrefix.tooShortError'),
      maxlength: this.$translate.instant('serviceSetupModal.routingPrefix.tooLongError'),
    };
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
    routingPrefix: '<',
    onChangeFn: '&',
  };
}
