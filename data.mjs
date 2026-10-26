// ============================================================================
//  data.mjs — ALL website content lives here (single source of truth).
//  Edit, save, run `npm run build`.
//  Rule for this site: publish only facts the business has confirmed.
//  Values marked // OPTIONAL stay hidden on the site until you fill them in.
// ============================================================================

export const SITE = {
  domain: 'https://siva-swamy-service.com',            // REPLACE with the real domain before publishing (no trailing slash)
  name: 'Siva Swamy Services',
  shortName: 'Siva Swamy',
  description:
    'Siva Swamy Services in Perambur, Chennai installs, maintains and repairs kitchen chimneys, water heaters and kitchen hobs.',
  city: 'Chennai',
  region: 'Tamil Nadu',
  // Official contact details — every link on the site is generated from these.
  phone: '+91 8939115649',                             // shown on the site
  phoneLocal: '8939115649',                            // used for tel: links
  phoneDigits: '918939115649',                         // used for wa.me links
  email: 'sivaswamyservices@gmail.com',
  address: {
    street: 'Old No: 71A, New No: 115, Paddy Fields Road',
    locality: 'Perambur',
    city: 'Chennai',
    postal: '600011',
    country: 'IN',
  },
  googleMapsLink: 'https://www.google.com/maps/place/Siva+Swamy+Services/@13.111493,80.2467114,17z/data=!3m1!4b1!4m6!3m5!1s0x3a5265bc72508091:0x2b9d030f313383b4!8m2!3d13.1114878!4d80.2492863!16s%2Fg%2F11cmtsmds6?authuser=0&entry=ttu&g_ep=EgoyMDI2MTAxNC4wIKXMDSoASAFQAw%3D%3D',
  // OPTIONAL: official embed URL from Google Maps → Share → Embed a map (copy only the src="…" value). Hidden while empty.
  googleMapsEmbed: '',
  // Initial centre of the booking-form map picker only (Perambur area). Not published as the business location.
  mapCenter: { lat: 13.1143, lng: 80.2329 },
  hours: '',                                           // OPTIONAL e.g. 'Mon – Sat, 9:00 AM – 7:00 PM' — hidden while empty
  rating: null,                                        // OPTIONAL real Google rating — hidden while null
  reviewCount: null,                                   // OPTIONAL
  founded: null,                                       // OPTIONAL year — hidden while null
  web3formsKey: 'b9b75138-a34b-47ac-a198-64268ee05a2f',           // REPLACE (free key from web3forms.com, linked to sivaswamyservices@gmail.com)
  themeColor: '#064E50',
  logoFile: 'SSS_logo.png',                            // photos/SSS_logo.png — full logo in footer, menu, loader, link previews
  // Circular emblem for the header badge and favicon: [left, top, width, height] as fractions of the logo image.
  logoMarkCrop: [105 / 674, 21 / 560, 472 / 674, 472 / 560],
  // ---- Google reviews (see GOOGLE-REVIEWS-SETUP.md) ----
  googlePlaceId: '',                                   // REPLACE: your Google Place ID (starts with "ChIJ…"). Enables the "Write a Google Review" button.
  reviewsEndpoint: '/api/reviews',                     // server endpoint that returns Google reviews (Cloudflare Worker or PHP — never put the API key here)
  reviewsRefreshMinutes: 15,                           // how often an open Reviews page checks for new reviews (keep ≥ 10 to respect API quotas)
  social: { instagram: '', facebook: '', youtube: '' }, // OPTIONAL (leave '' to hide)
};

export const PROPRIETOR = {
  name: '',                                            // OPTIONAL owner's name (leave '' to show "Proprietor")
  title: 'Proprietor',
  photo: 'proprietor_image',                           // photos/proprietor_image.png
};

// Short facts shown under the hero. Keep these to things that are simply true.
export const HIGHLIGHTS = [
  'Kitchen chimneys · Water heaters · Hobs',
  'Installation, maintenance and repair',
  'Authorised Elica service company',
  'Based in Perambur, Chennai',
];

// {areas} is replaced with the number of localities listed below.
export const STATS = [
  { value: '3', label: 'Appliance types we specialise in' },
  { value: '{areas}', label: 'Chennai localities we serve' },
  { value: 'Elica', label: 'Authorised service company' },
  { value: 'Perambur', label: 'Our base in Chennai' },
];

export const WHY = [
  { title: 'Three appliances, done well', text: 'We work only on kitchen chimneys, water heaters and hobs, so we know their common faults and fitting needs well.' },
  { title: 'Authorised for Elica', text: 'We are an authorised Elica service company, and we also look after Racold water heaters and Butterfly chimneys.' },
  { title: 'Local to North and West Chennai', text: 'Our base is on Paddy Fields Road, Perambur, and we serve the localities around it.' },
  { title: 'From fitting to repair', text: 'New installations, routine maintenance and repairs for the same appliance, all looked after by one team.' },
  { title: 'We listen before we visit', text: 'Every enquiry starts with a conversation about your appliance and what you need. Then we arrange the visit.' },
  { title: 'Easy to reach', text: 'Call, WhatsApp, email or fill in the enquiry form, whichever is easiest for you.' },
];

export const STEPS = [
  { title: 'Get in touch', text: 'Call us, send a WhatsApp message or fill in the short enquiry form with your appliance and location.' },
  { title: 'Tell us what you need', text: 'We talk through the appliance, its brand and model, and whether you need installation, maintenance or a repair.' },
  { title: 'Confirm the visit', text: 'Once we know we can help at your location, we agree on a time that suits you.' },
];

export const APPROACH = [
  { title: 'Listen first', text: 'Before suggesting any work, we ask about the appliance, its age and what has changed.' },
  { title: 'Explain clearly', text: 'We tell you what we found and what we recommend in plain language, so the decision is yours.' },
  { title: 'Safety first', text: 'Gas and electrical work is always handled by our technicians, never left to guesswork.' },
];

// Brand cards (home page). Logo file: photos/badge-<slug>.png — shown in text until added.
export const BRANDS = [
  { slug: 'elica', name: 'Elica', designation: 'Authorised Expert Service', authorised: true,
    appliances: ['Kitchen chimneys', 'Built in hobs'], services: ['Service', 'Repair', 'Installation'] },
  { slug: 'racold', name: 'Racold', designation: 'Expert Water Heater Service', authorised: false,
    appliances: ['Water heaters'], services: ['Service', 'Repair', 'Installation'] },
  { slug: 'butterfly', name: 'Butterfly', designation: 'Expert Chimney Service', authorised: false,
    appliances: ['Kitchen chimneys'], services: ['Service', 'Repair', 'Installation'] },
];

export const AUTHORISED = {
  brand: 'elica',
  heading: 'ELICA AUTHORISED SERVICE COMPANY',
  text: 'Siva Swamy Services is an authorised Elica service company. We install, service and repair Elica kitchen chimneys, built in hobs and ovens.',
};

// The types of work people can request (used by the enquiry form, pricing and service actions).
export const WORK_TYPES = ['Installation', 'Maintenance', 'Repair'];

// Three service categories. Order and slugs drive menus, pricing, the enquiry form and URLs.
// prices: add a number (₹) to any row once confirmed; null shows "Contact us for service pricing".
export const SERVICES = [
  {
    slug: 'kitchen-chimney', name: 'Kitchen Chimneys', single: 'kitchen chimney', short: 'Chimney', image: 'prod-chimney', icon: 'chimney',
    imageAlt: 'Black wall mounted kitchen chimney with ducting above a glass gas hob in a Chennai kitchen',
    blurb: 'Installation, cleaning, suction checks and repair for wall mounted and island kitchen chimneys.',
    intro: 'A well fitted, well maintained kitchen chimney keeps smoke, oil and cooking smells out of your home. We install new chimneys, clean and maintain existing ones, sort out suction problems and handle repairs for wall mounted, island and cylinder chimneys.',
    offerings: [
      { title: 'Chimney installation', text: 'We fit new wall mounted and island chimneys at the right height above the hob, with a sensible duct route and a suitable power point.', work: 'Installation' },
      { title: 'Cleaning and maintenance', text: 'We clean the filters, blower and hood to clear the grease that slowly reduces suction over time.', work: 'Maintenance' },
      { title: 'Suction and performance checks', text: 'We find out why smoke is not clearing, whether it is blocked filters, a duct problem, a weak motor or the way it was installed.', work: 'Repair' },
      { title: 'Chimney repairs', text: 'Motors, switches, touch panels, lights and auto clean faults. Tell us the brand and model and we will talk you through the repair.', work: 'Repair' },
    ],
    needs: ['Smoke or cooking smells not clearing', 'Motor louder than usual or vibrating', 'Oil dripping from the hood or filters', 'Touch panel, buttons or lights not responding', 'A new chimney to install', 'Island or cylinder chimney due for cleaning'],
    safety: 'Switch the chimney off at the wall before wiping the outside. Leave dismantling, motor and wiring work to a technician.',
    faqs: [
      ['How often should a kitchen chimney be cleaned?', 'It depends on how much you cook and fry. Homes that cook every day often need a professional clean every few months. Your manufacturer\'s manual is the best guide.'],
      ['Do you install chimneys bought online?', 'Yes. Send us the brand and model with a short description of your kitchen, and we will plan the installation with you.'],
      ['Do you work on island and cylinder chimneys?', 'Yes. Ceiling mounted island and cylinder chimneys need different access and mounting from wall models, and we work on both.'],
      ['My auto clean chimney still smells of oil. Why?', 'Auto clean heats the oil collector so the grease can drain, but it does not clean the blower or the duct. Those parts still need a manual clean.'],
      ['Which chimney brands do you service?', 'We are an authorised Elica service company and also service Butterfly chimneys. For any other brand, send us the brand and model and we will let you know.'],
    ],
    pricing: [
      { work: 'Installation', label: 'Chimney installation', price: null },
      { work: 'Maintenance', label: 'Cleaning and maintenance', price: null },
      { work: 'Repair', label: 'Troubleshooting and repair', price: null },
    ],
  },
  {
    slug: 'water-heater', name: 'Water Heaters', single: 'water heater', short: 'Water heater', image: 'prod-water-heater', icon: 'heater',
    imageAlt: 'White wall mounted storage water heater with inlet and outlet pipes in a tiled bathroom',
    blurb: 'Installation, maintenance, heating checks and repair for storage and instant water heaters.',
    intro: 'A water heater that stops heating, leaks or trips the power needs someone who understands both the plumbing and the electrical side. We install new heaters, carry out maintenance, track down heating problems and handle repairs for storage and instant water heaters.',
    offerings: [
      { title: 'Water heater installation', text: 'Wall mounting, inlet and outlet connections and a test run for new storage and instant heaters.', work: 'Installation' },
      { title: 'Water heater maintenance', text: 'We check the heating element, thermostat, safety valve and joints, and descale the tank where hard water has built up.', work: 'Maintenance' },
      { title: 'Heating performance checks', text: 'We find out why the water is not hot enough, takes too long to heat or comes out too hot.', work: 'Repair' },
      { title: 'Water heater repairs', text: 'Element, thermostat, valve and leak problems. Tell us the brand, model and symptoms and we will talk you through the repair.', work: 'Repair' },
    ],
    needs: ['Not heating, or heating very slowly', 'Water too hot or not hot enough', 'Leaking from the tank, valve or pipe joints', 'Trips the MCB or ELCB when switched on', 'Indicator light not working', 'A new water heater to install'],
    safety: 'If a water heater trips the breaker, leaks near the switch or smells of burning, switch it off at the mains and do not use it until it has been checked.',
    faqs: [
      ['Do you work on instant and storage water heaters?', 'Yes. We work on both wall mounted storage heaters and instant heaters.'],
      ['Do you install new water heaters?', 'Yes. Tell us the model and where it will be fitted, and we will plan the installation with you.'],
      ['Which water heater brands do you service?', 'We offer expert service for Racold water heaters. For any other brand, send us the brand and model and we will let you know.'],
      ['My heater trips the breaker. Can I keep using it?', 'No. Switch it off at the mains and leave it off until it has been checked.'],
      ['How often should a water heater be serviced?', 'Follow the interval in your manufacturer\'s manual. Homes with hard water usually need descaling more often.'],
    ],
    pricing: [
      { work: 'Installation', label: 'Water heater installation', price: null },
      { work: 'Maintenance', label: 'Maintenance and descaling', price: null },
      { work: 'Repair', label: 'Troubleshooting and repair', price: null },
    ],
  },
  {
    slug: 'kitchen-hob', name: 'Kitchen Hobs', single: 'kitchen hob', short: 'Hob', image: 'prod-hob', icon: 'hob',
    imageAlt: 'Three burner built in glass gas hob with brass burners set into a kitchen countertop',
    blurb: 'Built in hob installation, burner and ignition checks, maintenance advice and repair.',
    intro: 'A built in gas hob gets used every day, so small problems show up quickly: a yellow flame, an igniter that keeps clicking or a stiff knob. We install hobs, service burners, sort out ignition problems and handle repairs.',
    offerings: [
      { title: 'Hob installation', text: 'We fit the new hob into the countertop opening, connect it and check every burner before handing it over.', work: 'Installation' },
      { title: 'Cleaning and maintenance advice', text: 'Burner servicing, plus simple everyday cleaning tips that keep flames even and ignition reliable.', work: 'Maintenance' },
      { title: 'Burner and ignition checks', text: 'Yellow or uneven flames, burners that will not stay lit and igniters that spark weakly or not at all.', work: 'Repair' },
      { title: 'Hob repairs', text: 'Knobs, valves, ignition parts and glass tops. Tell us the brand and model and we will talk you through the repair.', work: 'Repair' },
    ],
    needs: ['Auto ignition not sparking', 'Yellow or uneven flame', 'Burner goes out when the knob is released', 'Knob stiff or loose', 'Cracked glass top', 'A new built in hob to install'],
    safety: 'If you smell gas, turn off the cylinder or gas supply, open the windows, avoid electrical switches and contact a professional. Never try to repair gas connections yourself.',
    faqs: [
      ['Why is my hob flame yellow?', 'Usually it is blocked burner ports or a burner cap that is not sitting correctly. If cleaning the caps does not help, have it checked.'],
      ['Do you install built in hobs?', 'Yes. Tell us the model and your countertop details, and we will plan the installation with you.'],
      ['Which hob brands do you service?', 'We are an authorised Elica service company for built in hobs. For any other brand, send us the brand and model and we will let you know.'],
      ['Is a gas smell an emergency?', 'Yes, treat it as one. Turn off the gas supply, open the windows, avoid switches and flames, and contact a professional.'],
      ['Can a cracked glass top be replaced?', 'Often, yes, depending on whether parts are available for your model. Send us the brand and model and we will check.'],
    ],
    pricing: [
      { work: 'Installation', label: 'Hob installation', price: null },
      { work: 'Maintenance', label: 'Burner servicing and maintenance', price: null },
      { work: 'Repair', label: 'Troubleshooting and repair', price: null },
    ],
  },
];

export const HOME_FAQS = [
  ['How do I book a service?', 'Fill in the enquiry form, send us a WhatsApp message or call +91 8939115649. We will talk through what you need and confirm a visit with you.'],
  ['Is my visit confirmed when I send the form?', 'Not yet. The form sends us your details. We then contact you to check availability at your location and agree on a time.'],
  ['Which appliances do you work on?', 'Kitchen chimneys (wall mounted, island and cylinder), water heaters (storage and instant) and built in kitchen hobs.'],
  ['Do you service all brands?', 'We are an authorised Elica service company and also service Racold water heaters and Butterfly chimneys. For other brands, send us the brand and model and we will let you know.'],
  ['What should I share when I get in touch?', 'The appliance, its brand and model if you know them, what is wrong or what you need, and your location. A photo on WhatsApp helps too.'],
  ['How much does a service cost?', 'It depends on the appliance, the model and the work involved. Send us the details and we will discuss the price with you.'],
];

export const PRICING_FAQS = [
  ['How is the price decided?', 'It depends on the appliance, its brand and model, and whether you need installation, maintenance or a repair. Share these details and we will go through the cost with you.'],
  ['What details help you give a price?', 'The appliance type, brand and model, what is wrong or what you need, your location and, if possible, a photo on WhatsApp.'],
];

// ---------------------------------------------------------------------------
// Service areas — supplied by the business. SUPPLIED_AREAS keeps the original list
// (47 entries, including repeats) paired with the display name; AREA_GROUPS shows each once.
// The build stops if any supplied area is missing from the groups.
// ---------------------------------------------------------------------------
export const SUPPLIED_AREAS = [
  ['Seven Wells', 'Seven Wells'], ['Park Town', 'Park Town'], ['Vepery', 'Vepery'], ['Kilpauk', 'Kilpauk'],
  ['Perambur', 'Perambur'], ['Pulianthope', 'Pulianthope'], ['Rayapuram Market', 'Royapuram Market'],
  ['Tiruvottiyur', 'Tiruvottiyur'], ['Washermanpetta', 'Washermanpet'], ['Ayanavaram', 'Ayanavaram'],
  ['Aminijikarai', 'Aminjikarai'], ['Shenoynagar', 'Shenoy Nagar'], ['Mogapair', 'Mogappair'],
  ['I C F Colony', 'ICF Colony'], ['Vyasarpady', 'Vyasarpadi'], ['Annanagar', 'Anna Nagar'],
  ['Villivakkam', 'Villivakkam'], ['Padi', 'Padi'], ['Madhavaram Milk Colony', 'Madhavaram Milk Colony'],
  ['Redhills', 'Red Hills'], ['Ambattur H O', 'Ambattur'], ['Avadi', 'Avadi'], ['Avadi Iaf', 'Avadi IAF'],
  ['Ennur R S', 'Ennore RS'], ['Ambattur Industrial Estat', 'Ambattur Industrial Estate'], ['Madhavaram', 'Madhavaram'],
  ['Thirumullaivayal', 'Thirumullaivoyal'], ['Kadirvedu', 'Kadirvedu'], ['Manali Madras', 'Manali'],
  ['Avadi', 'Avadi'], ['Korattur R S', 'Korattur RS'], ['Sowcarpet', 'Sowcarpet'], ['Korattur', 'Korattur'],
  ['Tiruvattur', 'Tiruvattur'], ['Agaram', 'Agaram'], ['Purasawakkam', 'Purasawalkam'], ['Sidco Estate', 'SIDCO Estate'],
  ['Kolathur-Cpt', 'Kolathur'], ['Annanagar Western Extn', 'Anna Nagar Western Extension'], ['Annanagar East', 'Anna Nagar East'],
  ['Broadway', 'Broadway'], ['Ponniammanmedu', 'Ponniammanmedu'], ['Choolai', 'Choolai'], ['Kodungayur', 'Kodungaiyur'],
  ['Avadi', 'Avadi'], ['Avadi Iaf', 'Avadi IAF'], ['Railway Car Shed Complex', 'Railway Car Shed Complex'],
];

export const AREA_GROUPS = [
  { name: 'North Chennai', areas: ['Perambur', 'Agaram', 'Vyasarpadi', 'ICF Colony', 'Royapuram Market', 'Washermanpet', 'Tiruvottiyur', 'Tiruvattur', 'Ennore RS', 'Kodungaiyur', 'Kolathur', 'Ponniammanmedu', 'Madhavaram', 'Madhavaram Milk Colony', 'Manali', 'Kadirvedu', 'Red Hills'] },
  { name: 'Central Chennai', areas: ['Park Town', 'Broadway', 'Sowcarpet', 'Seven Wells', 'Vepery', 'Choolai', 'Purasawalkam', 'Kilpauk', 'Pulianthope', 'Aminjikarai', 'Shenoy Nagar', 'Ayanavaram'] },
  { name: 'West Chennai', areas: ['Anna Nagar', 'Anna Nagar East', 'Anna Nagar Western Extension', 'Villivakkam', 'Mogappair', 'Padi', 'Korattur', 'Korattur RS', 'SIDCO Estate', 'Ambattur', 'Ambattur Industrial Estate', 'Thirumullaivoyal', 'Avadi', 'Avadi IAF', 'Railway Car Shed Complex'] },
];

// Genuine customer reviews you have permission to publish (optional, shown alongside Google reviews).
export const REVIEWS = [
  // { name: 'First name + initial', area: 'Perambur', appliance: 'Kitchen Chimneys', text: '…' },
];

// ---------------------------------------------------------------------------
// Gallery — real photos supplied by the business.
// cat  = service slug (drives the Chimney / Water Heater / Hob filters)
// work = 'Installation' or 'Maintenance & Repair' (drives those two filters)
//        These were assigned from what each photo shows — please check and correct.
// size = layout tile: 'feature' (2×2), 'wide' (2×1), 'tall' (1×2) or 'small' (1×1)
// ---------------------------------------------------------------------------
export const GALLERY = [
  { file: 'gallery-chimney-01', cat: 'kitchen-chimney', work: 'Installation', size: 'feature', title: 'Kitchen chimney installation', desc: 'A curved glass wall chimney fitted above a three burner hob, with the duct hidden behind the hood.' },
  { file: 'gallery-water-heater-01', cat: 'water-heater', work: 'Installation', size: 'tall', title: 'Water heater installation', desc: 'A wall mounted storage water heater with inlet and outlet connections in a tiled bathroom.' },
  { file: 'gallery-hob-01', cat: 'kitchen-hob', work: 'Installation', size: 'small', title: 'Built in hob installation', desc: 'A three burner glass hob set neatly into the countertop.' },
  { file: 'gallery-chimney-island-01', cat: 'kitchen-chimney', work: 'Installation', size: 'tall', title: 'Island chimney installation', desc: 'Twin cylindrical island chimneys suspended from the ceiling above a kitchen island.' },
  { file: 'gallery-hob-02', cat: 'kitchen-hob', work: 'Maintenance & Repair', size: 'wide', title: 'Hob maintenance', desc: 'A four burner built in hob with brass burners, ready for burner servicing.' },
  { file: 'gallery-chimney-02', cat: 'kitchen-chimney', work: 'Installation', size: 'small', title: 'Chimney and duct fitting', desc: 'A wall chimney with aluminium ducting routed out of the kitchen above a glass hob.' },
  { file: 'gallery-water-heater-05', cat: 'water-heater', work: 'Installation', size: 'wide', title: 'Horizontal water heater fitting', desc: 'A horizontal storage water heater mounted beside a window.' },
  { file: 'gallery-chimney-03', cat: 'kitchen-chimney', work: 'Maintenance & Repair', size: 'small', title: 'Chimney servicing', desc: 'An angled black glass chimney with flexible ducting in a working kitchen.' },
  { file: 'gallery-water-heater-02', cat: 'water-heater', work: 'Maintenance & Repair', size: 'tall', title: 'Water heater servicing', desc: 'A compact water heater with its inlet, outlet and safety valve connections.' },
  { file: 'gallery-chimney-island-02', cat: 'kitchen-chimney', work: 'Installation', size: 'feature', title: 'Cylinder chimney installation', desc: 'A black cylinder chimney against a stone finish wall.' },
  { file: 'gallery-hob-03', cat: 'kitchen-hob', work: 'Maintenance & Repair', size: 'small', title: 'Burner and ignition check', desc: 'A four burner hob with brass burners and front controls.' },
  { file: 'gallery-chimney-04', cat: 'kitchen-chimney', work: 'Installation', size: 'small', title: 'Wall chimney fitting', desc: 'A curved glass chimney with flexible ducting on a marble finish wall.' },
  { file: 'gallery-water-heater-03', cat: 'water-heater', work: 'Maintenance & Repair', size: 'small', title: 'Water heater check', desc: 'A storage water heater and its pipe connections in a bathroom.' },
  { file: 'gallery-chimney-05', cat: 'kitchen-chimney', work: 'Installation', size: 'wide', title: 'Angled chimney installation', desc: 'A wide angled chimney with ducting, mounted above a kitchen window.' },
  { file: 'gallery-hob-06', cat: 'kitchen-hob', work: 'Installation', size: 'wide', title: 'New hobs for installation', desc: 'New built in hobs, still in protective packing, ready to be fitted.' },
  { file: 'gallery-chimney-island-03', cat: 'kitchen-chimney', work: 'Installation', size: 'tall', title: 'Ceiling mounted chimney', desc: 'A ceiling mounted island chimney in a kitchen with large windows.' },
  { file: 'gallery-water-heater-06', cat: 'water-heater', work: 'Installation', size: 'wide', title: 'Water heater on a ceiling frame', desc: 'A horizontal water heater mounted on a frame in a utility area.' },
  { file: 'gallery-chimney-06', cat: 'kitchen-chimney', work: 'Maintenance & Repair', size: 'small', title: 'Chimney touch panel check', desc: 'A curved glass chimney with touch controls in an everyday home kitchen.' },
  { file: 'gallery-hob-04', cat: 'kitchen-hob', work: 'Maintenance & Repair', size: 'small', title: 'Hob burner servicing', desc: 'A four burner hob on a granite countertop.' },
  { file: 'gallery-water-heater-04', cat: 'water-heater', work: 'Maintenance & Repair', size: 'small', title: 'Water heater maintenance', desc: 'A water heater on a tiled wall with its supply lines.' },
  { file: 'gallery-chimney-07', cat: 'kitchen-chimney', work: 'Installation', size: 'small', title: 'Compact chimney fitting', desc: 'A compact wall chimney mounted above a window grille.' },
  { file: 'gallery-hob-05', cat: 'kitchen-hob', work: 'Maintenance & Repair', size: 'wide', title: 'Hob troubleshooting', desc: 'A three burner hob in a busy, everyday kitchen.' },
  { file: 'gallery-chimney-08', cat: 'kitchen-chimney', work: 'Installation', size: 'wide', title: 'Chimney between wall cabinets', desc: 'An angled chimney fitted between glass fronted wall cabinets.' },
  { file: 'gallery-water-heater-07', cat: 'water-heater', work: 'Installation', size: 'tall', title: 'Bathroom water heater', desc: 'A water heater in a dark tiled bathroom with neat wiring.' },
  { file: 'gallery-chimney-09', cat: 'kitchen-chimney', work: 'Installation', size: 'wide', title: 'Chimney in a compact kitchen', desc: 'An angled chimney fitted in a compact kitchen.' },
  { file: 'gallery-water-heater-08', cat: 'water-heater', work: 'Installation', size: 'wide', title: 'Utility area water heater', desc: 'A horizontal water heater mounted on a frame in a utility area.' },
  { file: 'gallery-chimney-10', cat: 'kitchen-chimney', work: 'Installation', size: 'small', title: 'Wall chimney on tiles', desc: 'A curved glass chimney on a tiled kitchen wall.' },
];

// ---------------------------------------------------------------------------
// Blog. Body blocks: ['p', text] ['h2', text] ['ul', [items]] ['related', serviceSlug]
// ---------------------------------------------------------------------------
export const BLOG = [
  {
    slug: 'how-often-to-clean-kitchen-chimney', category: 'kitchen-chimney', date: '2026-09-02',
    title: 'How often should you clean a kitchen chimney?',
    excerpt: 'What affects how quickly a chimney clogs, the signs it is overdue, and why auto clean alone is not enough.',
    image: 'gallery-chimney-04', imageAlt: 'Curved glass kitchen chimney with flexible ducting',
    body: [
      ['p', 'There is no single answer. It depends on what you cook and how often. Daily cooking with plenty of frying and tempering clogs a chimney much faster than light cooking a few times a week.'],
      ['h2', 'What affects the cleaning interval'],
      ['ul', ['How often you cook, and how much oil you use', 'The filter type, since baffle filters handle grease differently from mesh filters', 'How long the chimney runs after cooking', 'Your manufacturer\'s recommended interval']],
      ['h2', 'Signs it is overdue'],
      ['ul', ['Smoke or smells linger after cooking', 'The motor sounds louder than usual', 'Oil drips from the filter edges', 'Filters stay dark even after washing']],
      ['h2', 'Why auto clean is not enough'],
      ['p', 'Auto clean heats the oil collector so the grease drains into a cup. It does not reach the blower wheel or the duct, where much of the buildup sits. Those parts need a professional clean.'],
      ['p', 'Between professional cleans, you can safely wash the removable filters as your manual describes. Just make sure the chimney is switched off at the wall first.'],
      ['related', 'kitchen-chimney'],
    ],
  },
  {
    slug: 'water-heater-not-heating-reasons', category: 'water-heater', date: '2026-09-14',
    title: 'Common reasons a water heater stops heating',
    excerpt: 'The usual causes behind cold or lukewarm water, the simple things you can check safely, and when to call a professional.',
    image: 'gallery-water-heater-03', imageAlt: 'Storage water heater mounted on a bathroom wall',
    body: [
      ['p', 'When a water heater stops heating, the cause is usually one of a handful of things. Some are simple to check. Others involve live electrical parts and need a technician.'],
      ['h2', 'Safe things to check first'],
      ['ul', ['The wall switch is on and the indicator light is lit', 'The temperature knob has not been turned down', 'You have allowed enough time for a full tank to heat']],
      ['h2', 'Common causes that need a technician'],
      ['ul', ['A failed heating element', 'A faulty thermostat or thermal cutoff', 'Heavy scale buildup from hard water', 'A wiring or connection fault']],
      ['p', 'If the heater trips the MCB or ELCB, do not keep resetting it. Switch it off at the mains and have it checked. Repeated tripping can point to a fault that makes the heater unsafe to use.'],
      ['related', 'water-heater'],
    ],
  },
  {
    slug: 'kitchen-hob-signs-professional-attention', category: 'kitchen-hob', date: '2026-09-26',
    title: 'Signs your kitchen hob needs professional attention',
    excerpt: 'Some hob problems are fixed by cleaning; others mean it is time to call a technician. Here is how to tell the difference.',
    image: 'gallery-hob-01', imageAlt: 'Three burner built in glass gas hob',
    body: [
      ['p', 'Built in hobs are easy to live with, but a few warning signs should never be ignored.'],
      ['h2', 'Often fixed by cleaning'],
      ['p', 'With the gas off and the hob cool, lift off the burner caps, wash them in warm soapy water, dry them fully and refit them so they sit flat. This often restores an even, blue flame.'],
      ['h2', 'Signs it needs a technician'],
      ['ul', ['The flame stays yellow or uneven after cleaning', 'The igniter clicks but does not light, or does not spark at all', 'A burner goes out when you release the knob', 'A knob is very stiff or turns too freely', 'The glass top is cracked']],
      ['h2', 'If you smell gas'],
      ['p', 'Turn off the gas supply, open the windows, avoid electrical switches and naked flames, and contact a professional. Never try to repair gas connections yourself.'],
      ['related', 'kitchen-hob'],
    ],
  },
  {
    slug: 'before-installing-kitchen-chimney', category: 'kitchen-chimney', date: '2026-10-03',
    title: 'What to consider before installing a kitchen chimney',
    excerpt: 'Size, duct route, mounting height and power supply: the questions to settle before a new chimney goes up.',
    image: 'gallery-chimney-01', imageAlt: 'Curved glass kitchen chimney above a three burner hob',
    body: [
      ['p', 'A chimney works best when it suits your hob and kitchen layout. A few decisions made before installation make a big difference to how well it performs.'],
      ['h2', 'Questions to settle first'],
      ['ul', ['Is the chimney at least as wide as your hob?', 'Will it be wall mounted or an island model?', 'Where will the duct exit, and how many bends will it need?', 'Is there a suitable power point near the mounting position?', 'What mounting height does the manufacturer recommend?']],
      ['h2', 'Why the duct matters'],
      ['p', 'A long duct with many bends reduces suction. A shorter, straighter route to the outside generally performs better.'],
      ['p', 'Share the model and a photo of your kitchen when you enquire, and we can talk through these points before the visit.'],
      ['related', 'kitchen-chimney'],
    ],
  },
  {
    slug: 'water-heater-problems-professional-attention', category: 'water-heater', date: '2026-10-08',
    title: 'Water heater problems that need professional attention',
    excerpt: 'Leaks, tripping, burning smells and discoloured water: the warning signs that mean you should switch off and call for help.',
    image: 'gallery-water-heater-02', imageAlt: 'Compact white water heater mounted on a bathroom wall',
    body: [
      ['p', 'Water heaters combine water and electricity, so some problems should always be handled by a professional.'],
      ['h2', 'Switch off and call if you notice'],
      ['ul', ['The heater trips the MCB or ELCB', 'Water leaking from the tank, valve or joints', 'A burning smell, scorch marks or a hot switch', 'Rusty or discoloured hot water', 'Rumbling or popping noises while heating']],
      ['h2', 'Everyday habits that help'],
      ['ul', ['Switch the heater off when it is not needed', 'Keep the area around it dry', 'Do not cover the heater or hang clothes on it', 'Follow the service interval in your manual']],
      ['related', 'water-heater'],
    ],
  },
  {
    slug: 'when-to-call-professional-chimney-servicing', category: 'kitchen-chimney', date: '2026-10-12',
    title: 'When should you contact a professional for chimney servicing?',
    excerpt: 'What you can safely do yourself, and the jobs that are best left to a technician.',
    image: 'gallery-chimney-03', imageAlt: 'Angled black glass kitchen chimney with flexible duct',
    body: [
      ['p', 'Regular filter washing keeps a chimney working well between services. Some jobs, though, need a technician.'],
      ['h2', 'What you can usually do'],
      ['ul', ['Wash removable filters as described in your manual', 'Wipe the outside of the hood with the chimney switched off', 'Empty the oil collector if your model has one']],
      ['h2', 'When to call a professional'],
      ['ul', ['Suction stays weak after the filters are cleaned', 'The motor is noisy, vibrates or stops', 'The touch panel, lights or auto clean stop working', 'Grease has built up inside the hood and blower', 'You are installing or moving a chimney']],
      ['related', 'kitchen-chimney'],
    ],
  },
  {
    slug: 'home-appliance-maintenance-tips', category: '', date: '2026-10-15',
    title: 'Basic maintenance tips for your kitchen and bathroom appliances',
    excerpt: 'Simple, safe habits that help your chimney, water heater and hob work better for longer.',
    image: 'gallery-chimney-06', imageAlt: 'Kitchen chimney with touch controls in a home kitchen',
    body: [
      ['p', 'A little routine care goes a long way. These habits are safe for most households, but always check your appliance manual first.'],
      ['h2', 'Kitchen chimney'],
      ['ul', ['Run the chimney while cooking and for a few minutes after', 'Wash removable filters regularly, with the power off', 'Book a professional clean when suction drops']],
      ['h2', 'Water heater'],
      ['ul', ['Switch it off when not needed', 'Keep the area dry and uncovered', 'Watch for leaks, tripping or discoloured water']],
      ['h2', 'Kitchen hob'],
      ['ul', ['Wipe spills once the hob has cooled', 'Keep burner caps clean and correctly seated', 'Turn off the gas supply when the hob is not in use for long periods']],
      ['p', 'For anything involving gas connections or live electrical parts, contact a professional.'],
    ],
  },
];

// ---------------------------------------------------------------------------
// SAMPLE REVIEWS — design and testing only. NOT real customers (names and text are invented).
// Included ONLY in the preview build (`npm run build:preview`), where every card is labelled
// "Sample" and the whole site is marked noindex. `npm run build` (production) never includes them.
// To remove them entirely, empty this array.
// ---------------------------------------------------------------------------
export const SAMPLE_REVIEWS = [
  { id: 'sample-1', name: 'Deepa M.', area: 'Kolathur', rating: 5, date: '2026-10-09', category: 'kitchen-chimney', work: 'Installation',
    text: 'We bought a new chimney online and were unsure about the duct route. The technician suggested a shorter path through the window wall and the suction is noticeably better than our old one.' },
  { id: 'sample-2', name: 'Senthil K.', area: 'Anna Nagar', rating: 5, date: '2026-10-04', category: 'water-heater', work: 'Repair',
    text: 'Our water heater kept tripping the breaker every morning. The heating element had failed. It was replaced in one visit and he showed us the burnt part before fitting the new one.' },
  { id: 'sample-3', name: 'Farzana B.', area: 'Perambur', rating: 5, date: '2026-09-27', category: 'kitchen-hob', work: 'Service',
    text: 'Two burners had a weak yellow flame. After servicing, all three burn evenly again. We also got simple tips on cleaning the burner caps without damaging them.' },
  { id: 'sample-4', name: 'Ramesh V.', area: 'Ambattur', rating: 4, date: '2026-09-20', category: 'kitchen-hood', work: 'Installation',
    text: 'Installing an island hood above our counter needed careful ceiling work. It took a little longer than planned, but the mounting is solid and the finish is neat.' },
  { id: 'sample-5', name: 'Kavitha S.', area: 'Vepery', rating: 5, date: '2026-09-12', category: 'kitchen-chimney', work: 'Service',
    text: 'Smoke used to hang in the kitchen even with the chimney on. A full deep clean of the filters and blower fixed it. The area around the stove was wiped clean afterwards.' },
  { id: 'sample-6', name: 'Joseph A.', area: 'Villivakkam', rating: 5, date: '2026-09-05', category: 'water-heater', work: 'Installation',
    text: 'They mounted our new storage heater, checked the inlet and outlet connections for leaks, and explained the temperature setting before leaving. Clear communication throughout.' },
  { id: 'sample-7', name: 'Nandhini R.', area: 'Madhavaram', rating: 4, date: '2026-08-29', category: 'kitchen-hob', work: 'Repair',
    text: 'The auto ignition on our glass hob had stopped sparking. The igniter was replaced and every burner tested. Booking on WhatsApp was quick and easy.' },
  { id: 'sample-8', name: 'Mohan P.', area: 'Kilpauk', rating: 5, date: '2026-08-21', category: 'kitchen-hood', work: 'Repair',
    text: 'The lights and touch panel on our cylinder hood stopped responding. A loose connector was found, the panel was reset, and everything has worked properly since.' },
];

export const SAMPLE_REVIEW_GRID = [
  { name: 'Lakshmi R.', rating: 5, topic: 'Kitchen chimney',
    text: 'The technician arrived on time, removed the filters and cleaned the blower thoroughly. Our kitchen no longer smells of oil after frying.' },
  { name: 'Arun P.', rating: 5, topic: 'Water heater',
    text: 'The heater was giving only lukewarm water. He found a faulty thermostat, replaced it the same day and checked the earthing before leaving.' },
  { name: 'Meena S.', rating: 5, topic: 'Kitchen hob',
    text: 'One burner would not light at all. After servicing, every burner sparks first time and the flame is a steady blue again.' },
  { name: 'Karthik V.', rating: 4, topic: 'Customer support',
    text: 'I sent photos of my chimney on WhatsApp and got a clear reply within the hour. The visit time was confirmed the evening before.' },
  { name: 'Priya N.', rating: 5, topic: 'Kitchen chimney',
    text: 'Our new auto-clean chimney was fitted neatly with a short duct line. He showed us how to use the oil collector and the clean mode.' },
  { name: 'Suresh G.', rating: 5, topic: 'Water heater',
    text: 'A water leak near the inlet turned out to be a worn valve. The replacement was quick and the bathroom wall was left dry and clean.' },
  { name: 'Anitha K.', rating: 4, topic: 'Kitchen hob',
    text: 'The glass top hob had weak burners. The jets were cleaned and the gas line was checked for leaks. A small fault, explained simply.' },
  { name: 'Vignesh M.', rating: 5, topic: 'Customer support',
    text: 'Polite on the phone and honest about the charges up front. When I had a follow-up question, they called back the same day.' },
];
