describe('Service: Notification', function () {
  beforeEach(module('Core'));

  var Notification, $translate, toaster, Authinfo, Config;

  beforeEach(inject(function (_Notification_, _$translate_, _toaster_, _Authinfo_, _Config_) {
    Notification = _Notification_;
    $translate = _$translate_;
    toaster = _toaster_;
    Authinfo = _Authinfo_;
    Config = _Config_;

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

    it('in read only mode creates toaster with predefined warning message', function () {
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
  });

});
