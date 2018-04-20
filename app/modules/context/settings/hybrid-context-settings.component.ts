import { ContextAdminAuthorizationService, AdminAuthorizationStatus } from '../services/context-authorization-service';
import { Notification } from '../../core/notifications';

/**
 * Settings Controller is the controller for the Hybrid Context Settings page
 * This controls the Admin Authorization check and the Admin permissions synchronization
 */
class SettingsController implements ng.IComponentController {

  public isAdminUnauthorized: Boolean = false;
  public isUnknown: Boolean = true;
  public isSynchronizationInProgress: Boolean = false;
  public synchronizeButtonTooltip: string = '';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    protected ContextAdminAuthorizationService: ContextAdminAuthorizationService,
    protected Notification: Notification,
    private $log: ng.ILogService,
  ) {}

  /**
   * Initializes the controller
   * 1) Checks Admin Authorization and enables/disabled the Synchronize button based on the result
   */
  public $onInit() {
    this.ContextAdminAuthorizationService.getAdminAuthorizationStatus()
      .then(status => {
        this.isAdminUnauthorized = (status === AdminAuthorizationStatus.UNAUTHORIZED);
        this.isUnknown = (status === AdminAuthorizationStatus.UNKNOWN);
      })
      .then(() => this.synchronizeButtonTooltip =
        this.isAdminUnauthorized || this.isUnknown ? this.$translate.instant('context.dictionary.settingPage.unauthorizedTooltip') : '');
  }

  /**
   * Used to Synchronized Administrative permissions to admins (both Partner admins and customer org admins)
   */
  public synchronize() {
    const invalidAdminType = 'INVALID_ADMIN_TYPE_FOR_MIGRATION';
    this.isSynchronizationInProgress = true;

    return this.synchronizeAdminsOrMigrateOrganization()
    .then(() => this.Notification.success('context.dictionary.settingPage.synchronizationSuccessful'))
    .catch(response => {
      const statusText = _.get(response, 'data.error.statusText');
      if (statusText === invalidAdminType) {
        this.Notification.error('context.dictionary.settingPage.invalidAdminType');
      } else {
        this.Notification.error('context.dictionary.settingPage.synchronizationFailure');
      }
    })
    .finally(() => this.isSynchronizationInProgress = false);
  }

  protected synchronizeAdminsOrMigrateOrganization() {
    return this.ContextAdminAuthorizationService.isMigrationNeeded().then((isMigrationNeeded) => {
      if (isMigrationNeeded) {
        this.$log.info(`Calling MigrateOrganization Api since function isMigrationNeeded returns ${isMigrationNeeded} `);
        return this.ContextAdminAuthorizationService.migrateOrganization();
      } else {
        this.$log.info(`Calling SynchronizeAdmins Api since function isMigrationNeeded returns ${isMigrationNeeded} `);
        return this.ContextAdminAuthorizationService.synchronizeAdmins();
      }
    });
  }

  /**
   * Synchronize administrators feature should be disabled if synchronization is in progress or the admin is not authorized.
   * @returns {Boolean | boolean}
   */
  protected disableSynchronization() {
    return this.isSynchronizationInProgress || this.isAdminUnauthorized || this.isUnknown;
  }
}

/**
 * Settings Component used for Administrative Settings for Hybrid Context
 */
export class SettingsComponent implements ng.IComponentOptions {
  public controller = SettingsController;
  public template = require('modules/context/settings/hybrid-context-settings.html');
  public bindings = {};
}

export default angular
  .module('Context')
  .component('contextSettings', new SettingsComponent());
