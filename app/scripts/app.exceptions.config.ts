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
): ng.IExceptionHandlerService {
  return (exception: Error, cause?: string) => {
    $delegate(exception, cause);

    if (typeof newrelic !== 'undefined') {
      newrelic.noticeError(exception);
    }
  };
}
