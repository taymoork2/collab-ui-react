import { WindowEventService } from 'modules/core/window';
import { StorageKeys } from 'modules/core/storage/storage.keys';
import { Config } from 'modules/core/config/config';

export class IdleTimeoutService {
    //events that set user as active

  private static readonly DEBOUNCE_INTERVAL = 10000;
  private static readonly IDLE_RESET_EVENTS = ['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'focus'];
  private static readonly LOCAL_STORAGE_DEBOUNCE_INTERVAL = 60; //seconds
  private idleSetter;
  private logoutEvent = '';
  private static readonly LOGIN_EVENT = 'Core::loginCompleted';
  private keepAliveDeregistrer;
  private isInitialized = false;

   /* @ngInject */
  constructor(
    private $document: ng.IDocumentService,
    private $timeout: ng.ITimeoutService,
    private $rootScope: ng.IRootScopeService,
    private $window: ng.IWindowService,
    private Auth,
    private Config: Config,
    private Log,
    private LocalStorage,
    private WindowEventService: WindowEventService,
  ) {
    this.logoutEvent = 'logout' + this.Config.getEnv();

  }

  private setTabIdle() {
    if (this.Auth.isLoggedIn()) {
      this.quit();
      return this.Auth.logout('loginPage.expired');
    }
  }

  private initIdleTimer() {
    return this.$timeout(() => {
      this.setTabIdle();
    }, this.Config.idleTabTimeout);
  }


  private resetTimeout(e) {
    //cancel death clock
    this.Log.debug('IDLE TIMEOUT SERVICE: reactivated by: ' + e.type);
    this.$timeout.cancel(this.idleSetter);
    this.idleSetter = this.initIdleTimer();
  }


  private resetAndBroadcast(e) {
    this.resetTimeout(e);
    this.broadcastActiveTab();
  }

  private broadcastActiveTab() {
    this.Log.debug('IDLE TIMEOUT SERVICE: broadcasting to keep alive');
    //only want to write to LS once 60 secs
    const lastUpdated = this.LocalStorage.get(StorageKeys.ACTIVE_TABS);
    if (!lastUpdated || (moment(lastUpdated, moment.ISO_8601).isBefore(moment().subtract(IdleTimeoutService.LOCAL_STORAGE_DEBOUNCE_INTERVAL, 'seconds')))) {
      this.LocalStorage.remove(StorageKeys.ACTIVE_TABS);
      this.LocalStorage.put(StorageKeys.ACTIVE_TABS, moment().toISOString());
    }
  }

  private checkActive(event) {
    if (event.key === StorageKeys.ACTIVE_TABS) {
      //resetting timeout
      this.Log.debug('IDLE TIMEOUT SERVICE:' + event.newValue + ' updated storage');
      this.resetTimeout(event);
    }
    if (event.key === this.logoutEvent) {
      this.Log.debug('IDLE TIMEOUT SERVICE: got the quit event!');
      this.quit();
    }
  }

  private quit() {
    this.Log.debug('IDLE TIMEOUT SERVICE: quitting');
    this.LocalStorage.remove(StorageKeys.ACTIVE_TABS);
    this.keepAliveDeregistrer();
    _.forEach(IdleTimeoutService.IDLE_RESET_EVENTS, EventName => {
      angular.element(this.$document).unbind(EventName);
    });
    this.$window.removeEventListener('storage', this.checkActive);
    this.isInitialized = false;
  }

  /* Logic: start the death clock. When the clock runs out -- log everyone out.
  /* User actions on the current tab will reset the death clock on this tab.
  /* They will also modify the LS value which would trigger the reset on other tabs by LS event.
  */


  public init() {
    this.Log.debug('IDLE TIMEOUT SERVICE: Starting Tab Timer');
    //start the timer
    this.$rootScope.$on(IdleTimeoutService.LOGIN_EVENT, () => {
      this.LocalStorage.remove(StorageKeys.LOGIN_MESSAGE);

      if (!this.isInitialized) {
        this.isInitialized = true;

        this.Log.debug('IDLE TIMEOUT SERVICE: Wiring up events');
        /* This is for long running  import and export operations to keep from timing out this event is emitted by:
        /* csvDownload.service.ts,  the getUserReport() is a recursive function that gets executed every 3 seconds until
        /* userlist.service.js,  getUserReports() same
        /* userCsvController processCsvRows() issues a rest API for every 10 users in the CSV file
        */
        this.keepAliveDeregistrer  = this.$rootScope.$on(this.Config.idleTabKeepAliveEvent, () => this.resetAndBroadcast({ type: this.Config.idleTabKeepAliveEvent }));
        this.idleSetter = this.initIdleTimer();
        //bind events to reset the timer.
        const throttled = _.throttle(e => {
          this.resetAndBroadcast(e);
        }, IdleTimeoutService.DEBOUNCE_INTERVAL);
        _.forEach(IdleTimeoutService.IDLE_RESET_EVENTS, EventName => {
          angular.element(this.$document).bind(EventName, throttled);
        });
        //listen to storage
        this.WindowEventService.registerEventListener('storage', this.checkActive.bind(this));
      }

    });

  }
}
