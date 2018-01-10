import notificationsModule from './index';

describe('Service: Notification', function () {
  beforeEach(angular.mock.module(notificationsModule));

  let Notification, toaster, Config, $timeout, $log, timeoutPromise;

  function MakePopResponse(title, type, message, timeout) {
    return {
      title: title,
      type: type,
      body: 'cr-bind-unsafe-html',
      bodyOutputType: 'directive',
      directiveData: { messages: [message] },
      timeout: timeout,
      closeHtml: jasmine.any(String),
    };
  }

  function createHttpResponseWith(params?) {
    return _.assign({
      data: {
        errorMessage: 'error',
      },
      status: 500,
      config: {
        timeout: timeoutPromise,
      },
      headers: (key) => {
        const headers = {
          TrackingID: 'Atlas_123',
        };
        return headers[key];
      },
    }, params);
  }

  beforeEach(inject(function (_Notification_, _toaster_, _Config_, _$timeout_, _$log_) {
    Notification = _Notification_;
    toaster = _toaster_;
    Config = _Config_;
    $timeout = _$timeout_;
    $log = _$log_;

    timeoutPromise = $timeout();

    spyOn(Config, 'isE2E').and.returnValue(false);
    spyOn(toaster, 'pop');
    spyOn($log, 'warn');
  }));

  describe('success notifications', function () {

    it('creates toaster with given message type and text', function () {
      const message = 'operation was successful';
      const notifications = [message];
      Notification.notify(notifications, 'success');
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates success toaster with given message type and text', function () {
      const message = 'operation was successful';
      Notification.success(message);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates success toaster with given message type, title and text', function () {
      const message = 'operation was successful';
      const title = 'title';
      Notification.success(message, undefined, title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });
  });

  describe('error and warning notifications', function () {

    it('creates toaster with given message type and text', function () {
      const error_message = 'this is an error message';
      const notifications = [error_message];
      Notification.notify(notifications, 'warning');
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'warning', error_message, 0));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates toaster with given message type, title and text', function () {
      const error_message = 'this is an error message';
      const notifications = [error_message];
      const title = 'title';
      Notification.notify(notifications, 'warning', title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'warning', error_message, 0));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates toaster with warning function', function () {
      const title = 'warning title';
      const message = 'messageKey';
      Notification.warning(message, undefined, title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'warning', message, 0));
    });

    it('creates toaster with error function', function () {
      const title = 'error title';
      const message = 'messageKey';
      Notification.error(message, undefined, title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'error', message, 0));
    });
  });

  describe('read only mode toaster', function () {

    it('has a predefined warning message', function () {
      Notification.notifyReadOnly();
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'warning', 'readOnlyMessages.notAllowed', 0));
      expect(toaster.pop.calls.count()).toEqual(1);

    });

    it('prevents other toasters but logs a warning if prevent-timer hasn\'t expired', function () {
      Notification.notifyReadOnly();
      expect(toaster.pop.calls.count()).toEqual(1);

      toaster.pop.calls.reset();
      $log.warn.calls.reset();

      Notification.notify(['an error message'], 'warning');
      expect(toaster.pop.calls.count()).toEqual(0);
      expect($log.warn.calls.count()).toEqual(1);

      Notification.notify(['yet an error message'], 'warning');
      expect(toaster.pop.calls.count()).toEqual(0);
      expect($log.warn.calls.count()).toEqual(2);

      $timeout.flush();
      Notification.notify(['another error message'], 'warning');
      expect(toaster.pop.calls.count()).toEqual(1);
      expect($log.warn.calls.count()).toEqual(2);

    });
  });

  describe('errorResponse', function () {
    it('should notify an error from response.data.error.message string', function () {
      const response = createHttpResponseWith({
        data: {
          error: {
            message: 'errorMessage details',
          },
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errorMessage details. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.error.message array of strings', function () {
      const response = createHttpResponseWith({
        data: {
          error: {
            message: [
              'errorMessage details 1',
              'errorMessage details 2',
            ],
          },
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errorMessage details 1. errorMessage details 2. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.error.message array of objects', function () {
      const response = createHttpResponseWith({
        data: {
          error: {
            message: [{
              description: 'errorMessage details 1',
            }, {
              description: 'errorMessage details 2',
            }],
          },
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errorMessage details 1. errorMessage details 2. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.errors string', function () {
      const response = createHttpResponseWith({
        data: {
          errors: 'errorMessage details',
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errorMessage details. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.errors array of strings', function () {
      const response = createHttpResponseWith({
        data: {
          errors: [
            'errorMessage details 1',
            'errorMessage details 2',
          ],
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errorMessage details 1. errorMessage details 2. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.errors array of objects', function () {
      const response = createHttpResponseWith({
        data: {
          errors: [{
            description: 'errorMessage details 1',
          }, {
            description: 'errorMessage details 2',
          }],
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errorMessage details 1. errorMessage details 2. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.errorMessage', function () {
      const response = createHttpResponseWith({
        data: {
          errorMessage: 'errorMessage details',
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errorMessage details. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.error', function () {
      const response = createHttpResponseWith({
        data: {
          error: 'error details',
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. error details. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response string', function () {
      const response = 'some error string';
      Notification.errorResponse(response, 'Something happened'); // no trailing period
      const notifyMessage = 'Something happened. some error string';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error and log a warning if response is unrecognizable', function () {
      const response = {
        custom: 'not an http response',
      };
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened.';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
      expect($log.warn).toHaveBeenCalledWith('Unable to notify an error response', response);
    });

    it('should not notify an error for cancelled request', function () {
      const response = createHttpResponseWith({
        status: -1,
        xhrStatus: 'abort',
      });
      $timeout.flush(); // resolves timeout promise
      Notification.errorResponse(response, 'Something happened.');
      expect(toaster.pop).not.toHaveBeenCalled();
    });

    it('should notify an error for timeout request', function () {
      const response = createHttpResponseWith({
        status: -1,
        xhrStatus: 'timeout',
      });
      $timeout.flush(); // resolves timeout promise
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errors.statusTimeout. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with rejected error message', function () {
      const response = createHttpResponseWith({
        status: -1,
        xhrStatus: 'error',
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errors.statusRejected. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with a not found error message', function () {
      const response = createHttpResponseWith({
        status: 404,
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errors.status404. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with an unauthorized error message', function () {
      const response = createHttpResponseWith({
        status: 401,
      });
      Notification.errorResponse(response, 'Something happened.');
      const notifyMessage = 'Something happened. errors.statusUnauthorized. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with an unknown error message', function () {
      const response = createHttpResponseWith({
        status: 0,
      });
      Notification.errorResponse(response, 'Something happened'); // no trailing period
      const notifyMessage = 'Something happened. errors.statusUnknown. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with trackingId fallback in response.data', function () {
      const response = createHttpResponseWith({
        data: {
          trackingId: 'Atlas_555',
        },
        headers: _.noop,
      });
      Notification.errorResponse(response);
      const notifyMessage = 'TrackingID: Atlas_555';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with trackingId fallback in response.data.error', function () {
      const response = createHttpResponseWith({
        data: {
          error: {
            trackingId: 'Atlas_777',
          },
        },
        headers: _.noop,
      });
      Notification.errorResponse(response);
      const notifyMessage = 'TrackingID: Atlas_777';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });
  });

  describe('errorWithTrackingId overloading', () => {

    const processedErrorMessage = 'foo';

    beforeEach(function() {
      Notification.getErrorMessage = jasmine.createSpy('getErrorMessage').and.returnValue(processedErrorMessage);
      Notification.addResponseMessage = jasmine.createSpy('addResponseMessage').and.returnValue(processedErrorMessage);
      Notification.notifyHttpErrorResponse = jasmine.createSpy('notifyHttpErrorResponse');
    });

    it('should handle a string errorKey', () => {
      const httpResponse = {};
      const errorKey = 'some.thing';
      Notification.errorWithTrackingId(httpResponse, errorKey);
      expect(Notification.getErrorMessage).toHaveBeenCalledWith(errorKey, jasmine.any(Object));
      expect(Notification.addResponseMessage).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
      expect(Notification.notifyHttpErrorResponse).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
    });

    it('should handle a string errorKey and errorParams', () => {
      const httpResponse = {};
      const errorKey = 'some.thing';
      const errorParams = {
        params: 'are here',
      };
      Notification.errorWithTrackingId(httpResponse, errorKey, errorParams);
      expect(Notification.getErrorMessage).toHaveBeenCalledWith(errorKey, errorParams);
      expect(Notification.addResponseMessage).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
      expect(Notification.notifyHttpErrorResponse).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
    });

    it('should handle an INotificationOptions object containing an errorKey', () => {
      const httpResponse = {};
      const errorKey = 'some.thing';
      const options = {
        errorKey: errorKey,
      };
      Notification.errorWithTrackingId(httpResponse, options);
      expect(Notification.getErrorMessage).toHaveBeenCalledWith(errorKey, jasmine.any(Object));
      expect(Notification.addResponseMessage).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
      expect(Notification.notifyHttpErrorResponse).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
    });

    it('should handle an INotificationOptions object containing an errorKey and errorParams', () => {
      const httpResponse = {};
      const errorKey = 'some.thing';
      const errorParams = {
        params: 'are here',
      };
      const options = {
        errorKey: errorKey,
        errorParams: errorParams,
      };
      Notification.errorWithTrackingId(httpResponse, options);
      expect(Notification.getErrorMessage).toHaveBeenCalledWith(errorKey, errorParams);
      expect(Notification.addResponseMessage).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
      expect(Notification.notifyHttpErrorResponse).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
    });

    it('should handle an INotificationOptions object containing allowHtml: true', () => {
      const httpResponse = {};
      const errorKey = 'some.thing';
      const options = {
        errorKey: errorKey,
        allowHtml: true,
      };
      Notification.errorWithTrackingId(httpResponse, options);
      expect(Notification.getErrorMessage).toHaveBeenCalledWith(errorKey, jasmine.any(Object));
      expect(Notification.addResponseMessage).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
      expect(Notification.notifyHttpErrorResponse).toHaveBeenCalledWith(processedErrorMessage, httpResponse, true);
    });

    it('should add the default feedback mechanism if the INotificationOptions object contains feedbackInstructions: true, and override the allowHtml flag', () => {
      const httpResponse = {};
      const errorKey = 'some.thing';
      const options = {
        errorKey: errorKey,
        allowHtml: false,
        feedbackInstructions: true,
      };
      Notification.errorWithTrackingId(httpResponse, options);
      expect(Notification.getErrorMessage).toHaveBeenCalledWith(errorKey, jasmine.any(Object));
      expect(Notification.addResponseMessage).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
      expect(Notification.notifyHttpErrorResponse).toHaveBeenCalledWith(`${processedErrorMessage}<br />common.ifErrorRemains`, httpResponse, true);
    });

    it('should still pop a notification, even when the programmer provides invalid input', () => {
      const httpResponse = 'obviously not a valid https response';
      const errorKey = () => 'obviously not an errorKey';
      Notification.errorWithTrackingId(httpResponse, errorKey);
      expect(Notification.getErrorMessage).toHaveBeenCalledWith('', jasmine.any(Object));
      expect(Notification.addResponseMessage).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
      expect(Notification.notifyHttpErrorResponse).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
    });

    it('should still pop a notification, even when the programmer forgets to provide an errorKey', () => {
      const httpResponse = {};
      Notification.errorWithTrackingId(httpResponse);
      expect(Notification.getErrorMessage).toHaveBeenCalledWith('', jasmine.any(Object));
      expect(Notification.addResponseMessage).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
      expect(Notification.notifyHttpErrorResponse).toHaveBeenCalledWith(processedErrorMessage, httpResponse, false);
    });

  });

});
