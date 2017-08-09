import { CallDestinationTranslateObject } from 'modules/call/shared/call-destination-translate/call-destination-translate-object';

export class CallDestinationTranslateService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public getCallDestinationTranslate() {
    return new CallDestinationTranslateObject({
      numberFormat: this.$translate.instant('callDestination.numberFormat'),
      internal: this.$translate.instant('callDestination.numberFormat'),
      external: this.$translate.instant('callDestination.numberFormat'),
      uri: this.$translate.instant('callDestination.numberFormat'),
      custom: this.$translate.instant('callDestination.numberFormat'),
      internalPlaceholder: this.$translate.instant('callDestination.numberFormat'),
      internalHelpText: this.$translate.instant('callDestination.numberFormat'),
      externalHelpText: this.$translate.instant('callDestination.numberFormat'),
      uriPlaceholder: this.$translate.instant('callDestination.numberFormat'),
      customPlaceholder: this.$translate.instant('callDestination.numberFormat'),
      customHelpText: this.$translate.instant('callDestination.numberFormat'),
      alternateCustomPlaceholder: this.$translate.instant('callDestination.numberFormat'),
      alternateCustomHelpText: this.$translate.instant('callDestination.numberFormat'),
      commonInvalidFormat: this.$translate.instant('callDestination.numberFormat'),
      commonInvalidRequired: this.$translate.instant('callDestination.numberFormat'),
    });
  }
}
