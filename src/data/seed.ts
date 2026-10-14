import type { DemoState, Professional, Project } from '../types/domain';
import { OWN_PROVIDER_ID } from '../config/catalog';
const project = (
  id: string,
  title: string,
  image: string,
  { type = 'Residential', location = 'Ahmedabad', year = 2025, area = '', description = '' },
): Project => ({
  id,
  title,
  type,
  location,
  year,
  area,
  description,
  images: [`/images/${image}.jpg`],
  status: 'Completed',
});
export const seedProviders: Professional[] = [
  {
    id: 'p1',
    slug: 'aangan-studio-ahmedabad',
    name: 'Aarav Mehta',
    studio: 'Aangan Studio',
    type: 'Architect & Interior Designer',
    city: 'Ahmedabad',
    years: 9,
    qualification: 'B.Arch, CEPT University',
    bio: 'We create thoughtful spaces rooted in context, craft and the way you live. Our practice brings a contemporary sensibility to the warmth of Indian homes.',
    initials: 'AS',
    color: '#e1d8c5',
    services: [
      {
        id: 's1',
        category: 'Architectural Design',
        description: 'From the first sketch to detailed working drawings.',
        priceType: 'starting_from',
        price: 45000,
      },
      {
        id: 's2',
        category: 'Residential Interior Design',
        description: 'Personal spaces, carefully considered from end to end.',
        priceType: 'starting_from',
        price: 60000,
      },
      {
        id: 's3',
        category: 'Space Planning',
        description: 'Make more room for the way you live.',
        priceType: 'fixed',
        price: 15000,
      },
    ],
    projects: [
      project('pr1', 'The quiet residence', 'living', {
        year: 2025,
        area: '3,200 sq ft',
        description:
          'A family home organised around one generous living room. Lime-plastered walls, teak and a single skylight keep it calm through the day.',
      }),
      project('pr2', 'A home, naturally', 'dining', {
        year: 2024,
        area: '1,850 sq ft',
        description:
          'A compact apartment opened up around the dining table, with built-in storage that keeps everyday clutter out of sight.',
      }),
      project('pr3', 'Light & lines', 'architecture', {
        year: 2023,
        area: '4,600 sq ft',
        description:
          'A two-storey house with deep overhangs and a shaded courtyard that pulls breeze through every room.',
      }),
    ],
    languages: ['English', 'Hindi', 'Gujarati'],
    status: 'published',
    mobileVerified: true,
    completeness: 98,
    lastActive: '2026-09-26',
    coaNumber: 'CA/2016/78231',
    workCities: ['Gandhinagar', 'Vadodara'],
  },
  {
    id: 'p2',
    slug: 'earth-and-form-ahmedabad',
    name: 'Nisha Shah',
    studio: 'Earth & Form',
    type: 'Interior Designer',
    city: 'Ahmedabad',
    years: 7,
    qualification: 'B.Des, NID Ahmedabad',
    bio: 'Warm minimalism, natural materials and a love for the handmade. We design homes that tell your story, with a little less noise and a lot more soul.',
    initials: 'EF',
    color: '#d4dccb',
    services: [
      {
        id: 's4',
        category: 'Residential Interior Design',
        description: 'A considered approach to your everyday spaces.',
        priceType: 'starting_from',
        price: 55000,
      },
      {
        id: 's5',
        category: 'Furniture/Layout Design',
        description: 'Bespoke pieces and practical layouts.',
        priceType: 'contact_for_pricing',
      },
    ],
    projects: [
      project('pr4', 'Soft edges, warm living', 'warm', {
        year: 2025,
        area: '1,450 sq ft',
        description:
          'Rounded joinery, warm oak and layered lighting turn a rented flat into a home that feels settled.',
      }),
      project('pr5', 'A place to gather', 'bedroom', {
        year: 2023,
        area: '2,100 sq ft',
        description:
          'A guest suite and family room designed for long visits: quiet corners, good light and room for everyone.',
      }),
    ],
    languages: ['English', 'Hindi'],
    status: 'published',
    mobileVerified: true,
    completeness: 95,
    lastActive: '2026-09-25',
  },
  {
    id: 'p3',
    slug: 'form-and-field-pune',
    name: 'Kabir Desai',
    studio: 'Form & Field',
    type: 'Architect',
    city: 'Pune',
    years: 12,
    qualification: 'B.Arch, University of Pune',
    bio: 'Architecture shaped by place. We work with light, landscape and local materials to build enduring spaces with a lighter footprint.',
    initials: 'FF',
    color: '#ddd2c9',
    services: [
      {
        id: 's6',
        category: 'Architectural Design',
        description: 'Contextual architecture for contemporary living.',
        priceType: 'contact_for_pricing',
      },
      {
        id: 's7',
        category: 'Sustainable Design Consultation',
        description: 'A considered path to better building.',
        priceType: 'fixed',
        price: 12000,
      },
    ],
    projects: [
      project('pr6', 'Courtyard house', 'architecture', {
        location: 'Pune',
        year: 2024,
        area: '5,200 sq ft',
        description:
          'Four wings around a planted courtyard, built in exposed brick with a roof that collects monsoon rain.',
      }),
      project('pr7', 'Between the trees', 'house', {
        location: 'Pune',
        year: 2022,
        area: '3,800 sq ft',
        description:
          'A weekend home placed carefully between existing mango trees, so not one of them had to be cut.',
      }),
    ],
    languages: ['English', 'Hindi', 'Marathi'],
    status: 'published',
    mobileVerified: true,
    completeness: 94,
    lastActive: '2026-09-24',
  },
  {
    id: 'p4',
    slug: 'the-lived-in-studio-mumbai',
    name: 'Riya Kapoor',
    studio: 'The Lived-in Studio',
    type: 'Interior Designer',
    city: 'Mumbai',
    years: 5,
    qualification: 'B.Des, Rachana Sansad',
    bio: 'Beautiful, practical interiors for real life. We turn compact urban spaces into generous-feeling homes, with colour, character and clever planning.',
    initials: 'LS',
    color: '#e6d2c8',
    services: [
      {
        id: 's8',
        category: 'Residential Interior Design',
        description: 'A fresh perspective on urban living.',
        priceType: 'starting_from',
        price: 75000,
      },
      {
        id: 's9',
        category: 'Space Planning',
        description: 'Every corner with a purpose.',
        priceType: 'fixed',
        price: 20000,
      },
    ],
    projects: [
      project('pr8', 'Room to breathe', 'bedroom', {
        location: 'Mumbai',
        year: 2025,
        area: '980 sq ft',
        description:
          'A one-bedroom Mumbai flat reworked for light and air, with sliding screens instead of fixed walls.',
      }),
    ],
    languages: ['English', 'Hindi'],
    status: 'published',
    mobileVerified: true,
    completeness: 92,
    lastActive: '2026-09-23',
  },
  {
    id: 'p5',
    slug: 'atelier-north-bengaluru',
    name: 'Dev Menon',
    studio: 'Atelier North',
    type: 'Architect & Interior Designer',
    city: 'Bengaluru',
    years: 11,
    qualification: 'M.Arch, CEPT University',
    bio: 'A small multidisciplinary practice exploring the relationship between architecture, interiors and the people who inhabit them.',
    initials: 'AN',
    color: '#d4dbd9',
    services: [
      {
        id: 's10',
        category: 'Architectural Design',
        description: 'Complete architectural design services.',
        priceType: 'starting_from',
        price: 90000,
      },
      {
        id: 's11',
        category: 'Commercial Interior Design',
        description: 'Workplaces with a human perspective.',
        priceType: 'contact_for_pricing',
      },
    ],
    projects: [
      project('pr9', 'A slower kind of home', 'dining', {
        location: 'Bengaluru',
        year: 2024,
        area: '2,750 sq ft',
        description:
          'A retired couple’s home with a kitchen garden, a reading nook and a dining table at its centre.',
      }),
    ],
    languages: ['English', 'Hindi', 'Kannada'],
    status: 'published',
    mobileVerified: true,
    completeness: 90,
    lastActive: '2026-09-22',
  },
  {
    id: 'p6',
    slug: 'studio-mitti-vadodara',
    name: 'Isha Patel',
    studio: 'Studio Mitti',
    type: 'Other Design Professional',
    city: 'Vadodara',
    years: 3,
    qualification: 'M.Des, Landscape Design',
    bio: 'Gardens, courtyards and outdoor spaces designed to grow with you. We bring a native, seasonal approach to landscape and everyday nature.',
    initials: 'SM',
    color: '#d5dcc5',
    services: [
      {
        id: 's12',
        category: 'Landscape Design',
        description: 'Outdoor spaces that grow into themselves.',
        priceType: 'starting_from',
        price: 25000,
      },
    ],
    projects: [
      project('pr10', 'A green pause', 'house', {
        type: 'Landscape',
        location: 'Vadodara',
        year: 2024,
        area: '26,000 sq ft',
        description:
          'Native planting, a stepped water channel and shaded seating around an existing family home.',
      }),
    ],
    languages: ['English', 'Gujarati'],
    status: 'published',
    mobileVerified: true,
    completeness: 88,
    lastActive: '2026-09-21',
  },
];
const seedContacts: DemoState['contacts'] = {
  p1: { phone: '9824012345', email: 'hello@aanganstudio.in' },
  p2: { phone: '9879054321', email: 'studio@earthandform.in' },
  p3: { phone: '9822011122', email: 'office@formandfield.in' },
  p4: { phone: '9820033445', email: 'hello@livedinstudio.in' },
  p5: { phone: '9845066778', email: 'studio@ateliernorth.in' },
  p6: { phone: '9898077889', email: 'grow@studiomitti.in' },
};
const sampleClient = { name: 'Meera Iyer', email: 'meera.iyer@example.com', phone: '9812345678' };

/** A brand-new professional account: nothing published, nothing borrowed from the sample studio. */
export function blankProfessional(id: string): Professional {
  return {
    id,
    slug: `new-practice-${id}`,
    name: '',
    studio: '',
    type: 'Architect',
    city: '',
    years: 0,
    qualification: '',
    bio: '',
    initials: 'UD',
    color: '#e1d8c5',
    services: [],
    projects: [],
    languages: [],
    status: 'draft',
    mobileVerified: true,
    completeness: 0,
    lastActive: new Date().toISOString().slice(0, 10),
    workCities: [],
    links: [],
  };
}

/** A believable week of profile views, relative to today. */
function recentViews(count: number) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => new Date(now - i * 22_000_000).toISOString());
}

export function createSeedState(): DemoState {
  return {
    version: 3,
    ownId: OWN_PROVIDER_ID,
    session: { client: null, professional: false, admin: false },
    saved: [],
    reports: [],
    views: { p1: recentViews(23) },
    contacts: structuredClone(seedContacts),
    providers: structuredClone(seedProviders),
    balance: 200,
    ledger: [
      { id: 'l1', label: 'Launch joining grant', amount: 200, date: '2026-09-25T10:00:00Z' },
    ],
    payments: [],
    requirements: [
      {
        id: 'r1',
        title: 'A warm, contemporary family home',
        projectType: 'Residential',
        city: 'Ahmedabad',
        service: 'Residential Interior Design',
        description:
          'We are moving into a three-bedroom apartment and would love a warm, welcoming home with natural materials, plenty of storage and space for our family to spend time together.',
        budget: '₹10–20 lakh',
        timeline: 'Within 3 months',
        size: '1,850 sq ft',
        createdAt: '2026-09-26T10:00:00Z',
        client: sampleClient,
      },
      {
        id: 'r2',
        title: 'Thoughtful layout for a new apartment',
        projectType: 'Residential',
        city: 'Ahmedabad',
        service: 'Space Planning',
        description:
          'We need a functional layout for our new apartment, including a home office, an open living and dining area, and improved natural light.',
        budget: '₹5–10 lakh',
        timeline: 'Within 1 month',
        size: '1,200 sq ft',
        createdAt: '2026-09-25T10:00:00Z',
        client: sampleClient,
      },
    ],
    enquiries: [
      {
        id: 'e1',
        requirementId: 'r1',
        providerId: 'p1',
        status: 'sent',
        sentAt: '2026-09-26T10:00:00Z',
      },
      {
        id: 'e2',
        requirementId: 'r1',
        providerId: 'p2',
        status: 'proposal_sent',
        sentAt: '2026-09-26T10:00:00Z',
      },
      {
        id: 'e3',
        requirementId: 'r2',
        providerId: 'p1',
        status: 'viewed',
        sentAt: '2026-09-25T10:00:00Z',
      },
    ],
    proposals: [
      {
        id: 'proposal2',
        enquiryId: 'e2',
        scope:
          'A complete interior design concept for your family home, with a focus on warm materials, intelligent storage and a cohesive palette throughout the apartment.',
        deliverables: [
          'Concept and mood boards',
          'Furniture and layout plans',
          'Material and finish palette',
          '3D views of key spaces',
        ],
        band: 'C',
        timeline: '8–10 weeks',
        fee: '₹65,000',
        cost: 300,
        flagged: false,
      },
    ],
  };
}
