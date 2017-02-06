import { WindowService } from 'modules/core/window';

export class IdleTimeoutService {
     //events that set user as active

    private static readonly ACTIVE_TABS = 'ACTIVE_TABS';
    private static readonly DEBOUNCE_INTERVAL = 10000;
    private static readonly IDLE_RESET_EVENTS = ['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'focus'];
    private static readonly LOCAL_STORAGE_DEBOUNCE_INTERVAL = 60; //seconds
    private idleSetter;
    private logoutEvent = '';

     /* @ngInject */
    constructor(
      private $document: ng.IDocumentService,
      private $timeout: ng.ITimeoutService,
      private $rootScope: ng.IRootScopeService,
      private $window: ng.IWindowService,
      private Auth,
      private Config,
      private FeatureToggleService,
      private Log,
      private WindowService: WindowService,
    ) {
      this.logoutEvent = 'logout' + this.Config.getEnv();
    }

    private setTabIdle() {
      if (this.Auth.isLoggedIn()) {
        this.quit();
        return this.Auth.logout();
      }
    }

    private initIdleTimer() {
      return this.$timeout(() => {
        this.setTabIdle();
      }, this.Config.idleTabTimeout);
    }

    private resetTimeout(e) {
      //cancel death clock
      this.Log.debug('reactivated by: ' + e.type);
      this.$timeout.cancel(this.idleSetter);
      this.idleSetter = this.initIdleTimer();
    }

    private resetAndBroadcast(e) {
      this.resetTimeout(e);
      this.broadcastActiveTab();
    }

    private broadcastActiveTab() {
      this.Log.debug('broadcasting to keep alive');
      //only want to write to LS once 60 secs
      let lastUpdated = this.$window.localStorage.getItem(IdleTimeoutService.ACTIVE_TABS);
      if (!lastUpdated || (moment(lastUpdated, moment.ISO_8601).isBefore(moment().subtract(IdleTimeoutService.LOCAL_STORAGE_DEBOUNCE_INTERVAL, 'seconds')))) {
        this.$window.localStorage.removeItem(IdleTimeoutService.ACTIVE_TABS);
        this.$window.localStorage.setItem(IdleTimeoutService.ACTIVE_TABS, moment().toISOString());
      }
    }

    private checkActive(event) {
      if (event.key === IdleTimeoutService.ACTIVE_TABS) {
        //resetting timeout
        this.Log.debug(event.newValue + 'updated storage');
        this.resetTimeout(event);
      }
      if (event.key === this.logoutEvent) {
        this.Log.debug('got the quit event!');
        this.quit();
      }
    }

    private quit() {
      this.Log.debug('quitting');
      this.$window.localStorage.removeItem(IdleTimeoutService.ACTIVE_TABS);
      _.forEach(IdleTimeoutService.IDLE_RESET_EVENTS, EventName => {
        angular.element(this.$document).unbind(EventName);
      });
    }

    /* Logic: start the death clock. When the clock runs out -- log everyone out.
    /* User actions on the current tab will reset the death clock on this tab.
    /* They will also modify the LS value which would trigger the reset on other tabs by LS event.
    */

    public init() {
      this.Log.debug('Starting Tab Timer');

      //start the timer
      this.$rootScope.$on('LOGIN', () => {

        return this.FeatureToggleService.atlasIdleLogoutGetStatus().then(result => {
          if (!result) {
            return;
          }
          this.Log.debug('Wiring up events');
          this.idleSetter = this.initIdleTimer();
          //bind events to reset the timer.
          let throttled = _.throttle(e => {
              this.resetAndBroadcast(e);
            }, IdleTimeoutService.DEBOUNCE_INTERVAL);

          _.forEach(IdleTimeoutService.IDLE_RESET_EVENTS, EventName => {
            angular.element(this.$document).bind(EventName, throttled);
          });
          //listen to storage
          this.WindowService.registerEventListener('storage', e => { this.checkActive(e); });
        });
      });
    }
  }
