import { ISite, IRSite, Site } from './site';

export class EmergencyCallBackNumber {
  public uuid: string;
  public pattern: string;
}

interface ISiteResource extends ng.resource.IResourceClass<ng.resource.IResource<IRSite>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<void>>;
}

export class HuronSiteService {
  private huronSiteService: ISiteResource;
  private sitePickList: string[] = [
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
    'extensionLength',
    'voicemailPilotNumberGenerated',
    'emergencyCallBackNumber',
    'preferredLanguage',
    'country',
    'dateFormat',
    'timeFormat',
    'routingPrefix',
    'allowExternalTransfer',
    'regionCodeDialing',
  ];

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {

    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    const saveAction: ng.resource.IActionDescriptor = {
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
    }).$promise
      .then(site => {
        return new Site(site);
      });
  }

  public getTheOnlySite(): ng.IPromise<ISite> {
    return this.huronSiteService.query({
      customerId: this.Authinfo.getOrgId(),
    }).$promise
      .then(sites => {
        if (sites.length > 0) {
          return this.getSite(_.get<string>(sites[0], 'uuid'));
        } else {
          return new Site();
        }
      });
  }

  public createSite(site: ISite): ng.IPromise<string> {
    let location: string;
    return this.huronSiteService.save({
      customerId: this.Authinfo.getOrgId(),
    }, {
      siteIndex: site.siteIndex,
      steeringDigit: site.steeringDigit === 'null' ? null : site.steeringDigit,
      timeZone: site.timeZone,
      voicemailPilotNumber: site.voicemailPilotNumber,
      voicemailPilotNumberGenerated: site.voicemailPilotNumberGenerated,
      siteDescription: site.siteDescription,
      extensionLength: site.extensionLength.toString(),
      preferredLanguage: site.preferredLanguage,
      country: site.country,
      dateFormat: site.dateFormat,
      timeFormat: site.timeFormat,
      routingPrefix: site.routingPrefix,
      emergencyCallBackNumber: site.emergencyCallBackNumber,
      regionCodeDialing: site.regionCodeDialing,
      toggleEnabled: true, // TODO (jlowery): remove after 'i751-10d-ext' toggle is removed.
    },
      (_response, headers) => {
        location = headers('Location');
      }).$promise
      .then( () => location);
  }

  public updateSite(site: ISite): ng.IPromise<void> {
    return this.huronSiteService.update({
      customerId: this.Authinfo.getOrgId(),
      siteId: site.uuid,
    }, {
      steeringDigit: site.steeringDigit === 'null' ? null : site.steeringDigit,
      timeZone: site.timeZone,
      disableVoicemail: site.disableVoicemail,
      voicemailPilotNumber: site.voicemailPilotNumber,
      voicemailPilotNumberGenerated: site.voicemailPilotNumberGenerated,
      siteDescription: site.siteDescription,
      extensionLength: site.extensionLength.toString(),
      preferredLanguage: site.preferredLanguage,
      country: site.country,
      dateFormat: site.dateFormat,
      timeFormat: site.timeFormat,
      routingPrefix: site.routingPrefix,
      emergencyCallBackNumber: site.emergencyCallBackNumber,
      allowExternalTransfer: site.allowExternalTransfer,
      regionCodeDialing: site.regionCodeDialing,
      toggleEnabled: true, // TODO (jlowery): remove after 'i751-10d-ext' toggle is removed.
    }).$promise;
  }

  public listSites(): ng.IPromise<ISite[]> {
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
