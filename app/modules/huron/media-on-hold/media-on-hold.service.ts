import { IMediaOnHold } from '../media-on-hold/media-on-hold';
import { IOption } from 'modules/huron/dialing';

interface IMediaOnHoldResource extends ng.resource.IResourceClass<ng.resource.IResource<IMediaOnHold>> {}

const GENERIC_MEDIA_ID = '1';

export class MediaOnHoldService {
  private mediaOnHoldResource: IMediaOnHoldResource;
  private lineMediaOnHoldResource: IMediaOnHoldResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    this.mediaOnHoldResource = this.$resource(this.HuronConfig.getMmsUrl() + '/organizations/:orgId/mohPrompts');
    this.lineMediaOnHoldResource = this.$resource(this.HuronConfig.getMmsUrl() + '/organizations/:orgId/mohPrompts/lines/:lineId');
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

  public getCompanyMedia(): ng.IPromise<string> {
    return this.getMediaOnHold()
      .then(mediaList => {
        let mediaOnHold = GENERIC_MEDIA_ID;
        _.forEach(mediaList, media => {
          if (media.assignments && _.find(media.assignments, ['idType', 'ORG_ID'])) {
            mediaOnHold = media.rhesosId;
          }
        });
        return mediaOnHold;
      });
  }

  public getCompanyMohOptions(): ng.IPromise<IOption[]> {
    return this.getMediaOnHold()
      .then(mediaList => {
        const mediaOptions = _.map(mediaList, media => {
          return <IOption> {
            label: media.displayName,
            value: media.rhesosId,
          };
        });
        mediaOptions.push(<IOption>{
          label: 'Generic Media',
          value: GENERIC_MEDIA_ID,
        });
        return mediaOptions;
      });
  }

  public getLineMediaOnHold(lineId: string): ng.IPromise<IMediaOnHold[]> {
    return this.lineMediaOnHoldResource.query({
      orgId: this.Authinfo.getOrgId(),
      lineId: lineId,
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

  public getLineMedia(lineId: string): ng.IPromise<string> {
    return this.getLineMediaOnHold(lineId)
      .then(mediaList => {
        let mediaOnHold = GENERIC_MEDIA_ID;
        _.forEach(mediaList, media => {
          if (media.assignments && _.find(media.assignments, ['idType', 'NUM_UUID'])) {
            mediaOnHold = media.rhesosId;
          }
        });
        return mediaOnHold;
      });
  }

  public updateMediaOnHold(media: string, assignmentId?: string): ng.IPromise<any> {
    const saveAssignment: any[] = [];
    if (assignmentId) {
      saveAssignment.push({
        assignmentId: assignmentId,
        idType: 'NUM_UUID',
      });
    }
    return this.mediaOnHoldResource.save({
      orgId: this.Authinfo.getOrgId(),
    }, {
      orgId: this.Authinfo.getOrgId(),
      mediaFileId: media,
      assignments: saveAssignment,
    }).$promise;
  }
}
