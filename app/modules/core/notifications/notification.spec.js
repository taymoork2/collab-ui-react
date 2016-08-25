describe('Service: Notification', function () {
  beforeEach(angular.mock.module('Core'));

  var Notification, toaster, Authinfo, Config, $timeout, Log;

  function MakePopResponse(title, type, message, timeout) {
    return {
      title: title,
      type: type,
      body: 'bind-unsafe-html',
      bodyOutputType: 'directive',
      directiveData: { data: [message] },
      timeout: timeout,
      closeHtml: jasmine.any(String)
    };
  }

  beforeEach(inject(function (_Notification_, _toaster_, _Authinfo_, _Config_, _$timeout_, _Log_) {
    Notification = _Notification_;
    toaster = _toaster_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    $timeout = _$timeout_;
    Log = _Log_;

    spyOn(Config, "isE2E").and.returnValue(false);
  }));

  describe('success notifications', function () {

    it('creates toaster with given message type and text', function () {
      spyOn(toaster, "pop");

      var message = "operation was successful";
      var notifications = [message];
      Notification.notify(notifications, "success");
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates success toaster with given message type and text', function () {
      spyOn(toaster, "pop");

      var message = "operation was successful";
      Notification.success(message);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });

    it('creates success toaster with given message type, title and text', function () {
      spyOn(toaster, "pop");

      var message = "operation was successful";
      var title = "title";
      Notification.success(message, undefined, title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'success', message, 3000));
      expect(toaster.pop.calls.count()).toEqual(1);
    });
  });

  describe('error and warning notifications', function () {

    it('creates toaster with given message type and text', function () {
      spyOn(toaster, "pop");
      spyOn(Authinfo, "isReadOnlyAdmin").and.returnValue(false);

      var error_message = "this is an error message";
      var notifications = [error_message];
      Notification.notify(notifications, "warning");
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'warning', error_message, 0));
      expect(toaster.pop.calls.count()).toEqual(1);

    });

    it('creates toaster with given message type, title and text', function () {
      spyOn(toaster, "pop");
      spyOn(Authinfo, "isReadOnlyAdmin").and.returnValue(false);

      var error_message = "this is an error message";
      var notifications = [error_message];
      var title = "title";
      Notification.notify(notifications, "warning", title);
      expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(title, 'warning', error_message, 0));
      expect(toaster.pop.calls.count()).toEqual(1);

    });

    describe('read only mode toaster', function () {

      it('has a predefined warning message', function () {
        spyOn(toaster, "pop");
        spyOn(Authinfo, "isReadOnlyAdmin").and.returnValue(true);

        Notification.notifyReadOnly();
        expect(toaster.pop).toHaveBeenCalledWith(MakePopResponse(undefined, 'warning', 'readOnlyMessages.notAllowed', 0));
        expect(toaster.pop.calls.count()).toEqual(1);

      });

      it("prevents other toasters but logs a warning if prevent-timer hasn't expired", function () {
        spyOn(toaster, "pop");
        spyOn(Log, "warn");
        spyOn(Authinfo, "isReadOnlyAdmin").and.returnValue(true);

        Notification.notifyReadOnly();
        expect(toaster.pop.calls.count()).toEqual(1);

        toaster.pop.calls.reset();
        Log.warn.calls.reset();

        Notification.notify(["an error message"], "warning");
        expect(toaster.pop.calls.count()).toEqual(0);
        expect(Log.warn.calls.count()).toEqual(1);

        Notification.notify(["yet an error message"], "warning");
        expect(toaster.pop.calls.count()).toEqual(0);
        expect(Log.warn.calls.count()).toEqual(2);

        $timeout.flush();
        Notification.notify(["another error message"], "warning");
        expect(toaster.pop.calls.count()).toEqual(1);
        expect(Log.warn.calls.count()).toEqual(2);

      });
    });
  });

  describe('Yes/No Confirmation Notifications', function () {

    it('creates toaster with yes/no confirmation', function () {
      spyOn(toaster, "pop");

      var message = "confirmation was successful";
      Notification.confirmation(message);
      expect(toaster.pop).toHaveBeenCalledWith({
        type: 'warning',
        body: 'cs-confirmation',
        bodyOutputType: 'directive',
        showCloseButton: false
      });
      expect(toaster.pop.calls.count()).toEqual(1);
    });
  });
});
