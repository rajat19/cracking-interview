import assetPath from '@/lib/assetPath';

export interface CompanyInfo {
  label: string;
  icon: string;
}

export const COMPANIES: Record<string, CompanyInfo> = {
  adobe: { label: 'Adobe', icon: 'adobe' },
  airbnb: { label: 'Airbnb', icon: 'airbnb' },
  amazon: { label: 'Amazon', icon: 'amazon' },
  apple: { label: 'Apple', icon: 'apple' },
  atlassian: { label: 'Atlassian', icon: 'atlassian' },
  bloomberg: { label: 'Bloomberg', icon: 'bloomberg' },
  booking: { label: 'Booking', icon: 'booking' },
  doordash: { label: 'DoorDash', icon: 'doordash' },
  ebay: { label: 'eBay', icon: 'ebay' },
  expedia: { label: 'Expedia', icon: 'expedia' },
  facebook: { label: 'Facebook', icon: 'facebook' },
  goldman: { label: 'Goldman Sachs', icon: 'goldman' },
  google: { label: 'Google', icon: 'google' },
  indeed: { label: 'Indeed', icon: 'indeed' },
  intuit: { label: 'Intuit', icon: 'intuit' },
  linkedin: { label: 'LinkedIn', icon: 'linkedin' },
  lyft: { label: 'Lyft', icon: 'lyft' },
  meta: { label: 'Meta', icon: 'meta' },
  microsoft: { label: 'Microsoft', icon: 'microsoft' },
  netflix: { label: 'Netflix', icon: 'netflix' },
  openai: { label: 'OpenAI', icon: 'openai' },
  oracle: { label: 'Oracle', icon: 'oracle' },
  paypal: { label: 'PayPal', icon: 'paypal' },
  pinterest: { label: 'Pinterest', icon: 'pinterest' },
  salesforce: { label: 'Salesforce', icon: 'salesforce' },
  sap: { label: 'SAP', icon: 'sap' },
  snapchat: { label: 'Snapchat', icon: 'snapchat' },
  tesla: { label: 'Tesla', icon: 'tesla' },
  twitter: { label: 'Twitter', icon: 'twitter' },
  uber: { label: 'Uber', icon: 'uber' },
  vmware: { label: 'VMware', icon: 'vmware' },
  walmart: { label: 'Walmart', icon: 'walmart' },
  x: { label: 'X', icon: 'x' },
  yelp: { label: 'Yelp', icon: 'yelp' },
};

function toTitleCase(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b([a-z])/g, (_, ch: string) => ch.toUpperCase());
}

/**
 * Returns normalized company info, falling back to a title-cased label and same icon key when absent.
 */
export function getCompanyInfo(companyKey: string): CompanyInfo {
  const key = (companyKey || '').toLowerCase();
  const preset = COMPANIES[key];
  if (preset) return preset;
  return { label: toTitleCase(key), icon: key };
}

/**
 * Builds the asset path for the given company icon, respecting basePath/assetPrefix.
 */
export function companyIconSrc(companyKey: string): string {
  const { icon } = getCompanyInfo(companyKey);
  return assetPath(`/assets/img/company/${icon}.svg`);
}


