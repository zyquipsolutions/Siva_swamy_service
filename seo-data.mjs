// ============================================================================
//  seo-data.mjs — page titles, meta descriptions and footer "Popular searches".
//  Keep every title and description unique. {name} = business name.
// ============================================================================

export const PAGE_META = {
  home:         { title: 'Chimney, Water Heater & Hob Service in Chennai | {name}', description: 'Home appliance service in Perambur and across Chennai. Kitchen chimney installation and cleaning, water heater repair and hob service. Call or WhatsApp +91 8939115649.' },
  about:        { title: 'About Us | {name}, Perambur, Chennai', description: 'Meet Siva Swamy Services, an authorised Elica service company in Perambur, Chennai that installs, maintains and repairs kitchen chimneys, water heaters and hobs.' },
  services:     { title: 'Home Appliance Installation & Repair Services | {name}', description: 'Kitchen chimney installation and cleaning, water heater installation and repair, and built in hob service across Chennai, from our base in Perambur.' },
  pricing:      { title: 'Appliance Service Pricing | {name}', description: 'Ask about pricing for chimney, water heater and hob installation, maintenance and repair in Chennai. Share your appliance details and we will discuss the cost.' },
  areas:        { title: 'Service Areas in North, Central & West Chennai | {name}', description: 'Chimney, water heater and hob service from Perambur to {areas} Chennai localities, including Anna Nagar, Kolathur, Ambattur, Avadi and Park Town.' },
  reviews:      { title: 'Customer Reviews | {name}, Chennai', description: 'Read Google reviews of Siva Swamy Services in Perambur for chimney service, water heater repair and kitchen hob service in Chennai, or share your own.' },
  gallery:      { title: 'Our Work: Chimney, Water Heater & Hob Photos | {name}', description: 'Photos of kitchen chimney, water heater and kitchen hob installation and servicing work carried out in homes across Chennai.' },
  blog:         { title: 'Appliance Care & Maintenance Tips | {name}', description: 'Practical, safe care tips for kitchen chimneys, water heaters and kitchen hobs from the team at Siva Swamy Services, Chennai.' },
  contact:      { title: 'Contact Us | {name}, Perambur, Chennai', description: 'Call or WhatsApp +91 8939115649, email sivaswamyservices@gmail.com, or visit us at Old No: 71A, New No: 115, Paddy Fields Road, Perambur, Chennai 600011.' },
  book:         { title: 'Book a Chimney, Water Heater or Hob Service | {name}', description: 'Send a service request for kitchen chimney, water heater or hob installation, maintenance or repair in Chennai. We will contact you to confirm.' },
};

export const SERVICE_PAGES = {
  'kitchen-chimney': { title: 'Kitchen Chimney Service & Repair in Chennai | {name}', description: 'Kitchen chimney installation, cleaning, suction checks and repair in Perambur and across Chennai, from an authorised Elica service company.' },
  'water-heater':    { title: 'Water Heater Installation & Repair in Chennai | {name}', description: 'Water heater installation, maintenance, heating checks and repair for storage and instant heaters in Perambur and across Chennai.' },
  'kitchen-hob':     { title: 'Kitchen Hob Installation & Repair in Chennai | {name}', description: 'Built in gas hob installation, burner and ignition checks, maintenance and repair in Perambur and across Chennai.' },
};

// Footer "Popular searches" — each links to the most relevant page.
export const POPULAR = [
  ['Chimney service in Chennai', '/services/kitchen-chimney'],
  ['Chimney cleaning in Perambur', '/services/kitchen-chimney'],
  ['Kitchen chimney repair', '/services/kitchen-chimney'],
  ['Kitchen chimney installation', '/services/kitchen-chimney'],
  ['Water heater service in Chennai', '/services/water-heater'],
  ['Water heater repair in Perambur', '/services/water-heater'],
  ['Hob service in Chennai', '/services/kitchen-hob'],
  ['Kitchen hob repair in Perambur', '/services/kitchen-hob'],
  ['Home appliance service in Perambur', '/areas'],
  ['Service pricing', '/pricing'],
];
