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
    doCallPickUp: options.doCallPickUp || false,
  };
  return customer;
}
