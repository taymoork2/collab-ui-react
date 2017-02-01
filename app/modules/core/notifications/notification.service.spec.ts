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
        let headers = {
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
      let message = 'operation was successful';
      let notifications = [message];
      Notification.notify(notifications, 'success');
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates success toaster with given message type and text', function () {
      let message = 'operation was successful';
      Notification.success(message);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates success toaster with given message type, title and text', function () {
      let message = 'operation was successful';
      let title = 'title';
      Notification.success(message, undefined, title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });
  });

  describe('error and warning notifications', function () {

    it('creates toaster with given message type and text', function () {
      let error_message = 'this is an error message';
      let notifications = [error_message];
      Notification.notify(notifications, 'warning');
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'warning', error_message, 0));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates toaster with given message type, title and text', function () {
      let error_message = 'this is an error message';
      let notifications = [error_message];
      let title = 'title';
      Notification.notify(notifications, 'warning', title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'warning', error_message, 0));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates toaster with warning function', function () {
      let title = 'warning title';
      let message = 'messageKey';
      Notification.warning(message, undefined, title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'warning', message, 0));
    });

    it('creates toaster with error function', function () {
      let title = 'error title';
      let message = 'messageKey';
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
      let response = createHttpResponseWith({
        data: {
          error: {
            message: 'errorMessage details',
          },
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errorMessage details. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.error.message array of strings', function () {
      let response = createHttpResponseWith({
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
      let notifyMessage = 'Something happened. errorMessage details 1. errorMessage details 2. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.error.message array of objects', function () {
      let response = createHttpResponseWith({
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
      let notifyMessage = 'Something happened. errorMessage details 1. errorMessage details 2. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.errors string', function () {
      let response = createHttpResponseWith({
        data: {
          errors: 'errorMessage details',
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errorMessage details. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.errors array of strings', function () {
      let response = createHttpResponseWith({
        data: {
          errors: [
            'errorMessage details 1',
            'errorMessage details 2',
          ],
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errorMessage details 1. errorMessage details 2. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.errors array of objects', function () {
      let response = createHttpResponseWith({
        data: {
          errors: [{
            description: 'errorMessage details 1',
          }, {
            description: 'errorMessage details 2',
          }],
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errorMessage details 1. errorMessage details 2. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.errorMessage', function () {
      let response = createHttpResponseWith({
        data: {
          errorMessage: 'errorMessage details',
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errorMessage details. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response.data.error', function () {
      let response = createHttpResponseWith({
        data: {
          error: 'error details',
        },
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. error details. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error from response string', function () {
      let response = 'some error string';
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. some error string';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error and log a warning if response is unrecognizable', function () {
      let response = {
        custom: 'not an http response',
      };
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened.';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
      expect($log.warn).toHaveBeenCalledWith('Unable to notify an error response', response);
    });

    it('should not notify an error for cancelled request', function () {
      let response = createHttpResponseWith({
        status: -1,
      });
      $timeout.flush(); // resolves timeout promise
      Notification.errorResponse(response, 'Something happened.');
      expect(toaster.pop).not.toHaveBeenCalled();
    });

    it('should notify an error with rejected error message', function () {
      let response = createHttpResponseWith({
        status: -1,
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errors.statusRejected. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with a not found error message', function () {
      let response = createHttpResponseWith({
        status: 404,
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errors.status404. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with an unauthorized error message', function () {
      let response = createHttpResponseWith({
        status: 401,
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errors.statusUnauthorized. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with an unknown error message', function () {
      let response = createHttpResponseWith({
        status: 0,
      });
      Notification.errorResponse(response, 'Something happened.');
      let notifyMessage = 'Something happened. errors.statusUnknown. TrackingID: Atlas_123';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with trackingId fallback in response.data', function () {
      let response = createHttpResponseWith({
        data: {
          trackingId: 'Atlas_555',
        },
        headers: _.noop,
      });
      Notification.errorResponse(response);
      let notifyMessage = 'TrackingID: Atlas_555';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });

    it('should notify an error with trackingId fallback in response.data.error', function () {
      let response = createHttpResponseWith({
        data: {
          error: {
            trackingId: 'Atlas_777',
          },
        },
        headers: _.noop,
      });
      Notification.errorResponse(response);
      let notifyMessage = 'TrackingID: Atlas_777';
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'error', notifyMessage, 0));
    });
  });
});
