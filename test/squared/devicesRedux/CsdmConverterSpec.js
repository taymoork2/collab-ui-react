'use strict';

describe('CsdmConverterSpec', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var converter;

  beforeEach(inject(function (CsdmConverter) {
    converter = CsdmConverter;
  }));

  it('should format activation code', function () {
    var arr = [{
      activationCode: '1111222233334444'
    }];
    expect(converter.convert(arr)[0].readableActivationCode).toBe('1111 2222 3333 4444');
  });

  it('should add needsActivation flag', function () {
    var arr = [{
      state: 'UNCLAIMED'
    }];
    expect(converter.convert(arr)[0].needsActivation).toBeTruthy();
  });

  describe('pass thru fields', function () {

    it('displayName', function () {
      var arr = [{
        displayName: 'bar'
      }];
      expect(converter.convert(arr)[0].displayName).toBe('bar');
    });

    it('mac', function () {
      var arr = [{
        mac: 'bar'
      }];
      expect(converter.convert(arr)[0].mac).toBe('bar');
    });

    it('product', function () {
      var arr = [{
        product: 'bar'
      }];
      expect(converter.convert(arr)[0].product).toBe('bar');
    });

    it('serial', function () {
      var arr = [{
        serial: 'bar'
      }];
      expect(converter.convert(arr)[0].serial).toBe('bar');
    });

    it('url', function () {
      var arr = [{
        url: 'foo'
      }];
      expect(converter.convert(arr)[0].url).toBe('foo');
    });

  }); // pass thru fields

  describe('readableState and cssColorClass', function () {

    it('should convert state UNCLAIMED to Needs Activation and yellow', function () {
      var arr = [{
        state: 'UNCLAIMED'
      }];
      expect(converter.convert(arr)[0].readableState).toBe('CsdmStatus.NeedsActivation');
      expect(converter.convert(arr)[0].cssColorClass).toBe('device-status-yellow');
    });

    it('should convert state CLAIMED and connection status CONNECTED to Online and green', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convert(arr)[0].readableState).toBe('CsdmStatus.Online');
      expect(converter.convert(arr)[0].cssColorClass).toBe('device-status-green');
    });

    it('should convert state CLAIMED and connection status UNKNOWN to Offline and gray', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          connectionStatus: 'UNKNOWN'
        }
      }];
      expect(converter.convert(arr)[0].readableState).toBe('CsdmStatus.Offline');
      expect(converter.convert(arr)[0].cssColorClass).toBe('device-status-gray');
    });

    it('should convert null state and null connection status to Unknown and yellow', function () {
      var arr = [{}];
      expect(converter.convert(arr)[0].readableState).toBe('CsdmStatus.Unknown');
      expect(converter.convert(arr)[0].cssColorClass).toBe('device-status-yellow');
    });

  }); // aggregatedState & cssColorClass

});
