import { CallDestinationTranslateObject } from 'modules/call/shared/call-destination-translate/call-destination-translate-object';

export class CallDestinationTranslateService {
  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  private customNumberValidationPattern: RegExp = /^[ 0-9,#+*sPpFfCc]{1,50}$/;

  public getCallDestinationTranslate() {
    return new CallDestinationTranslateObject({
      numberFormat: this.$translate.instant('callDestination.numberFormat'),
      internal: this.$translate.instant('callDestination.internal'),
      external: this.$translate.instant('callDestination.external'),
      uri: this.$translate.instant('callDestination.uri'),
      custom: this.$translate.instant('callDestination.custom'),
      internalPlaceholder: this.$translate.instant('callDestination.internalPlaceholder'),
      internalHelpText: this.$translate.instant('callDestination.internalHelpText'),
      externalHelpText: this.$translate.instant('callDestination.externalHelpText'),
      uriPlaceholder: this.$translate.instant('callDestination.uriPlaceholder'),
      customPlaceholder: this.$translate.instant('callDestination.customPlaceholder'),
      customHelpText: this.$translate.instant('callDestination.customHelpText'),
      alternateCustomPlaceholder: this.$translate.instant('callDestination.alternateCustomPlaceholder'),
      alternateCustomHelpText: this.$translate.instant('callDestination.alternateCustomHelpText'),
      callDestinationInvalidFormat: this.$translate.instant('callDestination.invalidFormat'),
      commonInvalidRequired: this.$translate.instant('common.invalidRequired'),
    });
  }

  public getCustomNumberValidationPatern() {
    return this.customNumberValidationPattern;
  }
}
