export class ToasterConfig {
  /* @ngInject */
  constructor(
    toasterConfig,
  ) {
    toasterConfig['tap-to-dismiss'] = false;
    toasterConfig['time-out'] = 0;
    toasterConfig['position-class'] = 'toast-bottom-right';
    toasterConfig['close-button'] = true;
  }
}
