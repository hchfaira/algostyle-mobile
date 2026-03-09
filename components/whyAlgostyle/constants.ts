import type { Ionicons } from '@expo/vector-icons';

export interface FeatureCard {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  copy: string;
  details: string;
  actions: { label: string; icon?: keyof typeof Ionicons.glyphMap }[];
  badge?: string;
}

export const FEATURES: FeatureCard[] = [
  {
    id: 'outfit-explainer',
    icon: 'sparkles-outline',
    title: 'Why this outfit',
    copy: 'Actionable explanations: why this works and 2 concrete next steps (e.g., "add scarf X", "taper waist Y").',
    details:
      'Every outfit recommendation comes with AI-powered reasoning. Understand the color harmony, formality match, and styling tips. Get 2–3 specific actions to enhance the look or adapt it to different occasions.',
    actions: [
      { label: 'See example', icon: 'arrow-forward' },
      { label: 'Learn more' },
    ],
    badge: '✨ New',
  },
  {
    id: 'capsule-generator',
    icon: 'grid-outline',
    title: 'Create your Capsule',
    copy: 'Optimize a compact set of pieces to maximize outfits. Preview "+N outfits" before you commit.',
    details:
      'Build a minimalist wardrobe with our capsule generator. Select your base pieces and instantly preview how many unique outfits you can create. Refine until you hit your perfect mix of versatility and simplicity.',
    actions: [
      { label: 'Start building', icon: 'play-circle-outline' },
      { label: 'View examples' },
    ],
  },
  {
    id: 'durability-score',
    icon: 'shield-checkmark-outline',
    title: 'Durability Score',
    copy: 'Material + care insights with repair, resell, or care recommendations to extend wear.',
    details:
      'Every garment gets a durability score based on material, construction, and care needs. Receive actionable recommendations: which pieces to repair, which to resell, and how to care for premium items.',
    actions: [
      { label: 'View my scores', icon: 'bar-chart-outline' },
      { label: 'Care tips' },
    ],
  },
  {
    id: 'quick-tryon',
    icon: 'body-outline',
    title: 'Quick Try-On',
    copy: 'Fast client-side try-on with a before/after toggle and share-optimized export for socials.',
    details:
      'Visualize outfits on your body instantly with our lightweight try-on engine. Use before/after toggle to compare, then export as a 9:16 story-ready image to share with friends or save for later.',
    actions: [
      { label: 'Try it now', icon: 'camera-outline' },
      { label: 'Export story' },
    ],
  },
  {
    id: 'remix-suggestions',
    icon: 'layers-outline',
    title: 'Remix this look',
    copy: 'One tap = 3 variants: more casual, more formal, more colorful. Save or apply instantly.',
    details:
      'Stuck on styling? Hit remix to instantly generate 3 alternative versions of any outfit: a casual vibe, a formal upgrade, or a bold color twist. Save the variant you love directly to your wardrobe recommendations.',
    actions: [
      { label: 'Generate variants', icon: 'refresh-outline' },
      { label: 'Save all' },
    ],
  },
  {
    id: 'marketplace',
    icon: 'bag-outline',
    title: 'Sell or Find Similar',
    copy: 'List items quickly or discover similar pieces from marketplaces and local sellers.',
    details:
      'Declutter with confidence. List items to sell in seconds, or search for similar pieces from integrated marketplaces and local sellers. Get price estimates and visibility tips to maximize your listings.',
    actions: [
      { label: 'List to sell', icon: 'add-circle-outline' },
      { label: 'Find similar' },
    ],
  },
  {
    id: 'local-trends',
    icon: 'trending-up-outline',
    title: 'Local Trends',
    copy: 'Hyper-local trends with short "why it\'s trending" explanations and quick add-to-closet action.',
    details:
      'Stay ahead with hyper-local trend insights. See what\'s trending in your city, why it matters, and how to incorporate it into your style. One-tap save to add pieces to your wishlist or wardrobe.',
    actions: [
      { label: 'Explore trends', icon: 'map-outline' },
      { label: 'Follow city' },
    ],
    badge: '🔥 Hot',
  },
];
