import moduleName from './index';
import { SipAddressModel } from './sip-address.model';

type Test = atlas.test.IServiceTest<{
  SipAddressModel: SipAddressModel,
}>;

describe('SipAddressModel', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
  });

  const testSipAddressModel = (options: {
    atlasJ9614SipUriRebranding: boolean,
    isProd: boolean,
    sipCloudDomain?: string,
    expectInitialSipCloudDomainIsChanged?: boolean,
    expectedSipCloudDomain: string,
    expectedSubdomain: string,
    expectedCallSubdomain: string,
    expectedRoomSubdomain: string,
    expectedNewDomain: string,
    expectedNewCallSubdomain: string,
    expectedNewRoomSubdomain: string,
  }) => {
    const {
      atlasJ9614SipUriRebranding,
      isProd,
      sipCloudDomain,
      expectInitialSipCloudDomainIsChanged = false,
      expectedSipCloudDomain,
      expectedSubdomain,
      expectedCallSubdomain,
      expectedRoomSubdomain,
      expectedNewDomain,
      expectedNewCallSubdomain,
      expectedNewRoomSubdomain,
    } = options;
    const model = new SipAddressModel({
      atlasJ9614SipUriRebranding,
      isProd,
      sipCloudDomain,
    });
    expect(model.sipCloudDomain).toBe(expectedSipCloudDomain);
    expect(model.subdomain).toBe(expectedSubdomain);
    expect(model.callFQDN).toBe(`${expectedSubdomain}${expectedCallSubdomain}`);
    expect(model.roomFQDN).toBe(`${expectedSubdomain}${expectedRoomSubdomain}`);
    expect(model.isChanged()).toBe(expectInitialSipCloudDomainIsChanged); // is changed if original sipCloudDomain did not exist or switching to new domain

    model.subdomain = 'new';
    expect(model.sipCloudDomain).toBe(`new${expectedNewDomain}`);
    expect(model.isChanged()).toBe(true);

    const newModel = model.createNewModel();

    model.reset();
    expect(model.sipCloudDomain).toBe(expectedSipCloudDomain); // reset back to original sipCloudDomain

    expect(newModel.sipCloudDomain).toBe(`new${expectedNewDomain}`);
    expect(newModel.subdomain).toBe('new');
    expect(newModel.callFQDN).toBe(`new${expectedNewCallSubdomain}`);
    expect(newModel.roomFQDN).toBe(`new${expectedNewRoomSubdomain}`);
    expect(newModel.isChanged()).toBe(false); // not different from sipCloudDomain when it was created
  };

  describe('Without atlasJ9614SipUriRebranding', () => {
    describe('in production', () => {
      it('should initialize to .ciscospark.com domain if sipCloudDomain is not specified', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: false,
          isProd: true,
          expectInitialSipCloudDomainIsChanged: true,
          expectedSipCloudDomain: '.ciscospark.com',
          expectedSubdomain: '',
          expectedCallSubdomain: '.call.ciscospark.com',
          expectedRoomSubdomain: '.room.ciscospark.com',
          expectedNewDomain: '.ciscospark.com',
          expectedNewCallSubdomain: '.call.ciscospark.com',
          expectedNewRoomSubdomain: '.room.ciscospark.com',
        });
      });

      it('should parse domain from .ciscospark.com sipCloudDomain', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: false,
          isProd: true,
          sipCloudDomain: 'existing.ciscospark.com',
          expectedSipCloudDomain: 'existing.ciscospark.com',
          expectedSubdomain: 'existing',
          expectedCallSubdomain: '.call.ciscospark.com',
          expectedRoomSubdomain: '.room.ciscospark.com',
          expectedNewDomain: '.ciscospark.com',
          expectedNewCallSubdomain: '.call.ciscospark.com',
          expectedNewRoomSubdomain: '.room.ciscospark.com',
        });
      });
    });
    describe('not in production', () => {
      it('should initialize to .wbx2.com domain if sipCloudDomain is not specified', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: false,
          isProd: false,
          expectInitialSipCloudDomainIsChanged: true,
          expectedSipCloudDomain: '.wbx2.com',
          expectedSubdomain: '',
          expectedCallSubdomain: '.call.wbx2.com',
          expectedRoomSubdomain: '.room.wbx2.com',
          expectedNewDomain: '.wbx2.com',
          expectedNewCallSubdomain: '.call.wbx2.com',
          expectedNewRoomSubdomain: '.room.wbx2.com',
        });
      });

      it('should parse domain from .wbx2.com sipCloudDomain', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: false,
          isProd: false,
          sipCloudDomain: 'existing.wbx2.com',
          expectedSipCloudDomain: 'existing.wbx2.com',
          expectedSubdomain: 'existing',
          expectedCallSubdomain: '.call.wbx2.com',
          expectedRoomSubdomain: '.room.wbx2.com',
          expectedNewDomain: '.wbx2.com',
          expectedNewCallSubdomain: '.call.wbx2.com',
          expectedNewRoomSubdomain: '.room.wbx2.com',
        });
      });
    });
  });
  describe('With atlasJ9614SipUriRebranding', () => {
    describe('in production', () => {
      it('should initialize to .webex.com domain if sipCloudDomain is not specified', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: true,
          isProd: true,
          expectInitialSipCloudDomainIsChanged: true,
          expectedSipCloudDomain: '.webex.com',
          expectedSubdomain: '',
          expectedCallSubdomain: '.calls.webex.com',
          expectedRoomSubdomain: '.rooms.webex.com',
          expectedNewDomain: '.webex.com',
          expectedNewCallSubdomain: '.calls.webex.com',
          expectedNewRoomSubdomain: '.rooms.webex.com',
        });
      });

      it('should parse domain from .ciscospark.com sipCloudDomain', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: true,
          isProd: true,
          sipCloudDomain: 'existing.ciscospark.com',
          expectInitialSipCloudDomainIsChanged: true,
          expectedSipCloudDomain: 'existing.webex.com',
          expectedSubdomain: 'existing',
          expectedCallSubdomain: '.call.ciscospark.com',
          expectedRoomSubdomain: '.room.ciscospark.com',
          expectedNewDomain: '.webex.com',
          expectedNewCallSubdomain: '.calls.webex.com',
          expectedNewRoomSubdomain: '.rooms.webex.com',
        });
      });

      it('should parse domain from .webex.com sipCloudDomain', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: true,
          isProd: true,
          sipCloudDomain: 'existing.webex.com',
          expectedSipCloudDomain: 'existing.webex.com',
          expectedSubdomain: 'existing',
          expectedCallSubdomain: '.calls.webex.com',
          expectedRoomSubdomain: '.rooms.webex.com',
          expectedNewDomain: '.webex.com',
          expectedNewCallSubdomain: '.calls.webex.com',
          expectedNewRoomSubdomain: '.rooms.webex.com',
        });
      });
    });
    describe('not in production', () => {
      it('should initialize to .koalabait.com domain if sipCloudDomain is not specified', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: true,
          isProd: false,
          expectInitialSipCloudDomainIsChanged: true,
          expectedSipCloudDomain: '.koalabait.com',
          expectedSubdomain: '',
          expectedCallSubdomain: '.calls.koalabait.com',
          expectedRoomSubdomain: '.rooms.koalabait.com',
          expectedNewDomain: '.koalabait.com',
          expectedNewCallSubdomain: '.calls.koalabait.com',
          expectedNewRoomSubdomain: '.rooms.koalabait.com',
        });
      });

      it('should parse domain from .wbx2.com sipCloudDomain', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: true,
          isProd: false,
          sipCloudDomain: 'existing.wbx2.com',
          expectInitialSipCloudDomainIsChanged: true,
          expectedSipCloudDomain: 'existing.koalabait.com',
          expectedSubdomain: 'existing',
          expectedCallSubdomain: '.call.wbx2.com',
          expectedRoomSubdomain: '.room.wbx2.com',
          expectedNewDomain: '.koalabait.com',
          expectedNewCallSubdomain: '.calls.koalabait.com',
          expectedNewRoomSubdomain: '.rooms.koalabait.com',
        });
      });

      it('should parse domain from .koalabait.com sipCloudDomain', function (this: Test) {
        testSipAddressModel({
          atlasJ9614SipUriRebranding: true,
          isProd: false,
          sipCloudDomain: 'existing.koalabait.com',
          expectedSipCloudDomain: 'existing.koalabait.com',
          expectedSubdomain: 'existing',
          expectedCallSubdomain: '.calls.koalabait.com',
          expectedRoomSubdomain: '.rooms.koalabait.com',
          expectedNewDomain: '.koalabait.com',
          expectedNewCallSubdomain: '.calls.koalabait.com',
          expectedNewRoomSubdomain: '.rooms.koalabait.com',
        });
      });
    });
  });
});
