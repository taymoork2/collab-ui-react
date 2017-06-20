export class CallFeaturesPage {
  constructor() {
    this.callFeatures = element(by.css('a[href="#/services/call-features"]'));
    this.newFeatureButton = element(by.buttonText('New'));
    this.createNewFeatureModalTitle = element(by.cssContainingText('.modal-title', 'Create New Feature'));
    this.AaFeatureButton = element(by.css('h4.feature-label-container-AA'));
    this.HgFeatureButton = element(by.css('h4.feature-label-container-HG'));
    this.CpFeatureButton = element(by.css('h4.feature-label-container-CP'));
    this.PiFeatureButton = element(by.css('h4.feature-label-container-PI'));
    this.PgFeatureButton = element(by.css('h4.feature-label-container-PG'));
    this.CloseBtn = element(by.css('button.close'));
  }
};
