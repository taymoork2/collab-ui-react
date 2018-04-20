import { IToolkitModalService } from 'modules/core/modal';
import { IMeService, IUser } from 'modules/core/auth/user';
import { IUserPreference, IFeatureToggle, FeatureToggleEditorService } from './featureTogglesEditor.service';
import { Notification } from 'modules/core/notifications/notification.service';

class FeatureToggleEditorController implements ng.IComponentController {

  public me: IUser;
  public preferences: IUserPreference[];
  public toggles: IFeatureToggle[];

  public userDataDisplayKeys = ['displayName', 'name', 'id', 'userName', 'licenseID', 'entitlements', 'roles', 'userSettings'];

  public updatingUserPrefs: boolean = false;
  public isLoading: boolean = false;

  public searchFn(str) {
    this.filterString = str;
  }
  public filterString: string = '';

  public newFeatureToggleId: string;
  public validateNewToggleId(): boolean {
    return !_.isEmpty(this.newFeatureToggleId) && !_.some(this.toggles, (feature: IFeatureToggle) => {
      return _.isEqual(feature.key, this.newFeatureToggleId);
    });
  }
  public pageTitle: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private FeatureToggleEditorService: FeatureToggleEditorService,
    private MeService: IMeService,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
  ) {
  }

  public $onInit(): void {

    this.isLoading = true;
    this.MeService.getMe()
      .then((me: IUser) => {
        this.me = me;
        this.pageTitle = this.$translate.instant('editFeatureToggles.title', { name: _.get(this, 'me.displayName', 'unknown') });
        return this.FeatureToggleEditorService.updateUserPreferences(this.me);
      })
      .then((userPrefs: IUserPreference[]) => {
        this.preferences = userPrefs;
        return this.FeatureToggleEditorService.getFeatureToggles(this.me.id);
      })
      .then((toggles: IFeatureToggle[]) => {
        this.toggles = toggles;
      })
      .catch((error) => {
        this.Notification.errorResponse(error, 'editFeatureToggles.initError');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  public addFeatureToggle(toggleId: string): void {
    // make sure this toggle isn't already listed
    if (_.some(this.toggles, toggle => _.isEqual(toggle.key, toggleId))) {
      // toggle with this id already exists
      this.Notification.error('editFeatureToggles.toggleAlreadyExists', { toggleId: toggleId });
    } else {
      this.ModalService.open({
        title: this.$translate.instant('editFeatureToggles.addToggleTitle'),
        message: this.$translate.instant('editFeatureToggles.addToggleMessage', { toggleId: toggleId }),
      }).result
        .then(() => {
          this.isLoading = true;
          return this.FeatureToggleEditorService.addToggle(this.me.id, toggleId);
        })
        .then((toggle) => {
          this.toggles.push(toggle);
          this.Notification.success('editFeatureToggles.toggleAddSuccess', { toggleId: toggle.key, value: toggle.value });
          this.newFeatureToggleId = '';
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  public updateFeatureToggle(toggle: IFeatureToggle): void {
    if (!toggle.isUpdating) {
      toggle.isUpdating = true;
      this.FeatureToggleEditorService.updateToggle(this.me.id, toggle)
        .then((updatedToggle) => {
          _.assignIn(toggle, updatedToggle);
          this.Notification.success('editFeatureToggles.toggleUpdateSuccess', { toggleId: toggle.key, value: toggle.value });
        })
        .catch((error) => {
          this.Notification.errorResponse(error, 'editFeatureToggles.failure');
        })
        .finally(() => {
          toggle.isUpdating = false;
        });
    }
  }

  public removeFeatureToggle(toggleId: string): void {
    this.ModalService.open({
      title: this.$translate.instant('editFeatureToggles.removeToggleTitle'),
      message: this.$translate.instant('editFeatureToggles.removeToggleMessage', { toggleId: toggleId }),
    }).result
      .then(() => {
        this.isLoading = true;
        this.FeatureToggleEditorService.deleteToggle(this.me.id, toggleId)
          .then(() => {
            // reload all toggles
            return this.FeatureToggleEditorService.getFeatureToggles(this.me.id);
          })
          .then((toggles: IFeatureToggle[]) => {
            this.toggles = toggles;
          })
          .catch((error) => {
            this.Notification.errorResponse(error, 'editFeatureToggles.failure', { toggleId: toggleId });
          })
          .finally(() => {
            this.isLoading = false;
          });
      });
  }

  public updateUserPrefs(pref: IUserPreference): void {
    if (!this.updatingUserPrefs) {
      this.updatingUserPrefs = true;
      this.FeatureToggleEditorService.updateUserPreference(this.me, pref)
        .then(() => {
          this.Notification.success('editFeatureToggles.userPrefsSaved');
        })
        .catch((error) => {
          this.Notification.errorResponse(error, 'editFeatureToggles.failure');
        })
        .finally(() => {
          this.updatingUserPrefs = false;
        });
    }
  }

}

//////////////////

export class FeatureToggleEditorComponent implements ng.IComponentOptions {
  public controller = FeatureToggleEditorController;
  public template = require('./featureTogglesEditor.html');
}
