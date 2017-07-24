import { IMediaOnHold } from '../media-on-hold/media-on-hold';
import { IOption } from 'modules/huron/dialing';

interface IMediaOnHoldResource extends ng.resource.IResourceClass<ng.resource.IResource<IMediaOnHold>> {}

const GENERIC_MEDIA_ID: string = '98765432-DBC2-01BB-476B-CFAF98765432';

export class MediaOnHoldService {
  private mediaOnHoldResource: IMediaOnHoldResource;
  private lineMediaOnHoldResource: IMediaOnHoldResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private $translate: ng.translate.ITranslateService,
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
        const mediaOptions = _.sortBy(_.map(mediaList, media => {
          return <IOption> {
            label: media.displayName,
            value: media.rhesosId,
          };
        }), 'label');
        mediaOptions.push(<IOption>{
          label: this.$translate.instant('mediaOnHold.systemDefault'),
          value: GENERIC_MEDIA_ID,
        });
        return mediaOptions;
      });
  }

  public getLineMohOptions(): ng.IPromise<IOption[]> {
    return this.getMediaOnHold()
      .then(mediaList => {
        const mediaOptions = _.sortBy(_.map(mediaList, media => {
          return <IOption> {
            label: media.displayName,
            value: media.rhesosId,
          };
        }), 'label');
        if (!_.isEmpty(mediaList)) {
          _.forEach(mediaList, media => {
            if (media.assignments && _.some(media.assignments, ['idType', 'ORG_ID'])) {
              mediaOptions.push(<IOption>{
                label: `Company MOH (${media.displayName})`,
                value: GENERIC_MEDIA_ID,
              });
            }
          });
          if (!_.isEqual(_.last(mediaOptions).value, GENERIC_MEDIA_ID)) {
            mediaOptions.push(<IOption>{
              label: this.$translate.instant('mediaOnHold.companyMOHDefaultMedia'),
              value: GENERIC_MEDIA_ID,
            });
          }
        } else {
          mediaOptions.push(<IOption>{
            label: this.$translate.instant('mediaOnHold.companyMOHDefaultMedia'),
            value: GENERIC_MEDIA_ID,
          });
        }
        return mediaOptions;
      });
  }

  public getLineMedia(lineId: string): ng.IPromise<string> {
    return this.getMediaOnHold()
      .then(mediaList => {
        let mediaOnHold = GENERIC_MEDIA_ID;
        _.forEach(mediaList, media => {
          if (media.assignments && _.some(media.assignments, ['assignmentId', lineId])) {
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
    } else {
      saveAssignment.push({
        assignmentId: this.Authinfo.getOrgId(),
        idType: 'ORG_ID',
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

  public unassignMediaOnHold(mediaLevel?: string, assignmentId?: string): ng.IPromise<any> {
    const saveAssignment: any[] = [];
    const UNASSIGN_PROMPT_ID = '06691d80-01e7-4e05-b869-8fa680822c51';
    if (!mediaLevel) {
      saveAssignment.push({
        assignmentId: this.Authinfo.getOrgId(),
        idType: 'ORG_ID',
      });
    } else if (_.isEqual(mediaLevel, 'Line')) {
      saveAssignment.push({
        assignmentId: assignmentId,
        idType: 'NUM_UUID',
      });
    }

    return this.mediaOnHoldResource.save({
      orgId: this.Authinfo.getOrgId(),
    }, {
      orgId: this.Authinfo.getOrgId(),
      promptId: UNASSIGN_PROMPT_ID,
      locale: 'en_US',
      mediaFileId: GENERIC_MEDIA_ID,
      assignments: saveAssignment,
    }).$promise;
  }
}
