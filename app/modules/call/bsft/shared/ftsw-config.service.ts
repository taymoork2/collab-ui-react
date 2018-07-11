import { FtswConfig } from './ftsw-config';
import { Site } from './bsft-site';

export class FtswConfigService {

  private ftswConfig: FtswConfig;

  /* @ngInject */
  constructor() {
    this.ftswConfig = new FtswConfig();
  }

  public getFtswConfig(): FtswConfig {
    return _.cloneDeep(this.ftswConfig);
  }

  public getSites(): Site[] {
    return _.get(this.ftswConfig, 'sites', []);
  }

  public setSites(sites: Site[]) {
    _.set(this.ftswConfig, 'sites', sites);
  }

  public addSite(site: Site) {
    this.ftswConfig.sites.push(site);
  }
}
