import { Site } from './site';

export class EmergencyCallBackNumber {
  public uuid: string;
  public pattern: string;
}

interface ISiteResource extends ng.resource.IResourceClass<ng.resource.IResource<Site>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

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
    'dateFormat',
    'timeFormat',
    'routingPrefix',
  ];

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    let updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    let saveAction: ng.resource.IActionDescriptor = {
      method: 'POST',
      headers: {
        'Access-Control-Expose-Headers': 'Location',
      },
    };

    this.huronSiteService = <ISiteResource>this.$resource(this.HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sites/:siteId', {},
      {
        update: updateAction,
        save: saveAction,
      });
  }

  public getSite(siteId: string): ng.IPromise<Site> {
    return this.huronSiteService.get({
      customerId: this.Authinfo.getOrgId(),
      siteId: siteId,
    }).$promise;
  }

  public getTheOnlySite(): ng.IPromise<Site> {
    return this.huronSiteService.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
    .then(sites => {
      if (sites.length > 0) {
        return this.getSite(_.get<string>(sites[0], 'uuid'))
          .then(site => {
            return _.pick(site, this.sitePickList);
          });
      } else {
        return new Site();
      }
    });
  }

  public createSite(site: Site): ng.IPromise<string> {
    let location: string;
    // TODO (jlowery): remove after 'i751-10d-ext' toggle is removed.
    _.set(site, 'toggleEnabled', true);
    return this.huronSiteService.save({
      customerId: this.Authinfo.getOrgId(),
    }, site,
    (_response, headers) => {
      location = headers('Location');
    }).$promise
    .then( () => location);
  }

  public updateSite(site: Site): ng.IPromise<void> {
    return this.huronSiteService.update({
      customerId: this.Authinfo.getOrgId(),
      siteId: site.uuid,
    }, {
      steeringDigit: site.steeringDigit,
      timeZone: site.timeZone,
      disableVoicemail: site.disableVoicemail,
      voicemailPilotNumber: site.voicemailPilotNumber,
      voicemailPilotNumberGenerated: site.voicemailPilotNumberGenerated,
      siteDescription: site.siteDescription,
      extensionLength: site.extensionLength,
      preferredLanguage: site.preferredLanguage,
      country: site.country,
      dateFormat: site.dateFormat,
      timeFormat: site.timeFormat,
      routingPrefix: site.routingPrefix,
      emergencyCallBackNumber: site.emergencyCallBackNumber,
      toggleEnabled: true, // TODO (jlowery): remove after 'i751-10d-ext' toggle is removed.
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
