import { ProPackSettingSection } from '../proPackSettingSection';

import { ExternalCommunicationSettingController } from './externalCommunicationSetting.controller';

export class ExternalCommunicationSetting extends ProPackSettingSection {

  /* @ngInject */
  public constructor(proPackPurchased: boolean) {
    super('externalCommunication', proPackPurchased);
    //this.subsectionDescription = '';
  }
}

export class ExternalCommunicationSettingComponent implements ng.IComponentOptions {
  public controller = ExternalCommunicationSettingController;
  public controllerAs = 'externalCommunicationCtrl';
  public templateUrl = 'modules/core/settings/externalCommunication/externalCommunicationSetting.tpl.html';
}
