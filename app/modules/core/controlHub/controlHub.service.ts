export class ControlHubService {
  private image: string;
  private collapsed: { value: boolean, image: string };

  /* @ngInject */
  constructor(
    private tabConfigControlHub,
    ) {
    this.image =  '/images/control-hub-logo.svg';
    this.collapsed = {
      value: false,
      image: '/images/spark-logo.svg',
    };
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
