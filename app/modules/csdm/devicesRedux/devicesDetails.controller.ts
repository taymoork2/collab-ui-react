import { CsdmCodeService } from '../../squared/devices/services/CsdmCodeService';
import { CsdmDeviceService } from '../../squared/devices/services/CsdmDeviceService';
export class TagFactory {
  /* @ngInject */
  constructor(private NotificationService, private CsdmCodeService: CsdmCodeService, private CsdmDeviceService: CsdmDeviceService) {

  }

  public create(): TagService {
    return new TagService(this.CsdmCodeService, this.CsdmDeviceService, this.NotificationService);
  }
}

class TagService {
  private _newTag: string | undefined;

  constructor(private CsdmCodeService,
              private CsdmDeviceService,
              private NotificationService) {
  }

  set newTag(tag) {
    this._newTag = tag;
  }

  get newTag() {
    return this._newTag;
  }

  public createTag(device, $event) {
    const tag = _.trim(this.newTag);
    if ($event.keyCode === 13 && tag && !_.some(device.tags, tag)) {
      this.newTag = undefined;
      return (device.needsActivation ? this.CsdmCodeService : this.CsdmDeviceService)
        .updateTags(device.url, device.tags.concat(tag))
        .catch(this.NotificationService.notify);
    }
  }

  public removeTag(device, tag) {
    const tags = _.without(device.tags, tag);
    return (device.needsActivation ? this.CsdmCodeService : this.CsdmDeviceService)
      .updateTags(device.url, tags)
      .catch(this.NotificationService.notify);
  }
}

export class DevicesReduxDetailsCtrl {
  private tags;
  private device;

  public deviceProps = {
    software: 'Software',
    ip: 'IP',
    serial: 'Serial',
    mac: 'Mac',
  };

  /* @ngInject */
  constructor(private $state,
              private $window,
              $stateParams,
              private Utils,
              private Authinfo,
              TagFactory,
              private RemDeviceModal,
              private FeedbackService,
              private CsdmDeviceService,
              private NotificationService) {

    if ($stateParams.device) {
      this.device = $stateParams.device;
    } else {
      $state.go('devices-redux.search');
    }

    this.tags = TagFactory.create();
  }

  public reportProblem() {
    const feedbackId = this.Utils.getUUID();

    return this.CsdmDeviceService.uploadLogs(this.device.url, feedbackId, this.Authinfo.getPrimaryEmail())
      .then(() => {
        const appType = 'Atlas_' + this.$window.navigator.userAgent;
        return this.FeedbackService.getFeedbackUrl(appType, feedbackId);
      })
      .then((res) => {
        this.$window.open(res.data.url, '_blank');
      })
      .catch(this.NotificationService.notify);
  }

  public deleteDevice() {
    this.RemDeviceModal
      .open(this.device)
      .then(() => this.$state.go('devices-redux.search'));
  }
}

