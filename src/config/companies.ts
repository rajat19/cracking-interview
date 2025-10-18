import assetPath from '@/lib/assetPath';

export interface Company {
  label: string;
  identifier: string;
  img: string;
}

export const COMPANIES: Company[] = [
  { label: 'Meta', identifier: 'meta', img: 'meta.svg' },
  { label: 'Facebook', identifier: 'facebook', img: 'facebook.svg' },
  { label: 'Google', identifier: 'google', img: 'google.svg' },
  { label: 'Microsoft', identifier: 'microsoft', img: 'microsoft.svg' },
  { label: 'Amazon', identifier: 'amazon', img: 'amazon.svg' },
  { label: 'Netflix', identifier: 'netflix', img: 'netflix.svg' },
  { label: 'Apple', identifier: 'apple', img: 'apple.svg' },
  { label: 'OpenAI', identifier: 'openai', img: 'openai.svg' },
  { label: 'NVIDIA', identifier: 'nvidia', img: 'nvidia.svg' },
  { label: 'Tesla', identifier: 'tesla', img: 'tesla.svg' },
  { label: 'Uber', identifier: 'uber', img: 'uber.svg' },
  { label: 'Airbnb', identifier: 'airbnb', img: 'airbnb.svg' },
  { label: 'LinkedIn', identifier: 'linkedin', img: 'linkedin.svg' },
  { label: 'Salesforce', identifier: 'salesforce', img: 'salesforce.svg' },
  { label: 'Adobe', identifier: 'adobe', img: 'adobe.svg' },
  { label: 'Oracle', identifier: 'oracle', img: 'oracle.svg' },
  { label: 'Twitter', identifier: 'twitter', img: 'twitter.svg' },
  { label: 'X', identifier: 'x', img: 'x.svg' },
  { label: 'Bloomberg', identifier: 'bloomberg', img: 'bloomberg.svg' },
  { label: 'Goldman Sachs', identifier: 'goldman', img: 'goldman.svg' },
  { label: 'PayPal', identifier: 'paypal', img: 'paypal.svg' },
  { label: 'Intuit', identifier: 'intuit', img: 'intuit.svg' },
  { label: 'Walmart', identifier: 'walmart', img: 'walmart.svg' },
  { label: 'eBay', identifier: 'ebay', img: 'ebay.svg' },
  { label: 'Flipkart', identifier: 'flipkart', img: 'flipkart.svg' },
  { label: 'DoorDash', identifier: 'doordash', img: 'doordash.svg' },
  { label: 'Booking', identifier: 'booking', img: 'booking.svg' },
  { label: 'Expedia', identifier: 'expedia', img: 'expedia.svg' },
  { label: 'Atlassian', identifier: 'atlassian', img: 'atlassian.svg' },
  { label: 'Snapchat', identifier: 'snapchat', img: 'snapchat.svg' },
  { label: 'Pinterest', identifier: 'pinterest', img: 'pinterest.svg' },
  { label: 'Lyft', identifier: 'lyft', img: 'lyft.svg' },
  { label: 'Indeed', identifier: 'indeed', img: 'indeed.svg' },
  { label: 'Yelp', identifier: 'yelp', img: 'yelp.svg' },
  { label: 'SAP', identifier: 'sap', img: 'sap.svg' },
  { label: 'VMware', identifier: 'vmware', img: 'vmware.svg' },
  { label: 'Nutanix', identifier: 'nutanix', img: 'nutanix.svg' },
];

/**
 * Builds the asset path for the given company icon, respecting basePath/assetPrefix.
 */
export function companyIconSrc(company: Company): string {
  return assetPath(`/assets/img/company/${company.img}`);
}

export default COMPANIES;
