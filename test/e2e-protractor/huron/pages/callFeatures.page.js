export class CallFeaturesPage {
  constructor() {
    this.callFeatures = element(by.css('a[href="#/services/call-features"]'));
    this.newFeatureButton = element(by.buttonText('New'));
    this.createNewFeatureModalTitle = element(by.cssContainingText('.modal-title', 'Create New Feature'));
    this.aaFeatureButton = element(by.css('h4.feature-label-container-AA'));
    this.hgFeatureButton = element(by.css('h4.feature-label-container-HG'));
    this.cpFeatureButton = element(by.css('h4.feature-label-container-CP'));
    this.piFeatureButton = element(by.css('h4.feature-label-container-PI'));
    this.pgFeatureButton = element(by.css('h4.feature-label-container-PG'));
    this.closeBtn = element(by.css('button.close'));
  }
};
