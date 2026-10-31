import { ProductDetail, ShopProduct } from '@/types/product';
import { MOCK_SHOP_PRODUCTS } from '@/data/shopCatalog';

/**
 * Detailed mock product specifications and demonstration review data for the Product Detail Page.
 *
 * NOTE ON DATA INTEGRITY:
 * - Product images strictly match verified assets belonging to each product.
 * - Ratings, reviews, and stock figures are prototype demonstration content for UI testing.
 * - Presentation components consume this data via props to ensure seamless future API transition.
 */
export const PRODUCT_DETAILS_MAP: Record<string, ProductDetail> = {
  'alpha-2-person-tent': {
    id: 'prod-alpha-2p-tent',
    name: 'Alpha 2-person Tent',
    slug: 'alpha-2-person-tent',
    priceInCents: 32900,
    imageUrl: '/images/shop/alpha-2-person-tent.jpg',
    imageAlt: 'Alpha 2-person Tent pitched in an alpine mountain meadow',
    category: 'Tents & Shelters',
    specs: '3-season protection · 2.4 kg',
    badge: 'BEST SELLER',
    rating: 4.0,
    reviewCount: 123,
    colorSwatches: ['#556b2f', '#d2b48c'],
    colorCount: 2,
    activity: ['Camping', 'Backpacking'],
    features: ['Lightweight', 'Water-resistant'],
    inStock: true,
    sku: 'ALT-ALP2-OLV',
    subtitle: 'Your home beyond the trailhead',
    shortDescription:
      'Your home beyond the trailhead. A dependable shelter for two, with 3-season protection and a trail-ready 2.4 kg packed weight.',
    colors: [
      { name: 'Olive', hex: '#556b2f' },
      { name: 'Sand', hex: '#d2b48c' },
    ],
    capacityOptions: ['2 person'],
    quickMetrics: [
      { label: 'People', value: '2' },
      { label: 'Protection', value: '3-season' },
      { label: 'Packed weight', value: '2.4 kg' },
    ],
    narrativeBanner: {
      kicker: 'MAKE ROOM FOR ADVENTURE',
      title: 'A home wherever the trail ends.',
      description:
        'From forest weekends to high-country mornings. Pack a little comfort for the places that feel a world away.',
      imageSrc: '/images/shop/shop-hero-panorama.jpg',
      imageAlt: 'Mountain ridge view with campsite during sunrise',
    },
    narrativeTitle: 'Meet your next basecamp.',
    narrativeParagraphs: [
      'The Alpha pairs dependable 3-season shelter with a compact, easy-to-carry design. Its two-person interior has space to stretch out after a long day, while a protective rainfly and front vestibule keep your sleep space separate from the elements.',
      'Built for camping and weekend backpacking in spring, summer and fall. Not intended for heavy snow or extreme alpine conditions.',
    ],
    thoughtfulFeatures: [
      {
        title: 'Ready for changing skies',
        description: 'Seam-taped rainfly and a raised bathtub floor help keep passing showers outside.',
        icon: 'cloud-rain',
      },
      {
        title: 'A little more breathing room',
        description: 'Mesh inner panels and adjustable fly vents encourage airflow through the night.',
        icon: 'wind',
      },
      {
        title: 'Simple from the first pitch',
        description: 'Color-coded aluminum poles and clip attachments make camp setup straightforward.',
        icon: 'tent',
      },
      {
        title: 'Space for you and your gear',
        description: 'A front vestibule shelters muddy boots; interior pockets keep essentials close.',
        icon: 'backpack',
      },
    ],
    specifications: [
      { label: 'Capacity', value: '2 people' },
      { label: 'Seasons', value: '3-season' },
      { label: 'Packed weight', value: '2.4 kg' },
      { label: 'Floor dimensions', value: '220 × 135 cm' },
      { label: 'Peak height', value: '110 cm' },
      { label: 'Packed size', value: '45 × 17 cm' },
      { label: 'Rainfly', value: '68D polyester · 3,000 mm PU' },
      { label: 'Floor', value: '150D polyester · 5,000 mm PU' },
      { label: 'Poles', value: '8.5 mm aluminum' },
      { label: 'Doors / vestibules', value: '1 / 1' },
    ],
    inTheBag:
      'Tent body, rainfly, pole set, 12 stakes, guylines, repair sleeve and carry bag. Footprint sold separately.',
    reviewsSummary: {
      averageRating: 4.0,
      totalReviews: 123,
      ratingDistribution: [
        { stars: 5, count: 40, percentage: 45 },
        { stars: 4, count: 55, percentage: 60 },
        { stars: 3, count: 20, percentage: 25 },
        { stars: 2, count: 4, percentage: 5 },
        { stars: 1, count: 4, percentage: 5 },
      ],
    },
    sampleReviews: [
      {
        id: 'rev-alpha-1',
        author: 'Jamie R.',
        date: 'October 12, 2026',
        rating: 5,
        title: 'A comfortable home for the weekend',
        content:
          'The color-coded poles made our first pitch easy. There was enough room for two sleeping pads, and the vestibule kept our boots out of the sleeping area. A solid choice for relaxed weekend trips.',
        helpfulCount: 12,
      },
      {
        id: 'rev-alpha-2',
        author: 'Alex M.',
        date: 'October 6, 2026',
        rating: 4,
        title: 'Reliable shelter, a little bulky to pack',
        content:
          'The fly handled an overnight shower well and the inner stayed dry. I liked the pockets and headroom. It takes up a bit more pack space than my solo tent, but sharing the weight worked well.',
        helpfulCount: 8,
      },
      {
        id: 'rev-alpha-3',
        author: 'Morgan L.',
        date: 'September 28, 2026',
        rating: 3,
        title: 'Good space, take time with the vents',
        content:
          'Easy to set up and comfortable inside. On a still, damp night we noticed condensation with the vents closed. Opening them helped. I would use it again for summer camping rather than exposed sites.',
        helpfulCount: 5,
      },
    ],
  },

  'trail-45l-backpack': {
    id: 'prod-trail-45l-backpack',
    name: 'Trail 45L Backpack',
    slug: 'trail-45l-backpack',
    priceInCents: 19900,
    imageUrl: '/images/shop/trail-45l-backpack.jpg',
    imageAlt: 'Trail 45L technical backpack with ergonomic suspension',
    category: 'Backpacks',
    specs: '45L capacity · Rain cover included',
    badge: 'BEST SELLER',
    rating: 4.8,
    reviewCount: 90,
    colorSwatches: ['#0f172a', '#ea580c', '#5d6756'],
    colorCount: 3,
    activity: ['Hiking & trekking', 'Backpacking'],
    features: ['Lightweight', 'Water-resistant', 'Packable'],
    inStock: true,
    sku: 'ALT-BP45-SLT',
    subtitle: 'Balanced weight distribution for long miles',
    shortDescription:
      'Engineered for weekend ascents and extended trail traverses. The Trail 45L combines an internal alloy stay with ergonomic dual-density shoulder harness.',
    colors: [
      { name: 'Midnight', hex: '#0f172a' },
      { name: 'Rust', hex: '#ea580c' },
      { name: 'Sage', hex: '#5d6756' },
    ],
    capacityOptions: ['45 Liters'],
    quickMetrics: [
      { label: 'Volume', value: '45L' },
      { label: 'Fit range', value: '16–21 in' },
      { label: 'Weight', value: '1.35 kg' },
    ],
    narrativeBanner: {
      kicker: 'CARRY WITH CONFIDENCE',
      title: 'Comfort across every elevation change.',
      description:
        'Designed to sit close and steady against your back, keeping heavy loads stable over rough switchbacks and river crossings.',
      imageSrc: '/images/shop/shop-hero-panorama.jpg',
      imageAlt: 'Alpine trail ridge panorama',
    },
    narrativeTitle: 'Purpose-built for the backcountry.',
    narrativeParagraphs: [
      'The Trail 45L delivers comfortable load transfer through a breathable 3D foam backpanel and contoured hipbelt.',
      'Integrated water bladder sleeve, dual trekking pole attachments, and a quick-access front shove-it pocket give you flexible gear organization on the move.',
    ],
    thoughtfulFeatures: [
      {
        title: 'Integrated storm cover',
        description: 'Tucked away in a dedicated zippered base pocket, ready to deploy in seconds when rain sets in.',
        icon: 'cloud-rain',
      },
      {
        title: 'Breathable tensioned backpanel',
        description: 'Continuous airflow channel keeps heat building to a minimum along technical steep climbs.',
        icon: 'wind',
      },
      {
        title: 'Direct load transfer harness',
        description: 'Internal perimeter aluminum frame channels pack weight directly to your hips.',
        icon: 'backpack',
      },
      {
        title: 'Hydration compatible',
        description: 'Internal reservoir sleeve with dual ambidextrous hose routing ports for hands-free drinking.',
        icon: 'tent',
      },
    ],
    specifications: [
      { label: 'Capacity', value: '45 Liters' },
      { label: 'Weight', value: '1.35 kg' },
      { label: 'Torso fit', value: '16–21 inches (40–53 cm)' },
      { label: 'Primary fabric', value: '210D Ripstop High-Tenacity Nylon' },
      { label: 'Base fabric', value: '420D Ballistic Nylon' },
      { label: 'Rain cover', value: 'Included (Hi-vis waterproof 70D)' },
      { label: 'Frame type', value: 'Internal perimeter alloy stay' },
      { label: 'Pockets', value: '2 side stretch, 2 hipbelt, 1 top lid, 1 front stash' },
    ],
    inTheBag: 'Backpack body, detachable top lid, integrated rain cover.',
    reviewsSummary: {
      averageRating: 4.8,
      totalReviews: 90,
      ratingDistribution: [
        { stars: 5, count: 72, percentage: 80 },
        { stars: 4, count: 14, percentage: 15 },
        { stars: 3, count: 3, percentage: 3 },
        { stars: 2, count: 1, percentage: 1 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    },
    sampleReviews: [
      {
        id: 'rev-bp-1',
        author: 'Daniel K.',
        date: 'October 18, 2026',
        rating: 5,
        title: 'Carries 30 lbs like a feather',
        content:
          'Spent 3 days in the High Cascades with this pack. The hip belt cushions nicely without digging into hip bones. The side bottle pockets are actually reachable without taking the pack off.',
        helpfulCount: 15,
      },
    ],
  },

  'summit-sleeping-bag': {
    id: 'prod-summit-sleeping-bag',
    name: 'Summit Sleeping bag',
    slug: 'summit-sleeping-bag',
    priceInCents: 13900,
    imageUrl: '/images/shop/summit-sleeping-bag.jpg',
    imageAlt: 'Summit warm mummy sleeping bag with comfort hood',
    category: 'Sleeping gear',
    specs: 'Warm to 0°C · Packable comfort',
    rating: 4.3,
    reviewCount: 32,
    colorSwatches: ['#8c674c', '#3f3b39'],
    colorCount: 2,
    activity: ['Camping', 'Backpacking'],
    features: ['Packable', 'Lightweight'],
    inStock: true,
    sku: 'ALT-SB00-BRN',
    subtitle: 'Warm insulation down to freezing point',
    shortDescription:
      'Warm mummy silhouette tailored for cool alpine nights down to 0°C (32°F). Features hydrophobic synthetic fill that retains loft even in high dampness.',
    colors: [
      { name: 'Earth', hex: '#8c674c' },
      { name: 'Charcoal', hex: '#3f3b39' },
    ],
    capacityOptions: ['Regular (up to 6ft)', 'Long (up to 6ft 6in)'],
    quickMetrics: [
      { label: 'Rating', value: '0°C / 32°F' },
      { label: 'Weight', value: '1.18 kg' },
      { label: 'Shape', value: 'Mummy' },
    ],
    narrativeBanner: {
      kicker: 'SLEEP RESTORED',
      title: 'Rest deep under canopy or stars.',
      description:
        'A draft collar and contoured hood seal in body heat, so you wake up warm and ready for the early morning summit push.',
      imageSrc: '/images/shop/shop-hero-panorama.jpg',
      imageAlt: 'Alpine morning light above campsite',
    },
    narrativeTitle: 'Restful warmth in changing weather.',
    narrativeParagraphs: [
      'The Summit bag uses premium multi-denier thermal fill that mimics down compressibility while maintaining insulating performance in humid air.',
      'Full-length snag-free zipper with anti-draft tube prevents cold leaks along your spine.',
    ],
    thoughtfulFeatures: [
      {
        title: 'Thermal draft collar',
        description: 'Drawcord collar locks in shoulder warmth without restricting neck movement.',
        icon: 'wind',
      },
      {
        title: 'DWR water-repellent shell',
        description: 'Repels tent wall condensation and morning dew so insulation stays fluffy.',
        icon: 'cloud-rain',
      },
      {
        title: 'Anatomical footbox',
        description: 'Flared base gives natural foot posture without compressing insulation against toes.',
        icon: 'tent',
      },
      {
        title: 'Compression stuff sack included',
        description: 'Packs down tight into bottom sleeping bag compartments of 40L+ packs.',
        icon: 'backpack',
      },
    ],
    specifications: [
      { label: 'Comfort rating', value: '0°C (32°F)' },
      { label: 'Limit rating', value: '-5°C (23°F)' },
      { label: 'Fill type', value: 'Hydrophobic high-loft synthetic' },
      { label: 'Shell material', value: '20D DWR Ripstop Nylon' },
      { label: 'Lining material', value: 'Soft-touch breathable taffeta' },
      { label: 'Weight', value: '1.18 kg (Regular)' },
      { label: 'Compressed size', value: '32 × 18 cm' },
      { label: 'Zipper', value: '#5 YKK 2-way with anti-snag slider' },
    ],
    inTheBag: 'Sleeping bag, compression sack, and breathable mesh storage sack.',
    reviewsSummary: {
      averageRating: 4.3,
      totalReviews: 32,
      ratingDistribution: [
        { stars: 5, count: 18, percentage: 56 },
        { stars: 4, count: 10, percentage: 31 },
        { stars: 3, count: 3, percentage: 9 },
        { stars: 2, count: 1, percentage: 3 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    },
    sampleReviews: [
      {
        id: 'rev-sb-1',
        author: 'Sarah P.',
        date: 'October 15, 2026',
        rating: 5,
        title: 'Stayed toasty on frosty nights',
        content:
          'Camped around 34°F at 7,000 feet. The hood cinches comfortably and the footbox has plenty of room. Woke up without any cold spots.',
        helpfulCount: 7,
      },
    ],
  },

  'trail-rechargeable-spotlight': {
    id: 'prod-trail-spotlight',
    name: 'Trail Rechargeable Spotlight',
    slug: 'trail-rechargeable-spotlight',
    priceInCents: 8900,
    imageUrl: '/images/shop/trail-rechargeable-spotlight.jpg',
    imageAlt: 'High-power rechargeable outdoor spotlight lantern',
    category: 'Lighting',
    specs: 'High-output beam · Rechargeable',
    rating: 4.7,
    reviewCount: 62,
    colorSwatches: ['#dc2626', '#1e293b'],
    colorCount: 2,
    activity: ['Camping', 'Hiking & trekking'],
    features: ['Rechargeable', 'Water-resistant'],
    inStock: true,
    sku: 'ALT-LT80-RED',
    subtitle: '800 lumens of focus and flood lighting',
    shortDescription:
      'A versatile lantern and long-range trail spotlight built with an impact-resistant sealed casing and high-capacity USB-C rechargeable battery.',
    colors: [
      { name: 'Red', hex: '#dc2626' },
      { name: 'Graphite', hex: '#1e293b' },
    ],
    capacityOptions: ['800 Lumens'],
    quickMetrics: [
      { label: 'Output', value: '800 Lumens' },
      { label: 'Beam dist.', value: '220 meters' },
      { label: 'Run time', value: 'Up to 18 hrs' },
    ],
    narrativeBanner: {
      kicker: 'LIGHT THE WAY',
      title: 'Confidence long after twilight.',
      description:
        'Cast a brilliant 200m spotlight down the trail or flip down the diffuser for soft, 360-degree campsite illumination.',
      imageSrc: '/images/shop/shop-hero-panorama.jpg',
      imageAlt: 'Campfire and lantern glow in wilderness evening',
    },
    narrativeTitle: 'Illumination engineered for trail and camp.',
    narrativeParagraphs: [
      'Dual optical reflectors deliver instant switching between high-intensity spotting beam and warm ambient flood lantern.',
      'Also functions as an emergency power bank to top up mobile devices or navigation units via USB-C reverse charge.',
    ],
    thoughtfulFeatures: [
      {
        title: 'IPX6 stormproof rating',
        description: 'Withstands driving rain and wet trail drops without moisture intrusion.',
        icon: 'cloud-rain',
      },
      {
        title: 'USB-C bidirectional charging',
        description: 'Recharges from zero in 3.5 hours; doubles as a portable power bank on the trail.',
        icon: 'wind',
      },
      {
        title: 'Hanging clip & magnetic base',
        description: 'Quickly mounts inside tent ceilings or sticks to metal camp kitchen surfaces.',
        icon: 'tent',
      },
      {
        title: 'Lockout mode',
        description: 'Prevents accidental discharge inside your backpack during transit.',
        icon: 'backpack',
      },
    ],
    specifications: [
      { label: 'Max lumens', value: '800 Lumens (Spot) / 350 Lumens (Lantern)' },
      { label: 'Battery', value: '5200 mAh Lithium-Ion (USB-C Rechargeable)' },
      { label: 'Beam distance', value: '220 meters' },
      { label: 'Water resistance', value: 'IPX6 weather resistant' },
      { label: 'Weight', value: '280 grams' },
      { label: 'Dimensions', value: '14 × 7.5 × 7.5 cm' },
      { label: 'Power bank output', value: '5V / 2.1A USB-A & USB-C' },
    ],
    inTheBag: 'Spotlight lantern, USB-C to USB-A charging cord, carabiner clip, user guide.',
    reviewsSummary: {
      averageRating: 4.7,
      totalReviews: 62,
      ratingDistribution: [
        { stars: 5, count: 48, percentage: 77 },
        { stars: 4, count: 11, percentage: 18 },
        { stars: 3, count: 2, percentage: 3 },
        { stars: 2, count: 1, percentage: 2 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    },
    sampleReviews: [
      {
        id: 'rev-lt-1',
        author: 'Chris W.',
        date: 'October 21, 2026',
        rating: 5,
        title: 'Brightest camp light I own',
        content:
          'The beam throws far into the woods for checking on odd noises, and the warm lantern mode inside our tent is soft on the eyes. Charged my phone 50% in an hour too.',
        helpfulCount: 9,
      },
    ],
  },

  'atena-2-person-tent': {
    id: 'prod-atena-2p-tent',
    name: 'Atena 2-person Tent',
    slug: 'atena-2-person-tent',
    priceInCents: 12000,
    imageUrl: '/images/shop/atena-2-person-tent.jpg',
    imageAlt: 'Atena 2-person easy-pitch dome tent in bright orange',
    category: 'Tents & Shelters',
    specs: 'Room for two · Easy-pitch design',
    rating: 4.1,
    reviewCount: 23,
    colorSwatches: ['#df7a36'],
    colorCount: 1,
    activity: ['Camping'],
    features: ['Lightweight'],
    inStock: true,
    sku: 'ALT-ATN2-ORG',
    subtitle: 'Classic freestanding dome simplicity',
    shortDescription:
      'An accessible, quick-pitching dome tent built for weekend road trips, festivals, and frontcountry camping.',
    colors: [{ name: 'Blaze Orange', hex: '#df7a36' }],
    capacityOptions: ['2 person'],
    quickMetrics: [
      { label: 'People', value: '2' },
      { label: 'Protection', value: '2-season' },
      { label: 'Packed weight', value: '2.8 kg' },
    ],
    narrativeBanner: {
      kicker: 'WEEKEND READY',
      title: 'Effortless setup for simple escapes.',
      description:
        'A quick criss-cross 2-pole design lets you go from unpacked to pitched in under four minutes.',
      imageSrc: '/images/shop/shop-hero-panorama.jpg',
      imageAlt: 'Dome tent set up beside lake',
    },
    narrativeTitle: 'Straightforward comfort under the stars.',
    narrativeParagraphs: [
      'The Atena dome tent combines high-volume interior walls with a generous mesh ceiling for stargazing and ventilation.',
      'Durable polyester floor and taped rain seams keep moderate rain out while the bright fly boosts campsite visibility.',
    ],
    thoughtfulFeatures: [
      {
        title: 'Quick clip pole sleeves',
        description: 'Two continuous pole sleeves allow fast solo pitching even in gusty weather.',
        icon: 'tent',
      },
      {
        title: 'Stargazer mesh roof',
        description: 'Remove the fly on clear summer evenings for full airflow and night sky views.',
        icon: 'wind',
      },
      {
        title: 'Waterproof PU coating',
        description: 'Taped seams and 2,000 mm waterproof rating handle spring and summer showers.',
        icon: 'cloud-rain',
      },
      {
        title: 'Interior organization',
        description: 'Dual mesh wall organizers and overhead lantern hook keep essentials tidy.',
        icon: 'backpack',
      },
    ],
    specifications: [
      { label: 'Capacity', value: '2 people' },
      { label: 'Seasons', value: '2-season' },
      { label: 'Packed weight', value: '2.8 kg' },
      { label: 'Floor dimensions', value: '210 × 130 cm' },
      { label: 'Peak height', value: '115 cm' },
      { label: 'Packed size', value: '50 × 18 cm' },
      { label: 'Rainfly', value: '68D polyester · 2,000 mm PU' },
      { label: 'Poles', value: 'Fiberglass shock-corded' },
    ],
    inTheBag: 'Tent body, rainfly, 2 main poles, 8 steel pegs, carry bag.',
    reviewsSummary: {
      averageRating: 4.1,
      totalReviews: 23,
      ratingDistribution: [
        { stars: 5, count: 12, percentage: 52 },
        { stars: 4, count: 6, percentage: 26 },
        { stars: 3, count: 3, percentage: 13 },
        { stars: 2, count: 2, percentage: 9 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    },
    sampleReviews: [
      {
        id: 'rev-atena-1',
        author: 'Elena G.',
        date: 'October 10, 2026',
        rating: 5,
        title: 'Incredible value for weekend car camping',
        content:
          'Super simple to set up in the dark. Tons of headroom to sit up and change. Great affordable tent.',
        helpfulCount: 6,
      },
    ],
  },

  'atena-cookset': {
    id: 'prod-atena-cookset',
    name: 'Atena Cookset',
    slug: 'atena-cookset',
    priceInCents: 9900,
    imageUrl: '/images/shop/atena-cookset.jpg',
    imageAlt: 'Compact anodized nesting cookset with camp stove attachment',
    category: 'Camping Kitchen',
    specs: 'Compact cooking · Trail-ready set',
    rating: 4.5,
    reviewCount: 41,
    colorSwatches: ['#0f172a', '#f97316'],
    colorCount: 2,
    activity: ['Camping', 'Backpacking'],
    features: ['Packable', 'Lightweight'],
    inStock: true,
    sku: 'ALT-CK01-BLK',
    subtitle: 'Nesting hard-anodized trail kitchen',
    shortDescription:
      'Ultra-compact nested cookset engineered for backcountry trail meals, featuring hard-anodized aluminum for even heating and easy cleaning.',
    colors: [
      { name: 'Charcoal', hex: '#0f172a' },
      { name: 'Amber', hex: '#f97316' },
    ],
    capacityOptions: ['1.2L + Frypan'],
    quickMetrics: [
      { label: 'Volume', value: '1.2 Liters' },
      { label: 'Material', value: 'Hard Anodized' },
      { label: 'Packed weight', value: '340 grams' },
    ],
    narrativeBanner: {
      kicker: 'TRAIL CUISINE',
      title: 'Warm meals, hot coffee, minimal weight.',
      description:
        'Nest your stove and a 100g gas canister neatly inside for an all-in-one compact kitchen pack.',
      imageSrc: '/images/shop/shop-hero-panorama.jpg',
      imageAlt: 'Campfire cooking panorama at dusk',
    },
    narrativeTitle: 'Fast heat transfer, zero wasted pack space.',
    narrativeParagraphs: [
      'Engineered with hard-anodized aluminum that heats water 30% faster than stainless steel while weighing a fraction of cast cookware.',
      'Fold-out silicone insulated handles lock securely into place while cooking and fold flat around the rim for transport.',
    ],
    thoughtfulFeatures: [
      {
        title: 'Hard-anodized non-stick surface',
        description: 'Abrasion-resistant food-safe finish makes cleanup simple with a quick rinse.',
        icon: 'cloud-rain',
      },
      {
        title: 'Heat-resistant silicone handles',
        description: 'Insulated folding butterfly handles keep fingers protected from boiling rims.',
        icon: 'wind',
      },
      {
        title: 'Stove & canister nesting',
        description: 'Engineered interior cavity fits standard 110g isobutane fuel canisters and burner.',
        icon: 'tent',
      },
      {
        title: 'Strainer lid with steam vent',
        description: 'Multi-functional lid doubles as a pasta strainer and shallow frying skillet.',
        icon: 'backpack',
      },
    ],
    specifications: [
      { label: 'Main pot volume', value: '1.2 Liters' },
      { label: 'Lid / skillet volume', value: '0.45 Liters' },
      { label: 'Material', value: 'Hard-anodized aluminum & silicone' },
      { label: 'Weight', value: '340 grams' },
      { label: 'Packed dimensions', value: '15 × 12.5 cm' },
      { label: 'Coating', value: 'Non-stick scratch-resistant finish' },
      { label: 'Stove compatibility', value: 'Canister burners, liquid fuel & camp stoves' },
    ],
    inTheBag: '1.2L pot, dual-use lid/frypan, mesh storage bag with drawcord.',
    reviewsSummary: {
      averageRating: 4.5,
      totalReviews: 41,
      ratingDistribution: [
        { stars: 5, count: 26, percentage: 63 },
        { stars: 4, count: 11, percentage: 27 },
        { stars: 3, count: 3, percentage: 7 },
        { stars: 2, count: 1, percentage: 3 },
        { stars: 1, count: 0, percentage: 0 },
      ],
    },
    sampleReviews: [
      {
        id: 'rev-cook-1',
        author: 'Liam B.',
        date: 'October 14, 2026',
        rating: 5,
        title: 'Boils water fast and packs tiny',
        content:
          'Fits my pocket stove and 100g canister inside perfectly with no rattling. Boils 500ml water in about 2.5 minutes.',
        helpfulCount: 11,
      },
    ],
  },
};

/**
 * Retrieves a detailed product record by its URL slug.
 */
export function getProductDetailBySlug(slug: string): ProductDetail | undefined {
  if (PRODUCT_DETAILS_MAP[slug]) {
    return PRODUCT_DETAILS_MAP[slug];
  }

  // Fallback: Check if base product exists in MOCK_SHOP_PRODUCTS
  const base = MOCK_SHOP_PRODUCTS.find((p) => p.slug === slug);
  if (!base) return undefined;

  return {
    ...base,
    subtitle: base.specs,
    shortDescription: `${base.name} - high-performance gear built for the trail.`,
    sku: `ALT-${base.id.replace('prod-', '').toUpperCase()}`,
    quickMetrics: [{ label: 'Category', value: base.category }],
    specifications: [{ label: 'Category', value: base.category }],
  };
}

/**
 * Returns up to 4 recommended products for the "You May Also Like" grid,
 * excluding the currently viewed product.
 */
export function getRecommendedProducts(currentSlug: string, limit: number = 4): ShopProduct[] {
  return MOCK_SHOP_PRODUCTS.filter((p) => p.slug !== currentSlug).slice(0, limit);
}
