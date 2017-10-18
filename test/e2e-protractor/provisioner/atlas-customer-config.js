import { AtlasTrial, getTrialOffers } from './atlas-trial';

export function atlasCustomer(customerOptions) {
  const options = customerOptions;
  const customer = {
    partner: options.partner,
    name: options.name,
    trial: new AtlasTrial({
      customerName: options.name,
      customerEmail: options.email,
      offers: getTrialOffers(options.offers),
    }),
    callOptions: options.callOptions || undefined,
    users: options.users || undefined,
    places: options.places || undefined,
    doFtsw: options.doFtsw || false,
    doCallPickup: options.doCallPickup || false,
    doCallPark: options.doCallPark || false,
    doHuntGroup: options.doHuntGroup || false,
    doCallPaging: options.doCallPaging || false,
    doAllFeatures: options.doAllFeatures || false,
  };
  return customer;
}
