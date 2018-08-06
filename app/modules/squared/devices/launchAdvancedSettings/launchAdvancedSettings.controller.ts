import { WindowEventService } from 'modules/core/window';

interface IDialogState {
  button1text?: string;
  button2text: string;
  isRetry?: boolean;
  title: string;
  message: string;

  onEnter?(): void;

  button1Click?(): void;

  button2Click?(): void;
}

class LaunchAdvancedSettingsController {

  public states: { connect: IDialogState, offline: IDialogState, unavailable: IDialogState };
  public state: IDialogState;
  private endpointWindow?: Window;
  private timeoutPromise: ng.IPromise<void>;
  private SHA512 = require('crypto-js/sha512');

  //The script section of the following HTML must not be modified unless you also update the CSP HASH in csp-prod.config.js
  // ('sha256-5zmUxCaNKNz+kTngvNTF8srDs9p8XHdW0oh+h9q46KQ=')
  public readonly forwardingPageScript = `<script>window.addEventListener('message', function(event) {
  if (event.origin !== window.location.origin) {
    return;
  }
  document.title = event.data.connectingTitle;
  document.getElementById("connecting").innerHTML = event.data.connectingText;
  window.location.assign(event.data.endpointOrigin + '/cloud-login');
});</script>`;

  /* @ngInject */
  constructor(
    private $modalInstance,
    private $sanitize,
    private $scope: ng.IScope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private $window: Window,
    private Authinfo,
    private CsdmDeviceService,
    private currentDevice,
    private Utils,
    private WindowEventService: WindowEventService,
    private Notification,
    ) {
    this.buildStates();
    this.changeState(this.getInitialState(this.currentDevice));
  }

  private getInitialState(device) {
    return device.isOnline ? this.states.connect : this.states.offline;
  }

  private changeState(state) {
    this.$timeout(
      () => {
        this.state = state;
        if (state.onEnter) {
          state.onEnter();
        }
        this.$scope.$apply();
      },
    );
  }

  private buildStates() {
    this.states = {
      offline: {
        title: 'spacesPage.advancedSettings.offlineHeader',
        message: 'spacesPage.advancedSettings.offlineMessage',
        button1Click: () => {
        },
        button2text: 'common.ok',
        button2Click: this.$modalInstance.close,
      },
      unavailable: {
        title: 'spacesPage.advancedSettings.unavailableHeader',
        message: 'spacesPage.advancedSettings.unavailableMessage',
        button1text: 'common.cancel',
        button1Click: this.$modalInstance.close,
        button2text: 'common.tryAgain',
        button2Click: () => {
          this.states.connect.isRetry = true;
          this.changeState(this.states.connect);
        },
      },
      connect: {
        title: 'spacesPage.advancedSettings.launchAdvancedSettings',
        message: 'spacesPage.advancedSettings.availableMessage',
        button1text: 'common.cancel',
        button1Click: this.$modalInstance.close,
        button2text: 'common.proceed',
        isRetry: false,
        button2Click: () => {
          if (_.isFunction(this.Authinfo.isReadOnlyAdmin) && this.Authinfo.isReadOnlyAdmin()) {
            this.Notification.notifyReadOnly();
          } else {
            this.connectToEndpoint();
          }
        },
        onEnter: () => {
          if (this.states.connect.isRetry) {
            if (this.states.connect.button2Click) {
              this.states.connect.button2Click();
            }
            this.states.connect.isRetry = false;
          }
        },
      },
    };
  }

  private generateHash(data: String): String {
    return String(this.SHA512(data));
  }

  private connectToEndpoint() {

    const endpointInitialContactTimeout = 10000;
    const endpointOrigin = 'http://' + this.currentDevice.ip;

    const createEndpointWindow = (endpointOrigin, currentDevice): Window | undefined => {
      const forwardingPageHtml =
        `<html><head><title>Waiting for connection</title></head><br>
          <body><h4 id="connecting"></h4></body>
          ${this.forwardingPageScript}
        </html>`;
      const forwardingWindow = this.$window.open('about:blank', '_blank', '');

      if (!forwardingWindow) {
        return;
      }

      forwardingWindow.document.write(forwardingPageHtml);

      const getText = (templateName, device) => {
        let template = this.$translate.instant('spacesPage.advancedSettings.' + templateName);
        template = template.replace('{name}', (device.displayName || ''));
        return template.replace('{product}', (device.product || ''));
      };
      const connectingText = this.$sanitize(getText('connecting', currentDevice));
      const connectingTitle = this.$sanitize(getText('connectingTitle', currentDevice));

      forwardingWindow.postMessage(
        {
          connectingTitle,
          connectingText,
          endpointOrigin,
        },
        forwardingWindow.location.origin,
      );
      return forwardingWindow;
    };

    this.WindowEventService.registerEventListener('message', this.handleMessageEvent.bind(this), this.$scope);

    this.endpointWindow = createEndpointWindow(endpointOrigin, this.currentDevice);

    this.timeoutPromise = this.$timeout(() => {

      this.changeState(this.states.unavailable);
      if (this.endpointWindow) {
        this.endpointWindow.close();
      }

    }, endpointInitialContactTimeout);
  }

  private handleMessageEvent(event): void {
    const endpointOrigin = 'http://' + this.currentDevice.ip;
    const redirectedEndpointOrigin = 'https://' + this.currentDevice.ip;

    if (endpointOrigin === event.origin || redirectedEndpointOrigin === event.origin) {

      const reportedId = String(_.get(event.data, 'id'));

      if (reportedId && reportedId === this.generateHash(this.currentDevice.cisUuid)) {

        const messageStatus = String(_.get(event.data, 'status'));

        if (messageStatus === 'ready') {

          //Stop the timer
          this.$timeout.cancel(this.timeoutPromise);

          //Generate token
          const token = this.Utils.getUUID();

          //Send token on Mercury:
          if (token && token.length > 15) { //Minimum password length picked by fair vote. TTL is 30 sec on device.

            this.CsdmDeviceService.sendAdvancedSettingsOtp(this.currentDevice.url,
              token,
              this.Authinfo.getPrimaryEmail(),
              this.Authinfo.getUserName());
          }

          //Post token to endpoint
          if (this.endpointWindow) {
            this.endpointWindow.postMessage({ token: token }, event.origin);
          }
        } else if (messageStatus === 'login-success') {
          //Stop the timer
          this.$timeout.cancel(this.timeoutPromise);
          this.$modalInstance.close();
        } else if (messageStatus === 'login-failure') {
          this.$timeout.cancel(this.timeoutPromise);
          this.changeState(this.states.unavailable); //mercury problem?
        }
      } else {
        //Right origin, but wrong endpoint => wrong network?
        //Stop the timer
        this.$timeout.cancel(this.timeoutPromise);
        this.changeState(this.states.unavailable); // wrong network);

        if (this.endpointWindow) {
          this.endpointWindow.close();
        }
      }
      this.$scope.$apply();
    }
  }
}

angular
  .module('Squared')
  .controller('LaunchAdvancedSettingsController', LaunchAdvancedSettingsController)
  .service('LaunchAdvancedSettingsModal',
    /* @ngInject */
    function ($modal) {
      function open(currentDevice) {
        return $modal.open({
          resolve: {
            currentDevice: _.constant(currentDevice),
          },
          controllerAs: 'vm',
          controller: 'LaunchAdvancedSettingsController',
          template: require('modules/squared/devices/launchAdvancedSettings/launchAdvancedSettings.tpl.html'),
          modalId: 'launchAdvancedSettingsModal',
          type: 'dialog',
        }).result;
      }

      return {
        open: open,
      };
    },
  );
