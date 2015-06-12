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

  it('unknown product should be cleared', function () {
    var arr = [{
      product: 'UNKNOWN'
    }];
    expect(converter.convert(arr)[0].product).toBe('');
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
    it('should convert device with issues to Has Issues and red', function () {
      var arr = [{
        state: 'CLAIMED',
        status: {
          level: "error",
          connectionStatus: 'CONNECTED'
        }
      }];
      expect(converter.convert(arr)[0].readableState).toBe('CsdmStatus.issuesDetected');
      expect(converter.convert(arr)[0].cssColorClass).toBe('device-status-red');
    });

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

    it('should convert state CLAIMED and no connection status to Offline and gray', function () {
      var arr = [{
        state: 'CLAIMED'
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

  describe("software event", function () {
    it('should convert software', function () {
      var arr = [{
        status: {
          events: [{
            type: 'software',
            level: 'INFO',
            description: 'sw_version'
          }]
        }
      }];
      expect(converter.convert(arr)[0].software).toBe('sw_version');
    });

    it('should not fail when no software events', function () {
      var arr = [{
        status: {}
      }];
      expect(converter.convert(arr)[0].software).toBeFalsy();
    });
  });

  describe("ip event", function () {
    it('should convert ip', function () {
      var arr = [{
        status: {
          events: [{
            type: 'ip',
            level: 'INFO',
            description: 'ip_addr'
          }]
        }
      }];
      expect(converter.convert(arr)[0].ip).toBe('ip_addr');
    });
  });

  describe("diagnostics events", function () {
    it('should show localized tcpfallback', function () {
      var arr = [{
        status: {
          events: [{
            type: 'tcpfallback_type',
            level: 'warn',
            description: 'tcpfallback_description'
          }]
        }
      }];
      expect(converter.convert(arr)[0].diagnosticsEvents[0].type).toBe('tcpfallback_type');
      expect(converter.convert(arr)[0].diagnosticsEvents[0].message).toBe('tcpfallback_description');
    });
  });

  describe("has issues", function () {
    it('has issues when status.level is not ok', function () {
      var arr = [{
        status: {
          level: 'not_ok'
        }
      }];
      expect(converter.convert(arr)[0].hasIssues).toBeTruthy();
    });

    it('has does not have issues when status.level is ok', function () {
      var arr = [{
        status: {
          level: 'OK'
        }
      }];
      expect(converter.convert(arr)[0].hasIssues).toBeFalsy();
    });
  });

  describe("has issues", function () {
    it('has issues when status.level is not ok', function () {
      var arr = [{
        status: {
          level: 'not_ok'
        }
      }];
      expect(converter.convert(arr)[0].hasIssues).toBeTruthy();
    });

    it('has does not have issues when status.level is ok', function () {
      var arr = [{
        status: {
          level: 'OK'
        }
      }];
      expect(converter.convert(arr)[0].hasIssues).toBeFalsy();
    });
  });
});
