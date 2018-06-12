import { IMediaOnHold } from '../media-on-hold/media-on-hold';
import { IOption } from 'modules/huron/dialing';

interface IMediaOnHoldResource extends ng.resource.IResourceClass<ng.resource.IResource<IMediaOnHold>> {}

const GENERIC_MEDIA_ID: string = '98765432-DBC2-01BB-476B-CFAF98765432';

export class MediaOnHoldService {
  private mediaOnHoldResource: IMediaOnHoldResource;
  private supportsLocation: boolean = false;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private HuronConfig,
    private FeatureToggleService,
  ) {
    this.mediaOnHoldResource = this.$resource(this.HuronConfig.getMmsUrl() + '/organizations/:orgId/mohPrompts');
    this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484)
      .then(result => this.supportsLocation = result);
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
        const media = _.find(mediaList, media => _.some(media.assignments, ['idType', 'ORG_ID']));
        if (media) {
          mediaOnHold = media.rhesosId;
        }
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
        mediaOptions.unshift(this.createGenericMediaOption('Company'));
        return mediaOptions;
      });
  }

  public createGenericMediaOption(level: string, fileName?: string): IOption {
    let label: string;
    if ( _.isEqual(level, 'Line')) {
      label = (this.supportsLocation ? this.$translate.instant('mediaOnHold.locationDefaultMedia') : this.$translate.instant('mediaOnHold.companyDefaultMedia'))
        + ' ' + '(' + fileName + ')';
    } else if ( _.isEqual(level, 'Location')) {
      label = this.$translate.instant('mediaOnHold.companyDefaultMedia') + ' ' + '(' + fileName + ')';
    } else { // Company
      label = this.$translate.instant('mediaOnHold.systemDefaultMedia');
    }

    return <IOption> {
      label: label,
      value: GENERIC_MEDIA_ID,
    };
  }

  public getLocationMohOptions(): ng.IPromise<IOption[]> {
    return this.getMediaOnHold()
      .then(mediaList => {
        const mediaOptions = _.sortBy(_.map(mediaList, media => {
          return <IOption> {
            label: media.displayName,
            value: media.rhesosId,
          };
        }), 'label');
        const orgMedia = _.find(mediaList, media => _.some(media.assignments, ['idType', 'ORG_ID']));
        if (orgMedia) {
          mediaOptions.unshift(this.createGenericMediaOption('Location', orgMedia.displayName));
        } else {
          mediaOptions.unshift(this.createGenericMediaOption('Location', this.$translate.instant('mediaOnHold.systemDefaultMedia')));
        }
        return mediaOptions;
      });
  }

  public getLocationMedia(locationId: string): ng.IPromise<string> {
    return this.getMediaOnHold()
      .then(mediaList => {
        let mediaOnHold = GENERIC_MEDIA_ID;
        const locationMedia = _.find(mediaList, media => _.some(media.assignments, ['assignmentId', locationId]));
        if (locationMedia) {
          mediaOnHold = locationMedia.rhesosId;
        }
        return mediaOnHold;
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
        const locationMedia = _.find(mediaList, media => _.some(media.assignments, ['idType', 'LOCATION_ID']));
        if (locationMedia) {
          mediaOptions.unshift(this.createGenericMediaOption('Line', locationMedia.displayName));
        } else {
          const orgMedia = _.find(mediaList, media => _.some(media.assignments, ['idType', 'ORG_ID']));
          if (orgMedia) {
            mediaOptions.unshift(this.createGenericMediaOption('Line', orgMedia.displayName));
          } else {
            mediaOptions.unshift(this.createGenericMediaOption('Line', this.$translate.instant('mediaOnHold.systemDefaultMedia')));
          }
        }
        return mediaOptions;
      });
  }

  public getLineMedia(lineId: string): ng.IPromise<string> {
    return this.getMediaOnHold()
      .then(mediaList => {
        let mediaOnHold = GENERIC_MEDIA_ID;
        const lineMedia = _.find(mediaList, media => _.some(media.assignments, ['assignmentId', lineId]));
        if (lineMedia) {
          mediaOnHold = lineMedia.rhesosId;
        }
        return mediaOnHold;
      });
  }

  public updateMediaOnHold(media: string, mediaLevel?: string, assignmentId?: string): ng.IPromise<any> {
    const saveAssignment: any[] = [];
    if (!assignmentId) {
      saveAssignment.push({
        assignmentId: this.Authinfo.getOrgId(),
        idType: 'ORG_ID',
      });
    } else if (_.isEqual(mediaLevel, 'Location')) {
      saveAssignment.push({
        assignmentId: assignmentId,
        idType: 'LOCATION_ID',
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
      mediaFileId: media,
      assignments: saveAssignment,
    }).$promise;
  }

  public unassignMediaOnHold(mediaLevel?: string, assignmentId?: string): ng.IPromise<any> {
    const saveAssignment: any[] = [];
    const UNASSIGN_PROMPT_ID = '06691d80-01e7-4e05-b869-8fa680822c51';
    if (!assignmentId) {
      saveAssignment.unshift({
        assignmentId: this.Authinfo.getOrgId(),
        idType: 'ORG_ID',
      });
    } else if (_.isEqual(mediaLevel, 'Location')) {
      saveAssignment.unshift({
        assignmentId: assignmentId,
        idType: 'LOCATION_ID',
      });
    } else if (_.isEqual(mediaLevel, 'Line')) {
      saveAssignment.unshift({
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
