import { db, readDb, writeDb } from '../db';
import { ResearchPipeline } from './research-pipeline';
import { AiProvider } from '../providers/ai-provider';
import {
  AutopilotConfig,
  AutopilotDiscoveredItem,
  AutopilotSector,
  AutopilotStatus,
  NicheType,
  BusinessModel,
  getCountryTierInfo,
} from '../providers/types';

interface CandidateSeedTemplate {
  seed: string;
  nicheName: string;
  sector: AutopilotSector;
  sectorLabel: string;
  nicheType: NicheType;
  businessModel: BusinessModel;
  country: string;
  rpmRange: string;
  whyUntapped: string;
  recommendedAsset: string;
}

const AUTOPILOT_CANDIDATE_BANK: CandidateSeedTemplate[] = [
  // 1. Challenger Brands (Fast $500/mo, zero AI overview, low DR anomalies)
  {
    seed: 'popeyes menu prices',
    nicheName: 'Popeyes Menu Prices & Allergen Specs',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$38 - $52 RPM',
    whyUntapped: 'DR 0-5 fan blogs rank above official slow PDF menus. High search demand for fast food price breakdowns.',
    recommendedAsset: 'Programmatic Menu & Calorie Database (500+ items)',
  },
  {
    seed: 'starbucks preise',
    nicheName: 'Starbucks Preise & Kalorien',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'Germany',
    rpmRange: '$32 - $48 RPM',
    whyUntapped: 'Official German site lacks unified price tables. DR 8 micro-site captures 35k monthly visits without AI Overview compression.',
    recommendedAsset: 'Programmatic Price Matrix with Size Switcher',
  },
  {
    seed: 'little caesars menu with prices',
    nicheName: 'Little Caesars Pizza Calories & Dimensions',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$34 - $46 RPM',
    whyUntapped: 'Low competition for exact slice-by-slice calorie calculators; massive search volume in US Tier 1 states.',
    recommendedAsset: 'Single-Page Interactive Slice Calculator',
  },
  {
    seed: 'tim hortons nutrition',
    nicheName: 'Tim Hortons Drink Customizer Calories',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'Canada',
    rpmRange: '$30 - $44 RPM',
    whyUntapped: 'Massive Canadian search volume with only outdated Reddit threads and slow corporate PDF tables ranking.',
    recommendedAsset: 'Custom Drink Builder & Calorie Estimator',
  },
  {
    seed: 'culvers flavor of the day',
    nicheName: "Culver's Custard Flavor Tracker & Nutrition",
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$32 - $45 RPM',
    whyUntapped: 'Midwest US cult following searching daily for flavor rotations with thin local competitor pages.',
    recommendedAsset: 'Daily Flavor Push Tracker & Nutri-Guide',
  },
  {
    seed: 'raising canes sauce calories',
    nicheName: "Raising Cane's Nutrition & Secret Sauce Ratios",
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$35 - $48 RPM',
    whyUntapped: 'Extreme cult following in US colleges. DR 4 fan sites capturing 60,000+ monthly visits on dipping sauce calorie breakdown.',
    recommendedAsset: 'Sauce Duplicator & Combo Calorie Calculator',
  },
  {
    seed: 'dutch bros secret menu',
    nicheName: 'Dutch Bros Secret Menu & Caffeine Matrix',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$36 - $50 RPM',
    whyUntapped: 'Hundreds of rebel secret drinks with zero official caffeine charts. Teen and driver traffic searching daily.',
    recommendedAsset: 'Drink Customizer & Caffeine Level Filter',
  },
  {
    seed: 'waffle house nutrition',
    nicheName: 'Waffle House Hashbrown Customizer & Prices',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$32 - $46 RPM',
    whyUntapped: 'Official brand has zero online nutrition builder. Scattered Yelp pictures rank in Top 5.',
    recommendedAsset: 'Interactive Hashbrown Topping Builder',
  },
  {
    seed: 'nandos calories',
    nicheName: "Nando's Peri-Peri Heat Guide & Macro Specs",
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United Kingdom',
    rpmRange: '$30 - $44 RPM',
    whyUntapped: 'Huge UK gym & student audience searching for high-protein Nando order macros. Low authority UK blogs dominate.',
    recommendedAsset: 'High-Protein Nandos Meal Selector',
  },
  {
    seed: 'crumbl cookies calories',
    nicheName: 'Crumbl Cookies Weekly Flavor Calorie Tracker',
    sector: 'challenger_brands',
    sectorLabel: 'Challenger Brand Menus',
    nicheType: 'menu',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$34 - $48 RPM',
    whyUntapped: 'Viral Sunday night flavor drops create massive recurring weekly search spikes. 85k monthly searches.',
    recommendedAsset: 'Weekly Cookie Flavor Archive & Calorie Splitter',
  },

  // 2. Programmatic Data & Specs (Zero AI Overview risk, high ad RPM)
  {
    seed: 'tesla model 3 wheel specs',
    nicheName: 'Tesla Rim Dimensions & Bolt Patterns',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$36 - $52 RPM',
    whyUntapped: 'Forum threads rank #1-#3. Users want instant search filter for aftermarket wheel clearance without scrolling threads.',
    recommendedAsset: 'Programmatic EV Wheel Fitment Matrix (300+ models)',
  },
  {
    seed: 'ford f150 bolt pattern',
    nicheName: 'Ford F-150 Lug Torque & Bolt Guide',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$38 - $50 RPM',
    whyUntapped: 'High intent DIY truck owners seeking exact torque specs by year. Clean table layout beats bloated auto blogs.',
    recommendedAsset: 'Year-by-Year Torque Spec Database',
  },
  {
    seed: 'shipping container dimensions',
    nicheName: 'Shipping Container Dimension Specs',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United Kingdom',
    rpmRange: '$35 - $48 RPM',
    whyUntapped: 'High-ticket B2B container modification lead gen combined with programmatic high-CTR spec queries.',
    recommendedAsset: 'Interactive Container Mod Sizing Hub',
  },
  {
    seed: 'lego brick weight',
    nicheName: 'Lego Weight & Sorting Dimensions',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United Kingdom',
    rpmRange: '$28 - $42 RPM',
    whyUntapped: 'Resellers buy bulk Lego by weight. Zero dedicated clean calculators exist; only obscure 2012 forum posts.',
    recommendedAsset: 'Programmatic Bulk Brick Weight Calculator',
  },
  {
    seed: 'wire gauge ampacity chart',
    nicheName: 'Wire Gauge Ampacity & NEC Voltage Drop Table',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$42 - $58 RPM',
    whyUntapped: 'Electricians and solar DIYers require quick lookup charts by distance and conduit type. High RPM trade traffic.',
    recommendedAsset: 'Programmatic Wire Sizing & Drop Calculator',
  },
  {
    seed: 'lifepo4 voltage chart',
    nicheName: 'LiFePO4 Voltage State-of-Charge Table',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$40 - $55 RPM',
    whyUntapped: 'Off-grid solar and RV owners need exact 12V/24V/48V voltage to percentage tables. Zero AI overview compression.',
    recommendedAsset: 'Interactive Battery SoC Lookup Matrix',
  },
  {
    seed: 'solar panel dimensions',
    nicheName: 'Solar Panel Dimensions & Wattage Database',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'Australia',
    rpmRange: '$44 - $62 RPM',
    whyUntapped: 'High-ticket solar installer lead generation with programmatic dimension lookups for 400+ panel brands.',
    recommendedAsset: 'Roof Layout Fitting Tool & Brand Spec Hub',
  },
  {
    seed: 'mini split sizing chart',
    nicheName: 'Ductless Mini-Split BTU Sizing Matrix',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United States',
    rpmRange: '$48 - $68 RPM',
    whyUntapped: 'HVAC replacement intent generates $80-$150 contractor leads per conversion. Competitor sites have cluttered generic calculators.',
    recommendedAsset: 'Zone-by-Zone Mini-Split Sizing Engine',
  },
  {
    seed: 'pallet rack capacity chart',
    nicheName: 'Industrial Pallet Rack Load Capacity Specs',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United States',
    rpmRange: '$40 - $56 RPM',
    whyUntapped: 'Warehouse managers looking for OSHA-compliant weight ratings by beam length and gauge. B2B lead generation goldmine.',
    recommendedAsset: 'Programmatic Beam Capacity Sizer',
  },
  {
    seed: 'grease trap sizing chart',
    nicheName: 'Restaurant Grease Trap Sizing Chart GPM',
    sector: 'programmatic_data',
    sectorLabel: 'Programmatic Specs',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United States',
    rpmRange: '$45 - $65 RPM',
    whyUntapped: 'Commercial plumbing code compliance queries with near-zero modern competitor sites. Plumbers rely on grainy 1990s PDF tables.',
    recommendedAsset: 'Fixture Unit to GPM Trap Sizing Tool',
  },

  // 3. Micro Utility Calculators & Converters
  {
    seed: 'autophagy calculator',
    nicheName: 'Intermittent Fasting & Autophagy Calculator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$40 - $55 RPM',
    whyUntapped: 'Zero AI Overview risk due to user input requirements. High repeat usage and display ad RPMs in wellness tier.',
    recommendedAsset: 'Single-Page Responsive Fasting App',
  },
  {
    seed: 'epoxy resin calculator',
    nicheName: 'Epoxy Resin Mix Ratio & SqFt Calculator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'Australia',
    rpmRange: '$34 - $48 RPM',
    whyUntapped: 'Woodworkers and crafters need exact ounce/gram mix ratios. High affiliate conversions on resin kits and pigments.',
    recommendedAsset: 'Interactive Epoxy & Mold Casting Hub',
  },
  {
    seed: 'concrete slab calculator',
    nicheName: 'Concrete Slab Yardage & Bag Estimator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United States',
    rpmRange: '$42 - $58 RPM',
    whyUntapped: 'High-value home improvement traffic. Generates high-paying local concrete delivery leads ($50-$120 per lead).',
    recommendedAsset: 'Interactive Yardage Calculator with Contractor Leads',
  },
  {
    seed: 'crochet yarn calculator',
    nicheName: 'Crochet Yarn Skein & Yardage Estimator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$28 - $40 RPM',
    whyUntapped: 'Crafters search millions of times a month before starting baby blankets and afghans. Amazon affiliate yarn sales.',
    recommendedAsset: 'Yarn Weight to Skein Converter Tool',
  },
  {
    seed: 'aquarium co2 calculator',
    nicheName: 'Aquarium CO2 Bubble Rate & Drop Checker Sizer',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$32 - $46 RPM',
    whyUntapped: 'Aquascaping hobbyists buy high-ticket pressurized CO2 regulators and solenoid valves ($150-$400). Low competition.',
    recommendedAsset: 'Tank Volume to CO2 PPM Calculator',
  },
  {
    seed: 'lawn fertilizer calculator',
    nicheName: 'Lawn Spreader Setting & N-P-K Rate Calculator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$36 - $50 RPM',
    whyUntapped: 'Homeowners struggle to calibrate Scott vs Echo spreader settings for nitrogen lbs per 1,000 sq ft.',
    recommendedAsset: 'Spreader Model Dial Matcher & Fertilizer Tool',
  },
  {
    seed: 'sourdough calculator',
    nicheName: 'Sourdough Hydration & Baker Math Calculator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United Kingdom',
    rpmRange: '$30 - $44 RPM',
    whyUntapped: 'Artisan bread baking craze. Users calculate starter percentage and hydration ratios on mobile in the kitchen.',
    recommendedAsset: 'Interactive Flour & Starter Scaling App',
  },
  {
    seed: 'board foot calculator',
    nicheName: 'Lumber Board Foot & Project Cut Calculator',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$35 - $48 RPM',
    whyUntapped: 'Cabinetmakers and hobbyists need fast board-foot conversion from linear inches with hardwood price multipliers.',
    recommendedAsset: 'Hardwood Cutlist & Board Foot Tool',
  },
  {
    seed: 'resistor color code calculator',
    nicheName: 'Resistor Color Band & SMD Code Decoder',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$32 - $45 RPM',
    whyUntapped: 'Electronics engineering and hobbyist Arduino builders. High daily student and technician tool traffic.',
    recommendedAsset: 'Visual Ring Color Selector & Reverse Finder',
  },
  {
    seed: 'generator wattage calculator',
    nicheName: 'Emergency Generator Wattage Sizing Tool',
    sector: 'micro_calculators',
    sectorLabel: 'Micro Utility Calculators',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$48 - $68 RPM',
    whyUntapped: 'High surge season (hurricanes/winter storms) with massive affiliate commissions on $800-$3,500 whole-house generators.',
    recommendedAsset: 'Appliance Running vs Starting Watt Sizer',
  },

  // 4. High-Margin Nano-Affiliate & Low-DR Anomalies
  {
    seed: 'inflatable fishing kayak',
    nicheName: 'Inflatable Kayak Fishing & Motor Mounts',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$35 - $48 RPM',
    whyUntapped: 'High ticket boat setups ($600-$1,500) with 6-8% affiliate commissions. DR 14 site ranks #2 with 3.2k visits.',
    recommendedAsset: 'Buyer Review Hub & DIY Rigging Silos',
  },
  {
    seed: 'lever espresso machine',
    nicheName: 'Lever Espresso Machine Mods & Parts',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$38 - $52 RPM',
    whyUntapped: 'Enthusiast home baristas purchasing $200+ brass pistons and pressure gauges. Very low DR competitor presence.',
    recommendedAsset: 'Specialized Modding Guide & Part Directory',
  },
  {
    seed: 'diy cold plunge',
    nicheName: 'DIY Cold Plunge & Chiller Setups',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$45 - $60 RPM',
    whyUntapped: 'Massive viral wellness trend. High ticket water chillers ($800-$2,000) with 8-10% merchant affiliate payouts.',
    recommendedAsset: 'DIY Cold Plunge Blueprint & Parts Matrix',
  },
  {
    seed: 'laser engraver settings',
    nicheName: 'Laser Engraver Tumbler Jigs & Settings Matrix',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$40 - $55 RPM',
    whyUntapped: 'Etsy makers buying laser machines ($500-$1,200) seeking speed/power settings for stainless steel and wood.',
    recommendedAsset: 'Material Speed/Power Database & Jig Hub',
  },
  {
    seed: 'micro camper van',
    nicheName: 'Micro-Camper Van Foam & Electrical Kits',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$42 - $58 RPM',
    whyUntapped: 'Small SUV/minivan campers converting vehicles on a budget. High affiliate payouts on 12V fridges and folding mattresses.',
    recommendedAsset: 'Vehicle Model Modular Build Blueprints',
  },
  {
    seed: '3d printer enclosure',
    nicheName: '3D Printer Enclosure & HEPA Ventilation Guide',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$36 - $50 RPM',
    whyUntapped: 'ABS and nylon 3D printing enthusiasts buying inline duct fans and carbon filters. Low DR hobbyist niche.',
    recommendedAsset: 'Enclosure Parts List & VOC Sensor Hub',
  },
  {
    seed: 'leather craft tools',
    nicheName: 'Leatherworking Hand Tool Specs & Stitching Jigs',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$32 - $46 RPM',
    whyUntapped: 'Crafters purchasing Japanese and French edge bevelers and pricking irons ($80-$300). Almost no dedicated niche authority sites.',
    recommendedAsset: 'Tool Sizing Guide & Pattern Directory',
  },
  {
    seed: 'telescope eyepieces',
    nicheName: 'Telescope Eyepiece Sizing & True Field Calculator',
    sector: 'nano_affiliate',
    sectorLabel: 'Nano-Affiliate Gear',
    nicheType: 'affiliate',
    businessModel: 'affiliate',
    country: 'United Kingdom',
    rpmRange: '$38 - $54 RPM',
    whyUntapped: 'Stargazers buying $150-$400 Tele Vue eyepieces and Barlow lenses. Zero AI overview threat for optical math.',
    recommendedAsset: 'Interactive Telescope to Eyepiece Matcher',
  },

  // 5. Marketplace Pattern Replication (Flippa / Empire Flippers)
  {
    seed: 'commercial coffee machine',
    nicheName: 'Commercial Appliance Power & Wattage Specs',
    sector: 'marketplace_templates',
    sectorLabel: 'Marketplace Blueprint',
    nicheType: 'utility',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$38 - $50 RPM',
    whyUntapped: 'Direct replication of a $42k Flippa exit site. High programmatic search density across commercial restaurant gear.',
    recommendedAsset: '500+ Page Programmatic Wattage Database',
  },
  {
    seed: 'trailer tire pressure chart',
    nicheName: 'Trailer Tire PSI & Axle Load Matrix',
    sector: 'marketplace_templates',
    sectorLabel: 'Marketplace Blueprint',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$36 - $48 RPM',
    whyUntapped: 'RV, boat, and utility trailer haulers checking exact PSI specs before road trips. Bulletproof against AI Overview.',
    recommendedAsset: 'Tire Capacity Matrix & Replacement Buyer Guide',
  },
  {
    seed: 'kitchen hood cfm calculator',
    nicheName: 'Commercial Kitchen Exhaust Hood CFM Sizer',
    sector: 'marketplace_templates',
    sectorLabel: 'Marketplace Blueprint',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United States',
    rpmRange: '$48 - $68 RPM',
    whyUntapped: 'Restaurant owners and contractors calculating NFPA 96 code CFM airflow for cooking equipment.',
    recommendedAsset: 'Hood Size to Make-Up Air CFM Sizer',
  },
  {
    seed: 'forklift mast height',
    nicheName: 'Forklift Mast Lowered Height & Clearance Specs',
    sector: 'marketplace_templates',
    sectorLabel: 'Marketplace Blueprint',
    nicheType: 'utility',
    businessModel: 'lead_gen',
    country: 'United States',
    rpmRange: '$42 - $60 RPM',
    whyUntapped: 'Logistics purchasers verifying shipping container doorway clearance. High value equipment leasing leads.',
    recommendedAsset: 'Warehouse Forklift Dimension Sizer',
  },

  // 6. Fast-Mover Seed Families (DR < 5, Age < 1 Yr, Traffic 15k-150k+)
  {
    seed: 'monday morning blessings',
    nicheName: 'Weekly Morning Blessings & Prayers Hub',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'information',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$35 - $48 RPM',
    whyUntapped: 'Fast-Mover Replication: High viral search demand. Fresh DR 2-4 sites capturing 150k+ monthly traffic with high social shareability.',
    recommendedAsset: 'Topical Compression Blog (8 Dense Pillar Articles vs 14 Competitor Posts)',
  },
  {
    seed: 'sarcastic replies',
    nicheName: 'Clever Replies & Sarcastic Comebacks Guide',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'information',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$32 - $44 RPM',
    whyUntapped: 'Extreme engagement and zero AI Overview threat. Users browse dozens of situational comeback lists, giving high time-on-page.',
    recommendedAsset: 'Categorized Comebacks & Response Directory',
  },
  {
    seed: 'aesthetic anime pfp',
    nicheName: 'Aesthetic Profile Pictures & Matching Avatars',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'information',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$28 - $40 RPM',
    whyUntapped: 'Massive TikTok and Discord organic search velocity. Young DR 3 websites ranking in under 120 days.',
    recommendedAsset: 'High-Res Download Gallery with One-Click Crop',
  },
  {
    seed: 'barndominium floor plans',
    nicheName: 'Barndominium & Tiny Home Layout Blueprints',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$45 - $60 RPM',
    whyUntapped: 'High commercial intent with architectural plan affiliate sales ($50-$200 commission per blueprint purchase).',
    recommendedAsset: 'Interactive Floor Plan Viewer & Dimension Filter',
  },
  {
    seed: 'mrbeast net worth',
    nicheName: 'Creator Net Worth & Revenue Breakdown Engine',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'information',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$34 - $48 RPM',
    whyUntapped: 'Fast-Mover Entity Family: Viral biographical queries where young DR 1-3 fan sites outrank legacy portals by giving clean tables.',
    recommendedAsset: 'Creator Income & Asset Valuation Matrix',
  },
  {
    seed: 'anniversary quotes for parents',
    nicheName: 'Milestone Anniversary Quotes & Heartfelt Wishes',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'information',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$32 - $46 RPM',
    whyUntapped: 'High emotion, evergreen search volume. Users copy text messages and card messages directly.',
    recommendedAsset: 'Curated Card Quotes & Shareable Image Generator',
  },
  {
    seed: 'prayers for healing',
    nicheName: 'Daily Healing Prayers & Comfort Scriptures',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'information',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$35 - $48 RPM',
    whyUntapped: 'Massive search demand in US Sunbelt states. 300-day old DR 2 sites capturing over 90,000 monthly visitors.',
    recommendedAsset: 'Topical Prayer Silos & Printable Daily Verses',
  },
  {
    seed: 'dark academia pfp',
    nicheName: 'Dark Academia Avatars & Profile Pictures',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'information',
    businessModel: 'ads',
    country: 'United States',
    rpmRange: '$26 - $38 RPM',
    whyUntapped: 'Huge Gen-Z organic search volume for aesthetic social media profiles. Rankable with zero backlinks in 45 days.',
    recommendedAsset: 'Categorized Image Gallery & Avatar Grid',
  },
  {
    seed: 'container cabin plans',
    nicheName: 'Container Cabin Layouts & DIY Architectural Specs',
    sector: 'fast_mover_viral_seeds',
    sectorLabel: 'Fast-Mover Viral',
    nicheType: 'utility',
    businessModel: 'affiliate',
    country: 'United States',
    rpmRange: '$44 - $60 RPM',
    whyUntapped: 'High commercial intent blueprint sales combined with DIY off-grid builder traffic.',
    recommendedAsset: 'Container Blueprint Catalog & Framing Dimension Tool',
  },
];

export class AutopilotEngine {
  private static liveLogs: Array<{ id: string; timestamp: string; message: string; level: 'info' | 'success' | 'warn' }> = [
    {
      id: 'log_ap_init',
      timestamp: new Date().toISOString(),
      message: 'Autonomous Autopilot Radar Engine initialized. Scouting Tier 1 markets for DR 0-15 anomalies.',
      level: 'info',
    },
  ];

  public static addLiveLog(message: string, level: 'info' | 'success' | 'warn' = 'info') {
    this.liveLogs.unshift({
      id: `ap_log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      message,
      level,
    });
    if (this.liveLogs.length > 50) {
      this.liveLogs = this.liveLogs.slice(0, 50);
    }
  }

  /**
   * Generates dynamic candidate seeds using AI or curations
   */
  public static async scoutCandidates(
    count = 3,
    sector?: AutopilotSector,
    forceAi = false
  ): Promise<CandidateSeedTemplate[]> {
    const config = db.getAutopilotConfig();
    const activeSectors = sector ? [sector] : config.selectedSectors;
    const candidates: CandidateSeedTemplate[] = [];

    // 1. Get already discovered seeds for deduplication
    const discovered = db.getAutopilotDiscovered();
    const discoveredSet = new Set(discovered.map((d) => d.seedKeyword.toLowerCase().trim()));

    // 2. Filter available bank templates not yet discovered
    const unvisitedBank = AUTOPILOT_CANDIDATE_BANK.filter(
      (item) => activeSectors.includes(item.sector) && !discoveredSet.has(item.seed.toLowerCase().trim())
    );

    // 3. If forceAi or unvisitedBank is low, use AI generation with randomized theme prompts
    const shouldInvokeAi = forceAi || unvisitedBank.length < count || Math.random() > 0.35;

    if (shouldInvokeAi) {
      try {
        const THEMES = [
          'Fast-Mover Viral Patterns: Net worth / YouTube income breakdowns, heartfelt blessings & morning prayers, witty comeback replies, aesthetic avatar/DP collections, barndominium/tiny home architectural floor plans',
          'Challenger Food Brands: Regional coffee chains, secret menu drink calories, allergen tables, fast casual protein customizers (Dutch Bros, Waffle House, Raising Canes, Nandos, Crumbl, Greggs, Popeyes)',
          'Programmatic Specs & Dimensions: EV battery discharge curves, solar panel roof clearance dimensions, trailer axle load tables, commercial wire gauges, pallet rack load capacities, container dimensions',
          'Specialized Micro Calculators: Aquarium CO2 bubble rates, epoxy resin mix ratios, sourdough hydration formulas, crochet yarn yardage, lawn spreader calibrations, board-foot lumber pricing',
          'High-Margin Nano-Affiliate: Inflatable kayak fishing rigs, lever espresso machine brass mods, DIY cold plunge chillers, laser engraver tumbler jigs, micro-camper van conversion kits',
          'Marketplace & B2B Exit Blueprints: Commercial restaurant grease trap GPM sizing, exhaust hood CFM airflow, electric forklift doorway mast clearances, industrial generator backup wattage',
        ];

        const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
        const targetCountries = ['United States', 'Germany', 'United Kingdom', 'Canada', 'Australia'];
        const randomCountry = targetCountries[Math.floor(Math.random() * targetCountries.length)];

        const prompt = `You are an elite Autonomous Micro-Niche Scout for an advanced SEO research platform.
Generate ${count} completely novel, highly specific, untapped micro-niche ideas.
Do NOT generate generic "blog guides" or basic "calculators".
Focus on real-world untapped search queries where DR 0-10 young websites can rank and capture high-RPM organic traffic without AI Overview competition.

CRITICAL SEED KEYWORD RULES:
1. The "seed" query MUST be a concise 2-to-4 word real search term with GENUINE monthly search volume (10,000 to 100,000+ monthly searches in Tier 1 markets).
2. NEVER generate long 6-to-10 word conversational sentences (e.g. NEVER write "electric forklift mast height and container clearance" or "how to calculate mini split btu for attic rooms"). Real users search short queries like "forklift mast height", "mini split btu calculator", "popeyes menu prices", "monday morning blessings", "diy cold plunge".
3. Must be high-commercial or high-RPM programmatic/utility demand.

Target Focus Theme for this batch:
${randomTheme}

Target Country: ${randomCountry} (Tier 1 high RPM)

Return valid JSON array:
[
  {
    "seed": "concise 2-4 word real search query (e.g. mini split btu calculator, or sarcastic comeback replies)",
    "nicheName": "Clean Professional Name",
    "sector": "${sector || 'challenger_brands'}",
    "sectorLabel": "Sector Label",
    "nicheType": "utility",
    "businessModel": "ads",
    "country": "${randomCountry}",
    "rpmRange": "$35 - $55 RPM",
    "whyUntapped": "Explain specific competitor flaw (e.g. legacy slow PDF menus, outdated 2012 forums, or thin generic pages) and why fresh DR 0-5 sites win",
    "recommendedAsset": "Specific asset (e.g. Programmatic 500+ URL Matrix, Single-Page Interactive Sizer, or 8-Pillar Compression Blog)"
  }
]`;

        const aiCandidates = await AiProvider.generateJson<CandidateSeedTemplate[]>(prompt);
        if (Array.isArray(aiCandidates) && aiCandidates.length > 0) {
          for (const item of aiCandidates) {
            if (item && item.seed && !discoveredSet.has(item.seed.toLowerCase().trim())) {
              candidates.push({
                ...item,
                sector: (item.sector as AutopilotSector) || sector || 'programmatic_data',
                nicheType: (item.nicheType as NicheType) || 'utility',
                businessModel: (item.businessModel as BusinessModel) || 'ads',
              });
            }
          }
        }
      } catch (e: any) {
        console.warn('AI Scout generation fallback to candidate bank:', e.message);
      }
    }

    // 4. Fill remainder from unvisited bank
    if (candidates.length < count) {
      const shuffled = [...unvisitedBank].sort(() => 0.5 - Math.random());
      for (const item of shuffled) {
        if (candidates.length >= count) break;
        candidates.push(item);
      }
    }

    // 5. Ultimate fallback if whole bank was already visited
    if (candidates.length < count) {
      const allShuffled = [...AUTOPILOT_CANDIDATE_BANK]
        .filter((item) => activeSectors.includes(item.sector))
        .sort(() => 0.5 - Math.random());
      for (const item of allShuffled) {
        if (candidates.length >= count) break;
        candidates.push(item);
      }
    }

    return candidates.slice(0, count);
  }

  /**
   * Runs an autonomous hunting batch without requiring any human seed or URL.
   */
  public static async runAutonomousBatch(options: {
    batchSize?: number;
    sector?: AutopilotSector;
    tier?: 'tier1' | 'tier2';
    userId?: string;
    forceAiDiscovery?: boolean;
  } = {}): Promise<{
    success: boolean;
    discoveredItems: AutopilotDiscoveredItem[];
    summary: string;
  }> {
    const config = db.getAutopilotConfig();
    const batchSize = options.batchSize || 3;
    const userId = options.userId || 'usr_admin_01';

    this.addLiveLog(
      `Autonomous Radar Cycle launched${options.forceAiDiscovery ? ' [✨ AI Novelty Brainstorm Mode]' : ''}. Scouting ${batchSize} diverse micro-niche candidates across 10+ industries...`,
      'info'
    );

    // 1. Scout Candidate Seeds Autonomously
    const candidatePool = await this.scoutCandidates(batchSize, options.sector, options.forceAiDiscovery);
    const discoveredItems: AutopilotDiscoveredItem[] = [];

    this.addLiveLog(`Scouted ${candidatePool.length} candidate seeds across Tier 1 markets. Executing 15-phase SEBT-NEXT analysis...`, 'info');

    // 2. Process each candidate through the 15-phase validation pipeline
    for (const candidate of candidatePool) {
      try {
        this.addLiveLog(`[Deep Scan] Analyzing candidate: "${candidate.seed}" (${candidate.country})...`, 'info');

        // Execute full 15-phase pipeline
        const report = await ResearchPipeline.execute({
          seedKeyword: candidate.seed,
          nicheType: candidate.nicheType,
          businessModel: candidate.businessModel,
          targetCountry: candidate.country,
          language: candidate.country === 'Germany' ? 'German' : 'English',
          minSv: 400,
          maxKd: 40,
          userId,
        });

        const tierInfo = getCountryTierInfo(candidate.country);
        const weakComps = report.serp.competitors.filter((c) => c.isWeakCompetitor || c.dr < 20);
        const lowestWeakDr = weakComps.length > 0 ? Math.min(...weakComps.map((c) => c.dr)) : 18;

        // Save research run to database
        const researchRecord = {
          id: `res_ap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          seedKeyword: candidate.seed,
          nicheType: candidate.nicheType,
          businessModel: candidate.businessModel,
          targetCountry: candidate.country,
          language: candidate.country === 'Germany' ? 'German' : 'English',
          status: 'completed' as const,
          progress: 100,
          currentPhase: 15,
          viabilityScore: report.overallViabilityScore,
          verdict: report.verdict,
          dataConfidence: report.dataConfidenceScore,
          searchOrigin: 'auto_hunter' as const,
          executedBy: 'Auto Hunter Radar Agent',
          deductions: {
            summary: `Auto Hunter autonomous radar scan identified ${weakComps.length} low DR competitors (Lowest DR ${lowestWeakDr}). ${candidate.whyUntapped}`,
            weakCompetitorsFound: weakComps.length,
            lowestCompetitorDr: lowestWeakDr,
            zeroClickImmune: !report.serp.aiOverviewPresent,
            aiOverviewActive: report.serp.aiOverviewPresent,
            countryTier: tierInfo.tier,
            estimatedRpm: candidate.rpmRange || `$${tierInfo.rpmRange[0]} - $${tierInfo.rpmRange[1]} RPM`,
            recommendedAsset: candidate.recommendedAsset || 'Programmatic Database Hub (500+ URLs)',
            estimatedMonthlyRevenue: report.monetization.estimatedMonthlyRevenueRange,
            topKeyReasons: report.keyReasons.slice(0, 3),
            keyRisks: report.mainRisks.slice(0, 2),
            expansionCount: report.multiCountryExpansions?.length || 0,
          },
          report,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.saveResearch(researchRecord);

        // Auto-save to Vault if meets threshold
        let autoSaved = false;
        if (config.autoSaveToVault && report.overallViabilityScore >= config.minViabilityScore) {
          db.saveNiche({
            id: `sn_ap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId,
            researchId: researchRecord.id,
            nicheName: report.nicheName,
            seedKeyword: candidate.seed,
            targetCountry: candidate.country,
            viabilityScore: report.overallViabilityScore,
            verdict: report.verdict,
            status: 'strong_opportunity',
            tags: [candidate.sector, candidate.nicheType, 'autopilot-gem'],
            notes: `Auto-discovered by Autopilot Radar: ${weakComps.length} weak competitors (Lowest DR ${lowestWeakDr}). Estimated ${candidate.rpmRange}.`,
            pinned: report.overallViabilityScore >= 88,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          autoSaved = true;
        }

        const discoveredItem: AutopilotDiscoveredItem = {
          id: `ap_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          researchId: researchRecord.id,
          seedKeyword: candidate.seed,
          nicheName: report.nicheName,
          sector: candidate.sector,
          sectorLabel: candidate.sectorLabel,
          nicheType: candidate.nicheType,
          businessModel: candidate.businessModel,
          targetCountry: candidate.country,
          countryTier: tierInfo.tier,
          estimatedRpm: candidate.rpmRange || `$${tierInfo.rpmRange[0]} - $${tierInfo.rpmRange[1]} RPM`,
          viabilityScore: report.overallViabilityScore,
          verdict: report.verdict,
          weakCompetitorCount: weakComps.length,
          standoutWeakDr: lowestWeakDr,
          monthlySearchVolume: report.searchVolume.totalNicheSv.value,
          estimatedMonthlyRevenue: report.monetization.estimatedMonthlyRevenueRange,
          recommendedAssetType: candidate.recommendedAsset,
          aiOverviewPresent: report.serp.aiOverviewPresent,
          whyItIsUntapped: candidate.whyUntapped,
          discoveredAt: new Date().toISOString(),
          autoSaved,
        };

        db.saveAutopilotDiscovered(discoveredItem);
        discoveredItems.push(discoveredItem);

        this.addLiveLog(
          `✓ Validated: "${report.nicheName}" (${candidate.country}) -> Score: ${report.overallViabilityScore}/100 [${report.verdict}]. ${weakComps.length} low DR competitors detected.`,
          report.overallViabilityScore >= 80 ? 'success' : 'info'
        );
      } catch (err: any) {
        console.error('Error running candidate pipeline:', err);
        this.addLiveLog(`⚠ Candidate "${candidate.seed}" encountered evaluation error: ${err.message}`, 'warn');
      }
    }

    // Update config telemetry
    db.updateAutopilotConfig({
      lastAutoRunAt: new Date().toISOString(),
    });

    const summary = `Autopilot cycle completed: ${discoveredItems.length} validated micro-niches discovered and cataloged.`;
    this.addLiveLog(summary, 'success');

    return {
      success: true,
      discoveredItems,
      summary,
    };
  }

  /**
   * Returns complete Autopilot status, config, and discovery history
   */
  public static getStatus(): AutopilotStatus {
    const config = db.getAutopilotConfig();
    const discovered = db.getAutopilotDiscovered();

    const highViability = discovered.filter((d) => d.viabilityScore >= 80);
    const lowDrAnomalies = discovered.filter((d) => d.standoutWeakDr <= 15);
    const avgScore =
      discovered.length > 0
        ? Math.round(discovered.reduce((sum, d) => sum + d.viabilityScore, 0) / discovered.length)
        : 0;

    return {
      active: config.enabled,
      config,
      totalDiscovered: discovered.length,
      highViabilityCount: highViability.length,
      lowDrAnomalyCount: lowDrAnomalies.length,
      averageDiscoveredScore: avgScore,
      recentDiscoveries: discovered,
      liveLogs: this.liveLogs,
    };
  }
}
