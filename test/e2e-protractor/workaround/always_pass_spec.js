// Sauce Labs Ticket 39647 - individual spec exits with error code 100
// TODO: temporary - need to run more than one spec at a time
describe('protractor sauce workaround', function () {
  it('always pass', _.noop);
});
