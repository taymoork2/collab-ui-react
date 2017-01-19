require('modules/hercules/service-settings/voicemail-settings-section/_voicemail-settings.scss');

class HybridVoicemailCtrl implements ng.IComponentController {

  public isCallServiceConnectEnabled: boolean;

  /* @ngInject */
  constructor(
  ) {}

  public $onInit() {

  }

  public $onChanges() {

  }

}

class HybridVoicemailSectionComponent implements ng.IComponentOptions {
  public controller = HybridVoicemailCtrl;
  public templateUrl = 'modules/hercules/service-settings/voicemail-settings-section/voicemail-settings.html';
  public bindings = {
    isCallServiceConnectEnabled: '<',
  };
}

export default angular
  .module('Hercules')
  .component('hybridVoicemailSettings', new HybridVoicemailSectionComponent())
  .name;
