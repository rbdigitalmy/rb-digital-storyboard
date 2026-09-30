import type { WorkflowDefinition } from '../types/index.ts';

export const RB_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'storyboard-universal',
    name: 'Universal Storyboard',
    description: 'Flagship viral TikTok/Reels storyboard engine. High attention, rapid hook, dynamic camera and natural spoken dialogue.',
    category: 'storyboard',
    icon: 'Clapperboard',
    tag: 'Flagship',
    badgeColor: 'bg-red-500/10 text-red-600 border-red-200',
    recommendedDuration: '10s',
    samplePrompt: 'Kopi pra-campuran premium untuk profesional yang perlukan tenaga segera di pejabat'
  },
  {
    id: 'storyboard-pov-hand',
    name: 'POV Hand Product',
    description: 'First-person perspective product interactions. No faces, authentic hands-on demonstration with hyper-focused tactile details.',
    category: 'storyboard',
    icon: 'Hand',
    tag: 'Viral E-commerce',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    recommendedDuration: '10s',
    samplePrompt: 'Serum pencerah kulit wajah dengan tekstur ringan dan droplet dropper emas'
  },
  {
    id: 'storyboard-talking-head',
    name: 'Talking Head High-CTR',
    description: 'Optimized for personal brand, founder stories, expert insights, and direct-to-camera persuasive conversion videos.',
    category: 'storyboard',
    icon: 'Mic',
    tag: 'Founder & Influencer',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
    recommendedDuration: '20s',
    samplePrompt: 'Founder berkongsi rahsia kenapa 90% bisnes gagal dalam tahun pertama dan solusinya'
  },
  {
    id: 'storyboard-asmr',
    name: 'ASMR Sensory Experience',
    description: 'Deep sensory triggers, crisp audio cues, visual macro textures, tap sounds and satisfying close-up moments.',
    category: 'specialized',
    icon: 'Sparkles',
    tag: 'Sensory / Satisfying',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200',
    recommendedDuration: '10s',
    samplePrompt: 'Unboxing fon telinga wireless dengan bunyi peel sticker, snap penutup magnetik dan klik sedap'
  },
  {
    id: 'storyboard-stop-motion',
    name: 'Stop Motion Animation',
    description: 'Playful, rhythmic frame-by-frame motion aesthetic that stops scrollers instantly on TikTok and Reels feeds.',
    category: 'specialized',
    icon: 'Film',
    tag: 'High Retention',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    recommendedDuration: '10s',
    samplePrompt: 'Sneakers tersusun sendiri secara magik keluar dari kotak dan tali kasut ikat secara automatik'
  },
  {
    id: 'storyboard-podcast',
    name: 'Podcast Studio Clip',
    description: 'Simulated high-production podcast setup with multi-camera angles, Shure SM7B mics, moody backlights, and compelling punchlines.',
    category: 'storyboard',
    icon: 'Radio',
    tag: 'Viral Clips',
    badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    recommendedDuration: '20s',
    samplePrompt: 'Dua usahawan bincangkan kelebihan sistem automasi AI untuk bisnes jualan online'
  },
  {
    id: 'cartoon-storyboard',
    name: 'Cartoon Animation Storyboard',
    description: 'Stylized 2D/3D cartoon animation scenes with expressive emotional arcs and exaggerated comic timing.',
    category: 'storyboard',
    icon: 'Smile',
    tag: 'Creative Animation',
    badgeColor: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    recommendedDuration: '20s',
    samplePrompt: 'Kisah seekor kucing comel yang cuba curi snek pemiliknya semasa dia bekerja di laptop'
  },
  {
    id: 'storyboard-chibi',
    name: 'Chibi Kawaii Storyboard',
    description: 'Ultra-cute Japanese anime chibi proportion characters, big expressive eyes, and wholesome high-engagement narratives.',
    category: 'specialized',
    icon: 'Heart',
    tag: 'Kawaii / Japanese',
    badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-200',
    recommendedDuration: '10s',
    samplePrompt: 'Watak mini chibi barista yang gigih sediakan boba milk tea dengan kasih sayang'
  },
  {
    id: 'storyboard-pix',
    name: 'Pixar 3D Cinematic',
    description: 'Pixar-grade 3D rendered character storytelling with volumetric lighting, emotional storytelling and relatable struggles.',
    category: 'specialized',
    icon: 'Tv',
    tag: '3D Pixar Style',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-200',
    recommendedDuration: '20s',
    samplePrompt: 'Robot kecil pembantu rumah yang teruja bila menyambut tuannya balik selepas kerja'
  },
  {
    id: 'storyboard-grafix',
    name: 'Motion Graphics Explainer',
    description: 'Sleek kinetic typography, visual statistics, clean interface mockups, and corporate SaaS product explainers.',
    category: 'storyboard',
    icon: 'LayoutGrid',
    tag: 'SaaS & Tech',
    badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-200',
    recommendedDuration: '20s',
    samplePrompt: 'Sistem invois automatik yang selesaikan masalah lewat bayar untuk syarikat konsultan'
  },
  {
    id: 'storyboard-anthropomorphic',
    name: 'Anthropomorphic Storyboard',
    description: 'Objects or animals behaving as human characters in everyday relatable situations for viral comedic appeal.',
    category: 'specialized',
    icon: 'Compass',
    tag: 'Viral Comedy',
    badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-200',
    recommendedDuration: '10s',
    samplePrompt: 'Secawan kopi pagi yang sedih bila tuannya terlupa minum sebelum sejuk'
  },
  {
    id: 'real-product',
    name: 'Real Product Commercial',
    description: 'Ultra-clean commercial advertising aesthetic with studio lighting, slow motion liquid/particle splashes, and macro textures.',
    category: 'visual_assets',
    icon: 'Package',
    tag: 'Luxury Ads',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200',
    recommendedDuration: '10s',
    samplePrompt: 'Botol minyak wangi mewah dengan titisan air embun dan pantulan cahaya emas waktu senja'
  },
  {
    id: 'real-human',
    name: 'Real Human Portraits & UGC',
    description: 'Authentic photorealistic human visuals with lifelike skin texture, real emotions, natural lighting, and zero AI glossiness.',
    category: 'visual_assets',
    icon: 'User',
    tag: 'Photorealistic',
    badgeColor: 'bg-teal-500/10 text-teal-600 border-teal-200',
    recommendedDuration: '10s',
    samplePrompt: 'Potret wanita bekerjaya Malaysia berumur 28 tahun tersenyum yakin dengan cermin mata moden'
  },
  {
    id: 'realtoon',
    name: 'Realtoon Hybrid Art',
    description: 'A striking blend of photorealism and comic toon detailing, yielding a distinctive modern signature look.',
    category: 'visual_assets',
    icon: 'Palette',
    tag: 'Artistic Hybrid',
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-200',
    recommendedDuration: '10s',
    samplePrompt: 'Model fesyen streetwear KL dengan elemen garisan komik neon yang bercahaya di latar belakang'
  },
  {
    id: 'character-sheet',
    name: 'Character Consistency Sheet',
    description: 'Multi-angle character design sheets (Front, 3/4, Profile, Back, Facial Expressions) to ensure 100% consistent AI video generation.',
    category: 'visual_assets',
    icon: 'Users',
    tag: 'Consistency Asset',
    badgeColor: 'bg-lime-500/10 text-lime-600 border-lime-200',
    recommendedDuration: '10s',
    samplePrompt: 'Maskot Harimau Malaya comel memakai jaket bomber merah dengan pelbagai reaksi muka'
  },
  {
    id: 'kawaii-image',
    name: 'Kawaii Japanese Visuals',
    description: 'Pastel palette, adorable round shapes, sparkling eyes, and warm cozy vibes for lifestyle, merch, and stickers.',
    category: 'visual_assets',
    icon: 'Sun',
    tag: 'Pastel Aesthetic',
    badgeColor: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200',
    recommendedDuration: '10s',
    samplePrompt: 'Roti bakar comel dengan mentega cair yang tersenyum riang di atas pinggan pastel'
  },
  {
    id: 'ootd',
    name: 'OOTD Fashion Aesthetic',
    description: 'Editorial fashion styling, outfit-of-the-day breakdowns, aesthetic transitions, and TikTok trend fashion videos.',
    category: 'visual_assets',
    icon: 'Shirt',
    tag: 'Fashion / Style',
    badgeColor: 'bg-stone-500/10 text-stone-600 border-stone-200',
    recommendedDuration: '10s',
    samplePrompt: 'Baju kurung moden minimalist rona olive green dipadankan dengan selendang chiffon dan handbag kulit'
  },
  {
    id: 'poster',
    name: 'High-Impact Poster Design',
    description: 'Cinematic promotional posters with balanced typography hierarchy, lighting contrast, and striking focal points.',
    category: 'visual_assets',
    icon: 'Image',
    tag: 'Graphic Design',
    badgeColor: 'bg-zinc-500/10 text-zinc-600 border-zinc-200',
    recommendedDuration: '10s',
    samplePrompt: 'Poster pelancaran kursus video kreatif RB Digital dengan elemen 3D dan lampu neon cyberpunk'
  },
  {
    id: 'thumbnail',
    name: 'High-CTR YouTube/TikTok Thumbnail',
    description: 'Designed specifically to trigger curious clicks with intense facial expressions, bold color pops, and high contrast.',
    category: 'visual_assets',
    icon: 'Sparkle',
    tag: 'Click-Through Rate',
    badgeColor: 'bg-red-600/10 text-red-600 border-red-200',
    recommendedDuration: '10s',
    samplePrompt: 'Muka terkejut tengok laptop sambil tunjuk anak panah merah ke carta jualan melonjak 10X'
  }
];
