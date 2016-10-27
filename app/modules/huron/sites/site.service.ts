export class EmergencyCallBackNumber {
  public uuid: string;
  public pattern: string;
}

export class Site {
  public uuid: string;
  public siteIndex: string;
  public siteCode: string;
  public steeringDigit: string;
  public siteSteeringDigit: string;
  public timeZone: string;
  public voicemailPilotNumber: string;
  public mediaTraversalMode: string;
  public siteDescription: string;
  public vmCluster: string;
  public allowInternationalDialing: string;
  public extensionLength: string;
  public voicemailPilotNumberGenerated: string;
  public emergencyCallBackNumber: EmergencyCallBackNumber;
  public preferredLanguage: string;
  public country: string;
}

interface ISiteResource extends ng.resource.IResourceClass<ng.resource.IResource<Site>> {}

export class HuronSiteService {
  private huronSiteService: ISiteResource;
  private sitePickList: Array<string> = [
    'uuid',
    'siteIndex',
    'siteCode',
    'steeringDigit',
    'siteSteeringDigit',
    'timeZone',
    'voicemailPilotNumber',
    'mediaTraversalMode',
    'siteDescription',
    'vmCluster',
    'allowInternationalDialing',
    'extensionLength',
    'voicemailPilotNumberGenerated',
    'emergencyCallBackNumber',
    'preferredLanguage',
    'country',
  ];

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig
  ) {
    this.huronSiteService = <ISiteResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sites/:siteId');
  }

  public getSite(siteId: string): ng.IPromise<Site> {
    return this.huronSiteService.get({
      customerId: this.Authinfo.getOrgId(),
      siteId: siteId,
    }).$promise;
  }

  public listSites(): ng.IPromise<Site[]> {
    return this.huronSiteService.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then( (sites) => {
      return _.map(sites, (site) => {
        return _.pick(site, this.sitePickList);
      });
    });
  }
}
