import { Notification } from 'modules/core/notifications';

export default class ExceptionHandlerConfig {
  public static readonly WARNING_DEBOUNCE_MS = 1000;

  /* @ngInject */
  constructor(
    $provide: ng.auto.IProvideService,
  ) {
    $provide.decorator('$exceptionHandler', extendExceptionHandler);
  }
}

/* @ngInject */
function extendExceptionHandler (
  $delegate: ng.IExceptionHandlerService,
  $injector: ng.auto.IInjectorService,
): ng.IExceptionHandlerService {
  let notifyRuntimeWarning = _.debounce(() => {
    const Notification = $injector.get<Notification>('Notification');
    Notification.warning('errors.runtime', undefined, 'errors.runtimeTitle', true);
  }, ExceptionHandlerConfig.WARNING_DEBOUNCE_MS, {
    leading: true,
    trailing: false,
  });
  return (exception: Error, cause?: string) => {
    $delegate(exception, cause);

    notifyRuntimeWarning();
    const Analytics = $injector.get<any>('Analytics');
    Analytics.trackError(exception, cause);
  };
}
