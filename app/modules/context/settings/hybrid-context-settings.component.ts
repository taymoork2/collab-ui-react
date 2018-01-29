import { ContextAdminAuthorizationService, AdminAuthorizationStatus } from '../services/context-authorization-service';
import { Notification } from '../../core/notifications';

/**
 * Settings Controller is the controller for the Hybrid Context Settings page
 * This controls the Admin Authorization check and the Admin permissions synchronization
 */
class SettingsController implements ng.IComponentController {

  public isAdminAuthorized: Boolean = false;
  public isSynchronizationInProgress: Boolean = false;
  public synchronizeButtonTooltip: string = '';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    protected ContextAdminAuthorizationService: ContextAdminAuthorizationService,
    protected Notification: Notification,
  ) {}

  /**
   * Initializes the controller
   * 1) Checks Admin Authorization and enables/disabled the Synchronize button based on the result
   */
  public $onInit() {
    this.ContextAdminAuthorizationService.getAdminAuthorizationStatus()
      .then(status => this.isAdminAuthorized = (status === AdminAuthorizationStatus.AUTHORIZED))
      .then(() => this.synchronizeButtonTooltip =
        !this.isAdminAuthorized ? this.$translate.instant('context.dictionary.settingPage.unauthorizedTooltip') : '');
  }

  /**
   * Used to Synchronized Administrative permissions to admins (both Partner admins and customer org admins)
   */
  public synchronize() {
    this.isSynchronizationInProgress = true;
    return this.ContextAdminAuthorizationService.synchronizeAdmins()
      .then(() => this.Notification.success('context.dictionary.settingPage.synchronizationSuccessful'))
      .catch(() => this.Notification.error('context.dictionary.settingPage.synchronizationFailure'))
      .finally(() => this.isSynchronizationInProgress = false);
  }

  /**
   * Synchronize administrators feature should be disabled if synchronization is in progress or the admin is not authorized.
   * @returns {Boolean | boolean}
   */
  protected disableSynchronization() {
    return this.isSynchronizationInProgress || !this.isAdminAuthorized;
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
