import { WindowService } from 'modules/core/window';

export class IdleTimeoutService {
     //events that set user as active
    private IDLE_RESET_EVENTS = ['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'focus'];
    private ACTIVE_TABS = 'ACTIVE_TABS';
    private DEBOUNCE_INTERVAL = 10000;
    private LS_DEBOUNCE_INTERVAL = 60; //seconds
    private logoutEvent = '';
    private idleSetter;

     /* @ngInject */
    constructor(
      private $document: ng.IDocumentService,
      private $log: ng.ILogService,
      private $timeout: ng.ITimeoutService,
      private $window: ng.IWindowService,
      private Config,
      private WindowService: WindowService,
      private $rootScope: ng.IRootScopeService,
      private Auth,
      private FeatureToggleService,
    ) {
      this.logoutEvent = 'logout' + this.Config.getEnv();
    }

    private setTabIdle() {
      if (this.Auth.isLoggedIn()) {
        this.Auth.logout().then(() => {
          return this.quit();
        });
      }
    }

    private resetTimeout(e) {
      //cancel death clock
      this.$log.debug('reactivated by: ' + e.type);
      this.$timeout.cancel(this.idleSetter);
      this.idleSetter = this.$timeout(() => {
        this.setTabIdle();
      }, this.Config.idleTabTimeout);
    }

    private resetAndBroadcast(e) {
      this.resetTimeout(e);
      this.broadcastActiveTab();
    }

    private broadcastActiveTab() {
      this.$log.debug('broadcasting to keep alive');
      //only want to write to LS once 60 secs
      let lastUpdated = this.$window.localStorage.getItem(this.ACTIVE_TABS);
      if (!lastUpdated || (moment(lastUpdated, moment.ISO_8601).isBefore(moment().subtract(this.LS_DEBOUNCE_INTERVAL, 'seconds')))) {
        this.$window.localStorage.removeItem(this.ACTIVE_TABS);
        this.$window.localStorage.setItem(this.ACTIVE_TABS, moment().toISOString());
      }
    }

    private checkActive(event) {
      if (event.key === this.ACTIVE_TABS) {
        //resetting timeout
        this.$log.debug(event.newValue + 'updated storage');
        this.resetTimeout(event);
      }
      if (event.key === this.logoutEvent) {
        this.$log.debug('got the quit event!');
        this.quit();
      }
    }

    private quit() {
      this.$log.debug('quitting');
      this.$window.localStorage.removeItem(this.ACTIVE_TABS);
      _.forEach(this.IDLE_RESET_EVENTS, EventName => {
        angular.element(this.$document).unbind(EventName);
      });
    }

    /* Logic: start the death clock. When the clock runs out -- log everyone out.
    /* User actions on the current tab will reset the death clock on this tab.
    /* They will also modify the LS value which would trigger the reset on other tabs by LS event.
    */

    public init() {
      this.$log.debug('Starting Tab Timer');

      //start the timer
      this.$rootScope.$on('LOGIN', () => {

        return this.FeatureToggleService.atlasIdleLogoutGetStatus().then(result => {
          if (! result) {
            return;
          }
          this.$log.debug('Wiring up events');
          this.idleSetter = this.$timeout(() => {
            this.setTabIdle();
          }, this.Config.idleTabTimeout);

          //bind events to reset the timer.
          _.forEach(this.IDLE_RESET_EVENTS, EventName => {
            angular.element(this.$document).bind(EventName, _.throttle(e => {
              this.resetAndBroadcast(e);
            }, this.DEBOUNCE_INTERVAL));
          });
          //listen to storage
          this.WindowService.registerEventListener('storage', e => { this.checkActive(e); });
        });
      });
    }
  }
