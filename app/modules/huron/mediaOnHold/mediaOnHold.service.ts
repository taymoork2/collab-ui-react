import { IMediaOnHold } from '../mediaOnHold/mediaOnHold';

interface IMediaOnHoldResource extends ng.resource.IResourceClass<ng.resource.IResource<IMediaOnHold>> {}

export class MediaOnHoldService {
  private mediaOnHoldResource: IMediaOnHoldResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.mediaOnHoldResource = this.$resource(this.HuronConfig.getMmsUrl() + '/organizations/:orgId/mohPrompts');
  }

  public getMediaOnHold(): ng.IPromise<IMediaOnHold[]> {
    return this.mediaOnHoldResource.query({
      orgId: this.Authinfo.getOrgId(),
    }).$promise
    .then(mediaList => {
      return _.map(mediaList, media => {
        return <IMediaOnHold> {
          orgId: _.get(media, 'orgId'),
          mediaId: _.get(media, 'mediaId'),
          variantId: _.get(media, 'variantId'),
          fileName: _.get(media, 'fileName'),
          displayName: _.get(media, 'displayName'),
          rhesosId: _.get(media, 'rhesosId'),
          markForDelete: _.get(media, 'markForDelete'),
          assignments: _.get(media, 'assignments'),
        };
      });
    });
  }

  public updateCompanyMediaOnHold(rhesosId: string): ng.IPromise<any> {
    return this.mediaOnHoldResource.save({
      orgId: this.Authinfo.getOrgId(),
      mediaFileId: rhesosId,
      assignments: [],
    }).$promise;
  }

  public updateMediaOnHold(media: IMediaOnHold, assignmentId?: string): ng.IPromise<any> {
    const saveAssignment: any = [];
    if (assignmentId) {
      saveAssignment.push({
        assignmentId: assignmentId,
        idType: 'NUM_UUID',
      });
    }
    return this.mediaOnHoldResource.save({
      orgId: this.Authinfo.getOrgId(),
    }, {
      mediaFileId: _.get(media, 'rhesosId'),
      assignments: saveAssignment,
    }).$promise;
  }
}
