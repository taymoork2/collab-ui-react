class CareHybridFeatureModalCtrl implements ng.IComponentController {

  public title = '';
  public features: any[] = [];
  public dismiss: Function;                   // Dismiss callback for modal dialog

  /* @ngInject*/
  constructor(
    public $modal,
    public $state,
    public Authinfo) {
  }

  /**
   * Initialize the controller
   */
  public $onInit() {
    this.title = 'sunlightDetails.newFeatures.newCustomerSupportTemplateModalTitle';

    const serviceCards: any[] = [];
    const serviceColor =  'feature-cst-color';
    let isAACardDisabled = false;
    serviceCards.push({ //web Template
      id: 'webTemplate',
      label: 'sunlightDetails.newFeatures.webTemplate',
      description: 'sunlightDetails.newFeatures.selectWTDesc',
      icons: ['icon-picture-in-picture'],
      color: serviceColor,
      disabled: false,
    });

    if (this.$state.isSparkCallConfigured === false && this.$state.isHybridAndEPTConfigured === false) {
      isAACardDisabled = true;
    }
    serviceCards.push({ //AutoAttendant
      id: 'AA',
      label: 'autoAttendant.title',
      description: 'autoAttendant.careModalDescription',
      code: 'autoAttendant.code',
      color: 'feature-aa-color',
      warning: 'autoAttendant.warning',
      disabled: isAACardDisabled,
      showWarning: isAACardDisabled,
    });

    if (this.Authinfo.isCare()) {
      this.features = serviceCards;
    }
  }

  public ok(featureId): void {
    const templateStr = '<customer-support-template-modal dismiss="$dismiss()" class="care-modal"></customer-support-template-modal>';
    if (featureId === 'AA') {
      this.$modal.open({
        template: require('modules/huron/features/newFeature/aatype-select-modal.html'),
        controller: 'AATypeSelectCtrl',
        size: 'lg',
      });
    } else {
      this.$modal.open({
        template: templateStr,
      });
    }
    this.dismiss();
  }
}

/**
 * Care Hybrid Modal Component used for Creating new Hybrid Template
 */
export class CareHybridFeatureModalComponent implements ng.IComponentOptions {
  public controller = CareHybridFeatureModalCtrl;
  public template = require('modules/sunlight/features/featureLanding/careHybridFeatureModal.tpl.html');
  public bindings = {
    dismiss: '&',
  };
}

export default angular
  .module('Sunlight')
  .component('careHybridFeatureModal', new CareHybridFeatureModalComponent());

