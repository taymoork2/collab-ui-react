export class ControlHubService {
  private image = '/images/control-hub-white.svg';
  private collapsed = {
    value: false,
    image: '',
  };
  private proPackIcon = 'icon-propack-solid-outline';

  /* @ngInject */
  constructor(
    private tabConfigControlHub,
    private ProPackService,
    ) {
  }

  public getImage(): string {
    return this.image;
  }

  public getIcon(): string|undefined {
    return this.ProPackService.showProBadge() ? this.proPackIcon : undefined;
  }

  public getCollapsed(): { value: boolean, image: string } {
    return this.collapsed;
  }

  public getTabs(): any[] {
    return this.tabConfigControlHub;
  }
}
