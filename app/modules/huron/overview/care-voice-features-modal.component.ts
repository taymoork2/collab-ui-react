class CareVoiceFeaturesModalCtrl implements ng.IComponentController {

  public title = '';
  public heading = '';
  public features: any[] = [];
  public dismiss: Function;

  /* @ngInject*/
  constructor(
    public $modalStack,
    public $state,
    ) {
  }

  /**
   * Initialize the controller
   */
  public $onInit() {
    this.title = 'careVoiceFeatures.title';
    this.heading = 'careVoiceFeatures.heading';
    const serviceCards: any[] = [];
    const serviceColor =  'voice-feature-color';

    serviceCards.push({ // enable spark call
      id: 'enableSparkCall',
      label: 'careVoiceFeatures.enableSparkCall',
      description: 'careVoiceFeatures.scDescription',
      contact: 'careVoiceFeatures.enableSC',
      setup: 'careVoiceFeatures.contactPartner',
      color: serviceColor,
      disabled: false,
    });

    serviceCards.push({ // enable hybrid call
      id: 'enableHybridCall',
      label: 'careVoiceFeatures.useHybridCall',
      description: 'careVoiceFeatures.hcDescription',
      contact: 'careVoiceFeatures.enableHybrid',
      setup: 'careVoiceFeatures.setUpHybrid',
      color: serviceColor,
      disabled: false,
    });
    this.features = serviceCards;
  }

  /**
   * This method takes the user to services-overview page and dismisses all the opened modals.
   */
  public hybridLink(): void {
    let top = this.$modalStack.getTop();
    while (top) {
      this.$modalStack.dismiss(top.key);
      top = this.$modalStack.getTop();
    }
    this.$state.go('services-overview');
  }
}

/**
 * Care Voice Features Modal Component used for enabling spark call or hybrid features
 */
export class CareVoiceFeaturesModalComponent implements ng.IComponentOptions {
  public controller = CareVoiceFeaturesModalCtrl;
  public template = require('modules/huron/overview/careVoiceFeaturesModal.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('huron')
  .component('careVoiceFeaturesModal', new CareVoiceFeaturesModalComponent());

