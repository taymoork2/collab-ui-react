'use strict';

describe('URI Verification Service', function () {
  beforeEach(module('Hercules'));

  var service;

  beforeEach(module(function ($provide) {
    $provide.value("DomainManagementService", {
      getVerifiedDomains: function () {
        return null;
      },
      domainList: [{
        text: 'pendingdomain.com',
        status: 'pending'
      }, {
        text: 'validdomain.com',
        status: 'verified'
      }, {
        text: 'validsubdomain.unverified.com',
        status: 'verified'
      }, {
        text: 'claimeddomain.com',
        status: 'claimed'
      }],
      states: {
        pending: 'pending',
        verified: 'verified',
        claimed: 'claimed'
      }
    });
  }));

  beforeEach(inject(function (UriVerificationService) {
    service = UriVerificationService;
  }));

  it('should return false for invalid uris', function () {
    expect(service.isDomainVerified()).toBe(false);
    expect(service.isDomainVerified(null)).toBe(false);
    expect(service.isDomainVerified('')).toBe(false);
    expect(service.isDomainVerified('..')).toBe(false);
    expect(service.isDomainVerified('valid@')).toBe(false);
  });

  it('should return false for valid non-verified domain', function () {

    expect(service.isDomainVerified('nonVerifiedDomain.com')).toBe(false); //nonVerifiedDomain.com
    expect(service.isDomainVerified('hostname.nonVerifiedDomain.com')).toBe(false); //hostname.nonVerifiedDomain.com
    expect(service.isDomainVerified('invalid@nonVerifiedDomain.com')).toBe(false); //nonVerifiedDomain.com
    expect(service.isDomainVerified('invalid@hostname.nonVerifiedDomain.com')).toBe(false); //hostname.nonVerifiedDomain.com
    expect(service.isDomainVerified('invalid@ho@nonVerifiedDomain.com')).toBe(false); //nonVerifiedDomain.com
    expect(service.isDomainVerified('invalid@ho@hostname.nonVerifiedDomain.com')).toBe(false); //hostname.nonVerifiedDomain.com

    expect(service.isDomainVerified('validDomain.nonVerifiedDomain.com')).toBe(false);
    expect(service.isDomainVerified('validDomain')).toBe(false);
    expect(service.isDomainVerified('almostvalidDomain.com')).toBe(false);

    expect(service.isDomainVerified('validsubdomain.com')).toBe(false); //validDomain.com
    expect(service.isDomainVerified('toplevel.validsubdomain.something.unverified.com')).toBe(false); //validDomain.com
    expect(service.isDomainVerified('user@validsubdomain2.unverified.com')).toBe(false); //validDomain.com
    expect(service.isDomainVerified('user2@toplevel.validsubdomain2.unverified.com')).toBe(false); //validDomain.com

  });

  it('should return true for valid verified domains', function () {

    expect(service.isDomainVerified('validDomain.com')).toBe(true); //validDomain.com
    expect(service.isDomainVerified('hostname.validDomain.com')).toBe(true); //hostname.validDomain.com
    expect(service.isDomainVerified('invalid@validDomain.com')).toBe(true); //validDomain.com
    expect(service.isDomainVerified('invalid@hostname.validDomain.com')).toBe(true); //hostname.validDomain.com
    expect(service.isDomainVerified('invalid@ho@validDomain.com')).toBe(true); //validDomain.com
    expect(service.isDomainVerified('invalid@ho@hostname.validDomain.com')).toBe(true); //hostname.validDomain.com

    expect(service.isDomainVerified('validsubdomain.unverified.com')).toBe(true); //validDomain.com
    expect(service.isDomainVerified('toplevel.validsubdomain.unverified.com')).toBe(true); //validDomain.com
    expect(service.isDomainVerified('user@validsubdomain.unverified.com')).toBe(true); //validDomain.com
    expect(service.isDomainVerified('user2@toplevel.validsubdomain.unverified.com')).toBe(true); //validDomain.com
  });
});
