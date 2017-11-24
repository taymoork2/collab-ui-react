import { IController } from 'angular';

class Tab {
  public title: String;
  public state: String;

  constructor(title: String, state: String) {
    this.title = title;
    this.state = state;
  }
}

class DetailsHeaderCtrl implements IController {
  public back: Boolean;
  public tabs: Tab[];
  constructor(private $translate: ng.translate.ITranslateService) {
    const controller = this;
    controller.back = false;
    controller.tabs = [];
    controller.tabs.push(new Tab(this.$translate.instant('sunlightDetails.featuresTitle'), 'care.Features'));
    controller.tabs.push(new Tab(this.$translate.instant('sunlightDetails.settingsTitle'), 'care.Settings'));
  }
}

export default angular
  .module('CareDetails')
  .controller('DetailsHeaderCtrl', DetailsHeaderCtrl);
