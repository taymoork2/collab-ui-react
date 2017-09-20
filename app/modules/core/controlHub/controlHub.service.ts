export class ControlHubService {
  private image: string;
  private collapsed: { value: boolean, image: string };

  /* @ngInject */
  constructor(
    private FeatureToggleService,
    private tabConfigControlHub,
    ) {
    this.image =  '/images/control-hub-logo.svg';
    this.collapsed = {
      value: false,
      image: '/images/spark-logo.svg',
    };
  }

  public getControlHubEnabled(): ng.IPromise<boolean> {
    return this.FeatureToggleService.supports(this.FeatureToggleService.features.atlas2017NameChange).then(result => {
      return result;
    });
  }

  public getImage() {
    return this.image;
  }

  public getCollapsed() {
    return this.collapsed;
  }

  public getTabs() {
    return this.tabConfigControlHub;
  }
}
