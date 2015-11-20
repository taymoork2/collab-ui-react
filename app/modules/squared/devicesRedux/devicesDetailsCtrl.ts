namespace devicesRedux {

  /* @ngInject */
  function TagFactory (XhrNotificationService, CsdmCodeService, CsdmDeviceService) {
    return {
      create: () => new TagService(CsdmCodeService, CsdmDeviceService, XhrNotificationService)
    }
  }

  class TagService {
    private _newTag:string;

    constructor(private CsdmCodeService,
                private CsdmDeviceService,
                private XhrNotificationService) {
    }

    set newTag (tag) {
      this._newTag = tag;
    }

    get newTag () {
      return this._newTag;
    }

    createTag(device, $event) {
      var tag = _.trim(this.newTag);
      if ($event.keyCode == 13 && tag && !_.contains(device.tags, tag)) {
        this.newTag = undefined;
        return (device.needsActivation ? this.CsdmCodeService : this.CsdmDeviceService)
          .updateTags(device.url, device.tags.concat(tag))
          .catch(this.XhrNotificationService.notify);
      }
    }

    removeTag(device, tag) {
      var tags = _.without(device.tags, tag);
      return (device.needsActivation ? this.CsdmCodeService : this.CsdmDeviceService)
        .updateTags(device.url, tags)
        .catch(this.XhrNotificationService.notify);
    }
  }

  class DevicesReduxDetailsCtrl {
    private tags;
    private device;

    private deviceProps = {
      software: 'Software',
      ip: 'IP',
      serial: 'Serial',
      mac: 'Mac'
    };

    /* @ngInject */
    constructor(private $state,
                private $window,
                private $stateParams,
                private Utils,
                private Authinfo,
                private TagFactory,
                private RemDeviceModal,
                private FeedbackService,
                private CsdmDeviceService,
                private XhrNotificationService) {

      if ($stateParams.device) {
        this.device = $stateParams.device;
      } else {
        $state.go('devices-redux.search');
      }

      this.tags = TagFactory.create();
    }

    reportProblem () {
      const feedbackId = this.Utils.getUUID();

      return this.CsdmDeviceService.uploadLogs(this.device.url, feedbackId, this.Authinfo.getPrimaryEmail())
        .then(() => {
          const appType = 'Atlas_' + this.$window.navigator.userAgent;
          return this.FeedbackService.getFeedbackUrl(appType, feedbackId);
        })
        .then((res) => {
          this.$window.open(res.data.url, '_blank');
        })
        .catch(this.XhrNotificationService.notify);
    }

    deleteDevice () {
      this.RemDeviceModal
        .open(this.device)
        .then(() => this.$state.go('devices-redux.search'));
    }
  }

  angular
    .module('Squared')
    .factory('TagFactory', TagFactory)
    .controller('DevicesReduxDetailsCtrl', DevicesReduxDetailsCtrl);

}
