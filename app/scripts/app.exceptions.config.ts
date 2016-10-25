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
  return (exception: Error, cause?: string) => {
    $delegate(exception, cause);

    const Analytics = $injector.get<any>('Analytics');
    Analytics.trackError(exception, cause);
  };
}
