export class EmergencyCallBackNumber {
  uuid: string;
  pattern: string;
}

export class Site {
  uuid: string;
  siteIndex: string;
  siteCode: string;
  steeringDigit: string;
  siteSteeringDigit: string;
  timeZone: string;
  voicemailPilotNumber: string;
  mediaTraversalMode: string;
  siteDescription: string;
  vmCluster: string;
  allowInternationalDialing: string;
  extensionLength: string;
  voicemailPilotNumberGenerated: string;
  emergencyCallBackNumber: EmergencyCallBackNumber;
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
  ];

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig
  ) {
    this.huronSiteService = <ISiteResource>$resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sites/:siteId');
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
    })
  }
}