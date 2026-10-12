export type Variant = {
  id: string
  label: string
  color: string
  stock: number
}
export type Product = {
  id: string
  name: string
  description: string
  category: string
  price: number
  image: string
  images: string[]
  sourceImage: string
  sourceId: number
  rating: number
  reviewCount: number
  badge: string | null
  featured: boolean
  material: string
  variants: Variant[]
}
export const categories = [
  { id: 'home', name: 'Home & living', description: 'A softer place to land.' },
  {
    id: 'kitchen',
    name: 'Kitchen & dining',
    description: 'Make the everyday a little better.',
  },
  {
    id: 'carry',
    name: 'Everyday carry',
    description: 'Good things, wherever you go.',
  },
]
export const products: Product[] = [
  {
    id: 'ee-47',
    name: 'The reading lamp',
    description:
      'A warm pool of light for the last chapter, a slow evening, or a quiet corner. A sculptural table lamp that makes staying in feel like a plan.',
    category: 'home',
    price: 4800,
    image: '/images/product-47.webp',
    images: ['/images/product-47.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/thumbnail.webp',
    sourceId: 47,
    rating: 4.5,
    reviewCount: 18,
    badge: 'Bestseller',
    featured: true,
    material: 'Decorative base and fabric shade',
    variants: [
      {
        id: 'ee-47-standard',
        label: 'Amber',
        color: '#b99753',
        stock: 9,
      },
      {
        id: 'ee-47-forest',
        label: 'Forest',
        color: '#465748',
        stock: 8,
      },
    ],
  },
  {
    id: 'ee-46',
    name: 'Sculptural planter',
    description:
      'A simple home for a little green. A sculptural planter that adds life to a shelf, side table, or sunlit windowsill.',
    category: 'home',
    price: 2400,
    image: '/images/product-46.webp',
    images: ['/images/product-46.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/home-decoration/plant-pot/thumbnail.webp',
    sourceId: 46,
    rating: 4.6,
    reviewCount: 35,
    badge: 'New arrival',
    featured: true,
    material: 'Decorative planter',
    variants: [
      {
        id: 'ee-46-standard',
        label: 'Slate',
        color: '#555c58',
        stock: 25,
      },
      {
        id: 'ee-46-forest',
        label: 'Forest',
        color: '#465748',
        stock: 8,
      },
    ],
  },
  {
    id: 'ee-45',
    name: 'A little greenery',
    description:
      'A touch of green for shelves and forgotten corners. A decorative plant that brings a little softness to your everyday space.',
    category: 'home',
    price: 1800,
    image: '/images/product-45.webp',
    images: ['/images/product-45.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/thumbnail.webp',
    sourceId: 45,
    rating: 4.7,
    reviewCount: 52,
    badge: null,
    featured: false,
    material: 'Artificial foliage and decorative pot',
    variants: [
      {
        id: 'ee-45-standard',
        label: 'Green',
        color: '#6e8056',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-44',
    name: 'Oak family frame',
    description:
      'Keep your favorite people in the everyday picture. A warm wooden frame for the moments you want to see a little more often.',
    category: 'home',
    price: 3200,
    image: '/images/product-44.webp',
    images: ['/images/product-44.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp',
    sourceId: 44,
    rating: 4.8,
    reviewCount: 69,
    badge: null,
    featured: false,
    material: 'Wood-look decorative frame',
    variants: [
      {
        id: 'ee-44-standard',
        label: 'Oak',
        color: '#bc9064',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-43',
    name: 'The hanging chair',
    description:
      'Your invitation to pause. An airy hanging chair for the corner you always come back to.',
    category: 'home',
    price: 14900,
    image: '/images/product-43.webp',
    images: ['/images/product-43.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp',
    sourceId: 43,
    rating: 4.9,
    reviewCount: 86,
    badge: null,
    featured: false,
    material: 'Woven seat and hanging frame',
    variants: [
      {
        id: 'ee-43-standard',
        label: 'Natural',
        color: '#c7bda9',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-13',
    name: 'Cherry bedside table',
    description:
      'A quiet companion for your bedside. Cherry tones and a practical surface keep your book, lamp, and morning glass close at hand.',
    category: 'home',
    price: 16800,
    image: '/images/product-13.webp',
    images: ['/images/product-13.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp',
    sourceId: 13,
    rating: 4.5,
    reviewCount: 103,
    badge: null,
    featured: false,
    material: 'Cherry-toned wood',
    variants: [
      {
        id: 'ee-13-standard',
        label: 'Cherry',
        color: '#996246',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-14',
    name: 'The everyday chair',
    description:
      'A seat with a little character. A considered silhouette for the desk, the dining table, or a place to sit and think.',
    category: 'home',
    price: 18900,
    image: '/images/product-14.webp',
    images: ['/images/product-14.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp',
    sourceId: 14,
    rating: 4.6,
    reviewCount: 120,
    badge: null,
    featured: false,
    material: 'Upholstered seat and metal base',
    variants: [
      {
        id: 'ee-14-standard',
        label: 'Original',
        color: '#96998b',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-48',
    name: 'Bamboo cooking spoon',
    description:
      'Stir, turn, taste, repeat. A light bamboo cooking spoon for the recipes you know by heart.',
    category: 'kitchen',
    price: 1200,
    image: '/images/product-48.webp',
    images: ['/images/product-48.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp',
    sourceId: 48,
    rating: 4.7,
    reviewCount: 137,
    badge: null,
    featured: false,
    material: 'Bamboo',
    variants: [
      {
        id: 'ee-48-standard',
        label: 'Bamboo',
        color: '#c7a578',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-49',
    name: 'The everyday cup',
    description:
      'For the first sip and the small pause after it. A pared-back aluminium cup with a useful handle and a place in your daily ritual.',
    category: 'kitchen',
    price: 1600,
    image: '/images/product-49.webp',
    images: ['/images/product-49.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp',
    sourceId: 49,
    rating: 4.8,
    reviewCount: 154,
    badge: 'Bestseller',
    featured: true,
    material: 'Aluminium',
    variants: [
      {
        id: 'ee-49-standard',
        label: 'Charcoal',
        color: '#363938',
        stock: 25,
      },
      {
        id: 'ee-49-forest',
        label: 'Forest',
        color: '#465748',
        stock: 8,
      },
    ],
  },
  {
    id: 'ee-50',
    name: 'Midnight whisk',
    description:
      'A little kitchen rhythm. An everyday whisk for batters, dressings, and a slow Sunday breakfast.',
    category: 'kitchen',
    price: 1400,
    image: '/images/product-50.webp',
    images: ['/images/product-50.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/black-whisk/thumbnail.webp',
    sourceId: 50,
    rating: 4.9,
    reviewCount: 171,
    badge: 'New arrival',
    featured: false,
    material: 'Metal whisk with dark handle',
    variants: [
      {
        id: 'ee-50-standard',
        label: 'Black',
        color: '#303633',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-52',
    name: 'Carbon steel wok',
    description:
      'One pan, plenty of possibility. A carbon steel wok for quick dinners and recipes worth sharing.',
    category: 'kitchen',
    price: 5800,
    image: '/images/product-52.webp',
    images: ['/images/product-52.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/thumbnail.webp',
    sourceId: 52,
    rating: 4.5,
    reviewCount: 188,
    badge: null,
    featured: false,
    material: 'Carbon steel',
    variants: [
      {
        id: 'ee-52-standard',
        label: 'Carbon',
        color: '#464b47',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-53',
    name: 'Solid wood chopping board',
    description:
      'The beginning of something good. A wood chopping board that moves naturally from prep time to the center of the table.',
    category: 'kitchen',
    price: 3600,
    image: '/images/product-53.webp',
    images: ['/images/product-53.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/chopping-board/thumbnail.webp',
    sourceId: 53,
    rating: 4.6,
    reviewCount: 205,
    badge: null,
    featured: false,
    material: 'Wood',
    variants: [
      {
        id: 'ee-53-standard',
        label: 'Wood',
        color: '#c79a6d',
        stock: 14,
      },
    ],
  },
  {
    id: 'ee-54',
    name: 'Sunny citrus press',
    description:
      'A brighter start to the day. A cheerful citrus press for a splash in your water or a squeeze over dinner.',
    category: 'kitchen',
    price: 1800,
    image: '/images/product-54.webp',
    images: ['/images/product-54.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/citrus-squeezer-yellow/thumbnail.webp',
    sourceId: 54,
    rating: 4.7,
    reviewCount: 29,
    badge: null,
    featured: false,
    material: 'Kitchen-safe plastic',
    variants: [
      {
        id: 'ee-54-standard',
        label: 'Sunshine',
        color: '#e6bb3e',
        stock: 22,
      },
    ],
  },
  {
    id: 'ee-57',
    name: 'Fine mesh strainer',
    description:
      'The small tool that earns its space. A fine mesh strainer for rinsing, sifting, and getting the little details right.',
    category: 'kitchen',
    price: 1400,
    image: '/images/product-57.webp',
    images: ['/images/product-57.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/fine-mesh-strainer/thumbnail.webp',
    sourceId: 57,
    rating: 4.8,
    reviewCount: 46,
    badge: null,
    featured: false,
    material: 'Stainless steel mesh',
    variants: [
      {
        id: 'ee-57-standard',
        label: 'Steel',
        color: '#b1b6b1',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-59',
    name: 'Everyday drinking glass',
    description:
      'Water on the table. Juice with breakfast. A simple clear glass for the rituals that need no occasion.',
    category: 'kitchen',
    price: 1200,
    image: '/images/product-59.webp',
    images: ['/images/product-59.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/glass/thumbnail.webp',
    sourceId: 59,
    rating: 4.9,
    reviewCount: 63,
    badge: null,
    featured: false,
    material: 'Glass',
    variants: [
      {
        id: 'ee-59-standard',
        label: 'Clear',
        color: '#d9dfd9',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-62',
    name: 'Slow-melt ice tray',
    description:
      'A cooler kind of everyday. An ice tray for after-work drinks, iced coffee, and the first warm afternoon of the year.',
    category: 'kitchen',
    price: 1000,
    image: '/images/product-62.webp',
    images: ['/images/product-62.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/ice-cube-tray/thumbnail.webp',
    sourceId: 62,
    rating: 4.5,
    reviewCount: 80,
    badge: null,
    featured: false,
    material: 'Flexible ice tray',
    variants: [
      {
        id: 'ee-62-standard',
        label: 'Original',
        color: '#a0b3b4',
        stock: 13,
      },
    ],
  },
  {
    id: 'ee-65',
    name: 'Lunch, to go',
    description:
      'Take a little care with lunch. A practical lunch box for yesterday’s good dinner and tomorrow’s midday break.',
    category: 'kitchen',
    price: 2800,
    image: '/images/product-65.webp',
    images: ['/images/product-65.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/lunch-box/thumbnail.webp',
    sourceId: 65,
    rating: 4.6,
    reviewCount: 97,
    badge: 'New arrival',
    featured: false,
    material: 'Reusable food container',
    variants: [
      {
        id: 'ee-65-standard',
        label: 'Original',
        color: '#87939b',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-67',
    name: 'Countertop mug stand',
    description:
      'Make room for the morning ritual. A compact stand that keeps your favorite cups close and your counter a little clearer.',
    category: 'kitchen',
    price: 2400,
    image: '/images/product-67.webp',
    images: ['/images/product-67.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/mug-tree-stand/thumbnail.webp',
    sourceId: 67,
    rating: 4.7,
    reviewCount: 114,
    badge: null,
    featured: false,
    material: 'Freestanding mug rack',
    variants: [
      {
        id: 'ee-67-standard',
        label: 'Original',
        color: '#b1a18b',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-68',
    name: 'The daily skillet',
    description:
      'The pan you reach for first. An everyday skillet for quick breakfasts, simple dinners, and everything in between.',
    category: 'kitchen',
    price: 4200,
    image: '/images/product-68.webp',
    images: ['/images/product-68.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/pan/thumbnail.webp',
    sourceId: 68,
    rating: 4.8,
    reviewCount: 131,
    badge: null,
    featured: false,
    material: 'Metal pan',
    variants: [
      {
        id: 'ee-68-standard',
        label: 'Original',
        color: '#474e48',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-69',
    name: 'Everyday dinner plate',
    description:
      'Set a place for the everyday. A simple dinner plate that lets your food, and your company, take center stage.',
    category: 'kitchen',
    price: 1600,
    image: '/images/product-69.webp',
    images: ['/images/product-69.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/plate/thumbnail.webp',
    sourceId: 69,
    rating: 4.9,
    reviewCount: 148,
    badge: null,
    featured: false,
    material: 'Tableware',
    variants: [
      {
        id: 'ee-69-standard',
        label: 'Original',
        color: '#c5c7b8',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-71',
    name: 'The stock pot',
    description:
      'Good things take a little time. A generous pot with a glass lid, ready for soup and a meal to share.',
    category: 'kitchen',
    price: 6400,
    image: '/images/product-71.webp',
    images: ['/images/product-71.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/thumbnail.webp',
    sourceId: 71,
    rating: 4.5,
    reviewCount: 165,
    badge: null,
    featured: false,
    material: 'Metal pot with glass lid',
    variants: [
      {
        id: 'ee-71-standard',
        label: 'Steel',
        color: '#aeb3ac',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-73',
    name: 'Countertop spice rack',
    description:
      'A little order, a lot of flavor. A countertop rack that brings your everyday ingredients into easy reach.',
    category: 'kitchen',
    price: 3200,
    image: '/images/product-73.webp',
    images: ['/images/product-73.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/spice-rack/thumbnail.webp',
    sourceId: 73,
    rating: 4.6,
    reviewCount: 182,
    badge: null,
    featured: false,
    material: 'Countertop storage rack',
    variants: [
      {
        id: 'ee-73-standard',
        label: 'Original',
        color: '#a2947b',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-75',
    name: 'The serving tray',
    description:
      'Carry the good things together. A serving tray for breakfast, afternoon coffee, or a quiet moment on the sofa.',
    category: 'kitchen',
    price: 2800,
    image: '/images/product-75.webp',
    images: ['/images/product-75.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/tray/thumbnail.webp',
    sourceId: 75,
    rating: 4.7,
    reviewCount: 199,
    badge: null,
    featured: false,
    material: 'Decorative serving tray',
    variants: [
      {
        id: 'ee-75-standard',
        label: 'Original',
        color: '#b0a388',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-76',
    name: 'Wooden rolling pin',
    description:
      'Slow down and make something. A wooden rolling pin for fresh dough and kitchen traditions worth keeping.',
    category: 'kitchen',
    price: 1800,
    image: '/images/product-76.webp',
    images: ['/images/product-76.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/kitchen-accessories/wooden-rolling-pin/thumbnail.webp',
    sourceId: 76,
    rating: 4.8,
    reviewCount: 23,
    badge: null,
    featured: false,
    material: 'Wood',
    variants: [
      {
        id: 'ee-76-standard',
        label: 'Wood',
        color: '#b08a5c',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-154',
    name: 'Weekender sunglasses',
    description:
      'For bright mornings and open weekends. Dark sunglasses with a simple everyday silhouette.',
    category: 'carry',
    price: 3800,
    image: '/images/product-154.webp',
    images: ['/images/product-154.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/thumbnail.webp',
    sourceId: 154,
    rating: 4.9,
    reviewCount: 40,
    badge: null,
    featured: false,
    material: 'Dark frame and tinted lenses',
    variants: [
      {
        id: 'ee-154-standard',
        label: 'Black',
        color: '#323632',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-155',
    name: 'The classic sunglasses',
    description:
      'An easy finishing touch. Classic-shaped sunglasses with a little character for days on the move.',
    category: 'carry',
    price: 4200,
    image: '/images/product-155.webp',
    images: ['/images/product-155.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/sunglasses/classic-sun-glasses/thumbnail.webp',
    sourceId: 155,
    rating: 4.5,
    reviewCount: 57,
    badge: null,
    featured: false,
    material: 'Frame and tinted lenses',
    variants: [
      {
        id: 'ee-155-standard',
        label: 'Original',
        color: '#82715d',
        stock: 1,
      },
    ],
  },
  {
    id: 'ee-172',
    name: 'The day bag',
    description:
      'Your small daily essentials, all together. A blue day bag for a morning errand or a dinner plan.',
    category: 'carry',
    price: 5800,
    image: '/images/product-172.webp',
    images: ['/images/product-172.webp'],
    sourceImage:
      "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp",
    sourceId: 172,
    rating: 4.6,
    reviewCount: 74,
    badge: 'New arrival',
    featured: false,
    material: 'Structured handbag',
    variants: [
      {
        id: 'ee-172-standard',
        label: 'Blue',
        color: '#576e91',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-173',
    name: 'The leather carryall',
    description:
      'A bag to come back to. A leather carryall for your daily essentials and a few little extras.',
    category: 'carry',
    price: 7800,
    image: '/images/product-173.webp',
    images: ['/images/product-173.webp'],
    sourceImage:
      "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/thumbnail.webp",
    sourceId: 173,
    rating: 4.7,
    reviewCount: 91,
    badge: null,
    featured: false,
    material: 'Leather',
    variants: [
      {
        id: 'ee-173-standard',
        label: 'Original',
        color: '#836752',
        stock: 25,
      },
    ],
  },
  {
    id: 'ee-175',
    name: 'The everyday backpack',
    description:
      'Hands free, day ahead. A clean-lined faux leather backpack for your daily essentials, a favorite book, and whatever comes next.',
    category: 'carry',
    price: 6400,
    image: '/images/product-175.webp',
    images: ['/images/product-175.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/womens-bags/white-faux-leather-backpack/thumbnail.webp',
    sourceId: 175,
    rating: 4.8,
    reviewCount: 108,
    badge: 'Bestseller',
    featured: true,
    material: 'Faux leather',
    variants: [
      {
        id: 'ee-175-standard',
        label: 'Chalk',
        color: '#e3e0d4',
        stock: 25,
      },
      {
        id: 'ee-175-forest',
        label: 'Forest',
        color: '#465748',
        stock: 8,
      },
    ],
  },
  {
    id: 'ee-176',
    name: 'The city tote',
    description:
      'A simple companion for a full day. A black city tote with room for the things you like to keep close.',
    category: 'carry',
    price: 5400,
    image: '/images/product-176.webp',
    images: ['/images/product-176.webp'],
    sourceImage:
      'https://cdn.dummyjson.com/product-images/womens-bags/women-handbag-black/thumbnail.webp',
    sourceId: 176,
    rating: 4.9,
    reviewCount: 125,
    badge: null,
    featured: false,
    material: 'Structured handbag',
    variants: [
      {
        id: 'ee-176-standard',
        label: 'Black',
        color: '#323632',
        stock: 11,
      },
      {
        id: 'ee-176-forest',
        label: 'Forest',
        color: '#465748',
        stock: 8,
      },
    ],
  },
]
