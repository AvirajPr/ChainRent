import type { Property, Lease, Transaction, Notification, Reputation } from '../types';

export const mockProperties: Property[] = [
  {
    id: 'p1',
    title: 'Horizon Peak Penthouse',
    location: 'Marina Bay, Suite 4401',
    type: 'Apartment',
    price: 1200,
    deposit: 2400,
    status: 'available',
    description: 'A high-end architectural penthouse apartment with floor-to-ceiling windows overlooking a twilight city skyline. The interior features clean lines, luxury materials like marble and dark wood, and soft ambient lighting. Includes high-speed fiber internet, multi-signature digital door lock, and premium kitchen appliances.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCsrAkT2yhKRMxhxo4bSDHV7Opd7m1amQ9MaUB5qV0RMgoSbxycR2FEYiakPadTQZSFUVD16YWxkLXL-bP_3OPvTRI2s1m_cEsrWAoErTA2YeYmjteM1l8dyyIqOv4NQomDK76dNPhQ_c3PWvzSOz_uV0hGZzxeWDJUafr5DPnQJzL2cHPO8p312nMsMkxh_7B6O8no3XPAxHPbxoGTajk5GTu7H8h71bJYuqmMw1oJ3Xo8AzMBztD5TJMICuCPjLKbcJBQV2SZo2k',
    ownerAddress: 'GBDN6SFO3JOYSHHPIDXV5JQRVBKG5QEDUHG4M5MRKUTZAOSYTRLV3CZW',
    ownerName: 'Sarah Connor',
    ownerRating: 4.8,
    bedrooms: 3,
    bathrooms: 3.5,
    sqft: 2400,
    verified: true,
    amenities: ['Penthouse', 'Skyline View', 'Smart Lock', '24/7 Security', 'Private Elevator', 'Gym Access']
  },
  {
    id: 'p2',
    title: 'Skyline Apartment',
    location: 'Downtown Metropolis',
    type: 'Apartment',
    price: 2500,
    deposit: 5000,
    status: 'available',
    description: 'Modern, high-end apartment interior with floor-to-ceiling windows overlooking a sunset city skyline. The room is styled with minimalist Scandinavian furniture, soft neutral tones, and warm ambient lighting. Perfect for professionals looking for a high-quality, secure workspace at home.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr30mNmKYdE4YcwW3bR5B0ITdw-yP00tyRVN3Z-nKSPx1poQtVh2SJ1f9B2SapZfI0v6XzSyqB91lQO5NzowYiqmL7cYM_rEikj6BeIzIk2cesWTn4SInYr3sUeU6hl9mfJaKz78CgDlBaxSJDjqcgql3bfwW8Yw_T7V7xgje2u0WUM3GkhgXCI1mGTVAHB5jxtmIJKf2Gvvuh-YwazRj8VJnZqsyeB2I7kuYR99yQQG05fQm4rApOVCoY0S7I8rtp3JvZno5I5I0',
    ownerAddress: 'GBDN6SFO3JOYSHHPIDXV5JQRVBKG5QEDUHG4M5MRKUTZAOSYTRLV3CZW',
    ownerName: 'Sarah Connor',
    ownerRating: 4.8,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    verified: true,
    amenities: ['City Center', 'Furnished', 'Concierge', 'High-Speed Wifi', 'Parking Spot']
  },
  {
    id: 'p3',
    title: 'Neo-Villa Oasis',
    location: 'Coastal District',
    type: 'Villa',
    price: 8200,
    deposit: 16400,
    status: 'available',
    description: 'A sleek, brutalist-inspired concrete villa with lush tropical gardens and a private turquoise swimming pool. The lighting is crisp midday sun, creating sharp, architectural shadows. Offering complete privacy, luxury finishes, and fully integrated smart home automation.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyHF0q73SIslNnN-Req_l5NkC8ZbVyns-0RW7lyBm62RYX9grBcMdU3B63-HYQL2WSnDggP4DD-2Ix5sLpwmTWV3yN-rd70sdA1GiolavsrvMQVn61vsapI4BLFMZNpJjZLlT0bhu8B3d_e1kYXiz2lzSWIuXxv6h2pki8dnyalWQVZ6BvsnlkjJhphKyNjP3wu0Q2BFMwo96Jzvvru04YoAx2wWqOLY3MPjienOD1D2jaSU6YeHygyazkkPP4F0bMc9XtNLHnQCs',
    ownerAddress: 'GCIXI4NIXH33CZ45BNVV5FGHO67COXW6WE6ENNVIQA3TWAJBAMGO43AQ',
    ownerName: 'Marcus Aurelius',
    ownerRating: 4.9,
    bedrooms: 5,
    bathrooms: 6,
    sqft: 5200,
    verified: true,
    amenities: ['Ocean Front', 'Swimming Pool', 'Smart Automation', 'Solar Powered', 'Wine Cellar', 'Guest House']
  },
  {
    id: 'p4',
    title: 'Tech Hub Loft',
    location: 'Innovation Park',
    type: 'Office',
    price: 3400,
    deposit: 6800,
    status: 'rented',
    description: 'A high-tech co-working space and office loft with industrial-chic design, featuring large wooden tables, glass partitions, and vibrant interior plants. Ideal for startup offices or co-working platforms looking for verified leases and transparent terms.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUOclOs6W3NwBg4mHL6mMM9uwc9n0Lz854wt6gsyQi1pLPK1wNQTNs1zV6ciPY-uU8QYTHzPa0VHZhH8Wd6elBVDIVb1K_Bzswq83WAHZTyrIBXtykU1EBh69ubchp6OVRWxVw9UWJh1w2LjMzEoUF_LdS9HBd-CI2kvHMQoxyNjNZ0IBZo9MQyEPnVuEP7jo3rhjYKre6awPaN13fubZjTThOgGFgLs1iwsC2XoZ8okzaqovqe3bRwkDa24ptQWnnasAa-WdNEto',
    ownerAddress: 'GC3BYYQAM2TWKB7F77BITH4JZ7FT2R3QE5UOYF7X4C2QVMFHXNBIMMQE',
    ownerName: 'RealProp LLC',
    ownerRating: 4.5,
    bedrooms: 0,
    bathrooms: 2,
    sqft: 1800,
    verified: true,
    amenities: ['Co-Working Area', 'High-Speed Fiber', 'Conference Rooms', 'Kitchenette', 'Coffee Bar']
  },
  {
    id: 'p5',
    title: 'The Glass Cabin',
    location: 'Pine Ridge Reserve',
    type: 'Studio',
    price: 1800,
    deposit: 3600,
    status: 'available',
    description: 'A cozy, high-design tiny house set in a foggy pine forest with a large circular window and a warm, glowing interior. Retreat from the city and enjoy absolute privacy in this eco-friendly smart cabin, featuring solar power and composting systems.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAokQspQxrzw1G5ZSBiCnaJRmYKRLkk4K8cKPX0-bcENYeeDXpjYRz1o-rPg4kts1yhRrI2yerHn-HaGc9Rc6i6i0I54N0G-DJplCZCiXKi-yUmBsB-PqyLMaf6vLrH2_wzVHS1Cl8ahzHcK-FPXaUicAN5APCvjjzBaacncTtNN3XOig7mKe6Amqtx8RIaZB9pVvoPVdAGZxWj9AoJ2gB3ZHuvb0sacdXHGCYye5apTjPKzXzUPq4o3R5fWvJB6F6CZfB33VVgX4I',
    ownerAddress: 'GCWWPFZ2J7GW4ZXZBXABXRCDOPEYWHQXUT2TDRENLOCDHGPJFTTVWOTZ',
    ownerName: 'Emily K.',
    ownerRating: 4.7,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 450,
    verified: true,
    amenities: ['Forest View', 'Solar Power', 'Fireplace', 'Outdoor Deck', 'Hot Tub']
  },
  {
    id: 'p6',
    title: '123 Maple St, Unit 4B',
    location: 'San Francisco, CA',
    type: 'Apartment',
    price: 1200,
    deposit: 2400,
    status: 'rented',
    description: 'A modern luxury apartment building exterior at sunset, warm lighting hitting the glass facade. Clean lines and professional real estate aesthetic. Features dynamic temperature control, energy-efficient fixtures, and secure access.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDM6w_-09evof9BvKlCDadSFsJx4eTXcf5xWaQL1bHGME_AFUuCeVYeu9MN8ZpBNPBROzlMGVXjxB8pZj1yD1w7SYJ9KZ1WCIVOE2VOFsdqrZoRLfiCBcKHtZZYoht18sdFv7fPnAFGR8nnEORHeQSeNOn-b3uLIZ5ok5087kcljio0OsdriZ6_9m11p0WSpTwBgi294k9xdQArVEnI8TA0GMB8S_Bc-Ff_yfz1E9CSj6xIpHlHLb3SYBseBQyEA5HYKA9Dp0oaQPQ',
    ownerAddress: 'GBDN6SFO3JOYSHHPIDXV5JQRVBKG5QEDUHG4M5MRKUTZAOSYTRLV3CZW',
    ownerName: 'Sarah Connor',
    ownerRating: 4.8,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 850,
    verified: true,
    amenities: ['City View', 'Pet Friendly', 'Balcony', 'Laundry in Unit']
  },
  {
    id: 'p7',
    title: '789 Ocean Ave, Loft 2',
    location: 'Santa Monica, CA',
    type: 'Apartment',
    price: 2100,
    deposit: 4200,
    status: 'processing',
    description: 'A bright and airy interior of a minimalist studio apartment, sunlight streaming through large windows. Light wood floors, high-end corporate minimalist furniture. Just steps away from the beach, featuring ocean air circulation and modern amenities.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLNMdyQ0dZiMkzMkYo2tLIUlemAFhzbs1e9_gBOwygdSgVuRf_oyyyjKTi89OP1eBHjgPSYE9fcDupweuKepFdqocsXkRFsOy8vrrKFWguG8a8Od-Tuqyisc_8ukj1gXcdSSzJW_hUT8jqbCnvrJCmnScJA-w67W6uoC7NEtX_g3ssWY2kSc55u9Zru-vCd14if0H_RWAqKCAC8L28lyTSU62hmGlKPlPBOfUkhGjzCtoeCd7x2WMsK3NRSsQSJLK_h5bbz-HTjak',
    ownerAddress: 'GC3BYYQAM2TWKB7F77BITH4JZ7FT2R3QE5UOYF7X4C2QVMFHXNBIMMQE',
    ownerName: 'RealProp LLC',
    ownerRating: 4.6,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 700,
    verified: true,
    amenities: ['Beachside', 'Loft Layout', 'Smart Climate', 'Covered Parking']
  }
];

export const mockLeases: Lease[] = [
  {
    id: 'l1',
    propertyId: 'p6',
    propertyTitle: '123 Maple St, Unit 4B',
    propertyImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDM6w_-09evof9BvKlCDadSFsJx4eTXcf5xWaQL1bHGME_AFUuCeVYeu9MN8ZpBNPBROzlMGVXjxB8pZj1yD1w7SYJ9KZ1WCIVOE2VOFsdqrZoRLfiCBcKHtZZYoht18sdFv7fPnAFGR8nnEORHeQSeNOn-b3uLIZ5ok5087kcljio0OsdriZ6_9m11p0WSpTwBgi294k9xdQArVEnI8TA0GMB8S_Bc-Ff_yfz1E9CSj6xIpHlHLb3SYBseBQyEA5HYKA9Dp0oaQPQ',
    tenantName: 'James D.',
    tenantAddress: 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
    landlordName: 'Sarah Connor',
    landlordAddress: 'GBDN6SFO3JOYSHHPIDXV5JQRVBKG5QEDUHG4M5MRKUTZAOSYTRLV3CZW',
    periodMonths: 12,
    monthsRemaining: 7,
    monthlyRent: 2400,
    depositAmount: 4800,
    status: 'active',
    startDate: '2025-11-01',
    endDate: '2026-10-31',
    escrowAddress: 'G_ESCROW_MAPLE_4B_STELLAR_SMART_CONTRACT',
    timeline: [
      { id: 't1', title: 'Lease Created', description: 'Terms defined and digitally initialized.', date: '2025-10-28', type: 'sign' },
      { id: 't2', title: 'Deposit Locked', description: 'Tenant locked 4,800 XLM in smart escrow.', date: '2025-10-29', type: 'deposit' },
      { id: 't3', title: 'Lease Activated', description: 'Keys handed over, lease active.', date: '2025-11-01', type: 'sign' },
      { id: 't4', title: 'Rent Payment #1 Received', description: '2,400 XLM paid to Sarah Connor.', date: '2025-12-01', type: 'payment' },
      { id: 't5', title: 'Rent Payment #2 Received', description: '2,400 XLM paid to Sarah Connor.', date: '2026-01-01', type: 'payment' }
    ]
  },
  {
    id: 'l2',
    propertyId: 'p7',
    propertyTitle: '789 Ocean Ave, Loft 2',
    propertyImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLNMdyQ0dZiMkzMkYo2tLIUlemAFhzbs1e9_gBOwygdSgVuRf_oyyyjKTi89OP1eBHjgPSYE9fcDupweuKepFdqocsXkRFsOy8vrrKFWguG8a8Od-Tuqyisc_8ukj1gXcdSSzJW_hUT8jqbCnvrJCmnScJA-w67W6uoC7NEtX_g3ssWY2kSc55u9Zru-vCd14if0H_RWAqKCAC8L28lyTSU62hmGlKPlPBOfUkhGjzCtoeCd7x2WMsK3NRSsQSJLK_h5bbz-HTjak',
    tenantName: 'Marcus B.',
    tenantAddress: 'GC2NDRKUBP2QJEM54Y3N6NNR6W4LYFAGUVHQKXX4N3KZNVYFZCSW7JTC',
    landlordName: 'RealProp LLC',
    landlordAddress: 'GC3BYYQAM2TWKB7F77BITH4JZ7FT2R3QE5UOYF7X4C2QVMFHXNBIMMQE',
    periodMonths: 6,
    monthsRemaining: 1,
    monthlyRent: 1850,
    depositAmount: 3700,
    status: 'final_month',
    startDate: '2026-01-15',
    endDate: '2026-07-15',
    escrowAddress: 'G_ESCROW_OCEAN_LOFT2_STELLAR_SMART_CONTRACT',
    timeline: [
      { id: 'l2_t1', title: 'Lease Agreement Signed', description: 'Immutable contract written on-chain.', date: '2026-01-10', type: 'sign' },
      { id: 'l2_t2', title: 'Escrow Deposit Secured', description: '3,700 XLM locked in escrow.', date: '2026-01-12', type: 'deposit' },
      { id: 'l2_t3', title: 'Move-in Completed', description: 'Marcus B. moved in.', date: '2026-01-15', type: 'sign' }
    ]
  },
  {
    id: 'l3',
    propertyId: 'p5',
    propertyTitle: 'Garden Studio (Expired)',
    propertyImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAokQspQxrzw1G5ZSBiCnaJRmYKRLkk4K8cKPX0-bcENYeeDXpjYRz1o-rPg4kts1yhRrI2yerHn-HaGc9Rc6i6i0I54N0G-DJplCZCiXKi-yUmBsB-PqyLMaf6vLrH2_wzVHS1Cl8ahzHcK-FPXaUicAN5APCvjjzBaacncTtNN3XOig7mKe6Amqtx8RIaZB9pVvoPVdAGZxWj9AoJ2gB3ZHuvb0sacdXHGCYye5apTjPKzXzUPq4o3R5fWvJB6F6CZfB33VVgX4I',
    tenantName: 'Emily K.',
    tenantAddress: 'GAF2BRPDKRFRTWYMQ2RNVB54NO5YWLQEYKVA2TQQBZIDQ5VESS4YFBML',
    landlordName: 'Sarah Connor',
    landlordAddress: 'GBDN6SFO3JOYSHHPIDXV5JQRVBKG5QEDUHG4M5MRKUTZAOSYTRLV3CZW',
    periodMonths: 6,
    monthsRemaining: 0,
    monthlyRent: 1200,
    depositAmount: 2400,
    status: 'settled',
    startDate: '2025-05-01',
    endDate: '2025-11-01',
    escrowAddress: 'G_ESCROW_GARDEN_STUDIO_STELLAR_SMART_CONTRACT',
    timeline: [
      { id: 'l3_t1', title: 'Agreement Initialized', description: 'Lease contract signed on-chain.', date: '2025-04-28', type: 'sign' },
      { id: 'l3_t2', title: 'Deposit Escrow Locked', description: '2,400 XLM locked.', date: '2025-04-29', type: 'deposit' },
      { id: 'l3_t3', title: 'Lease Completed & Released', description: 'Sarah & Emily approved deposit release.', date: '2025-11-01', type: 'release' }
    ]
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx1',
    hash: '4bc18a421b96a928be3f3818e3d0c9f18e2d4d4200dbf8a7a9cb7e721a9cbf4a',
    type: 'lease_created',
    amount: 0,
    date: '2026-06-23T11:24:00Z',
    status: 'success',
    fromAddress: 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
    toAddress: 'GBDN6SFO3JOYSHHPIDXV5JQRVBKG5QEDUHG4M5MRKUTZAOSYTRLV3CZW'
  },
  {
    id: 'tx2',
    hash: '5dc18a421b96a928be3f3818e3d0c9f18e2d4d4200dbf8a7a9cb7e721a9cbf5b',
    type: 'deposit_locked',
    amount: 4800,
    date: '2026-06-23T08:15:00Z',
    status: 'success',
    fromAddress: 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
    toAddress: 'G_ESCROW_MAPLE_4B_STELLAR_SMART_CONTRACT'
  },
  {
    id: 'tx3',
    hash: '6dc18a421b96a928be3f3818e3d0c9f18e2d4d4200dbf8a7a9cb7e721a9cbf6c',
    type: 'rent_paid',
    amount: 2400,
    date: '2026-06-22T14:32:00Z',
    status: 'success',
    fromAddress: 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
    toAddress: 'GBDN6SFO3JOYSHHPIDXV5JQRVBKG5QEDUHG4M5MRKUTZAOSYTRLV3CZW'
  },
  {
    id: 'tx4',
    hash: '7dc18a421b96a928be3f3818e3d0c9f18e2d4d4200dbf8a7a9cb7e721a9cbf7d',
    type: 'deposit_released',
    amount: 2400,
    date: '2025-11-01T09:00:00Z',
    status: 'success',
    fromAddress: 'G_ESCROW_GARDEN_STUDIO_STELLAR_SMART_CONTRACT',
    toAddress: 'GAF2BRPDKRFRTWYMQ2RNVB54NO5YWLQEYKVA2TQQBZIDQ5VESS4YFBML'
  },
  {
    id: 'tx5',
    hash: '8dc18a421b96a928be3f3818e3d0c9f18e2d4d4200dbf8a7a9cb7e721a9cbf8e',
    type: 'deposit_locked',
    amount: 3700,
    date: '2026-01-12T10:45:00Z',
    status: 'success',
    fromAddress: 'GC2NDRKUBP2QJEM54Y3N6NNR6W4LYFAGUVHQKXX4N3KZNVYFZCSW7JTC',
    toAddress: 'G_ESCROW_OCEAN_LOFT2_STELLAR_SMART_CONTRACT'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Lease Signed',
    description: 'James D. signed the lease for 123 Maple St, Unit 4B',
    time: '2 hours ago',
    read: false,
    type: 'success'
  },
  {
    id: 'n2',
    title: 'Deposit Locked',
    description: 'Marcus B. locked 3,700 XLM in escrow for 789 Ocean Ave, Loft 2',
    time: '5 hours ago',
    read: false,
    type: 'info'
  },
  {
    id: 'n3',
    title: 'Rent Payment Received',
    description: 'Sarah Connor received rent payment of 2,400 XLM from James D.',
    time: 'Yesterday',
    read: true,
    type: 'success'
  },
  {
    id: 'n4',
    title: 'Security Warning',
    description: 'Freighter extension was updated. Verify your keys.',
    time: '2 days ago',
    read: true,
    type: 'warning'
  }
];

export const mockReputation: Reputation = {
  trustScore: 98,
  landlordRating: 4.8,
  tenantRating: 4.9,
  completedLeases: 14,
  paymentSuccessRate: 98,
  disputeHistory: [
    { id: 'dh1', date: '2025-11-01', title: 'Garden Studio Lease Completion', status: 'no_dispute' },
    { id: 'dh2', date: '2025-06-15', title: 'Ocean Ave Loft Water Damage Claim', status: 'resolved' },
    { id: 'dh3', date: '2024-12-01', title: 'Maple St Rental Key Handover', status: 'no_dispute' }
  ],
  reviews: [
    {
      id: 'r1',
      author: 'Marcus B.',
      role: 'tenant',
      rating: 5,
      comment: 'Excellent landlord! Property was in perfect condition. Sarah promptly released the escrow security deposit immediately when I moved out. Highly recommend!',
      date: '2026-02-15'
    },
    {
      id: 'r2',
      author: 'Sarah Connor',
      role: 'landlord',
      rating: 4.9,
      comment: 'Emily was a wonderful tenant. Paid rent on time every single month on the ledger and kept the garden studio clean. Safe and trusted participant.',
      date: '2025-11-02'
    },
    {
      id: 'r3',
      author: 'James D.',
      role: 'tenant',
      rating: 4.8,
      comment: 'Beautiful apartment. Lease creation was super easy using Stellar smart contracts. Minor maintenance issues were addressed quickly off-chain.',
      date: '2025-12-15'
    }
  ]
};
export const defaultWalletAddress = 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3';
