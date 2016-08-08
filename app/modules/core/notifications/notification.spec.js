describe('Service: Notification', function () {
  beforeEach(angular.mock.module('Core'));

  var Notification, toaster, Authinfo, Config, $timeout, Log;

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
      expect(toaster.pop).toHaveBeenCalledWith({
        type: 'success',
        body: message,
        timeout: 3000,
        closeHtml: jasmine.any(String)
      });
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
      expect(toaster.pop).toHaveBeenCalledWith({
        type: 'warning',
        body: error_message,
        timeout: 0,
        closeHtml: jasmine.any(String)
      });
      expect(toaster.pop.calls.count()).toEqual(1);

    });

    describe('read only mode toaster', function () {

      it('has a predefined warning message', function () {
        spyOn(toaster, "pop");
        spyOn(Authinfo, "isReadOnlyAdmin").and.returnValue(true);

        Notification.notifyReadOnly();
        expect(toaster.pop).toHaveBeenCalledWith({
          type: 'warning',
          body: 'readOnlyMessages.notAllowed',
          timeout: 0,
          closeHtml: jasmine.any(String)
        });
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

});
