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
  const errorHandler = (exception: Error, cause?: string) => {
    $delegate(exception, cause);

    // TODO (brspence): add error tracking
  };

  return _.assignIn(errorHandler, $delegate);
}
