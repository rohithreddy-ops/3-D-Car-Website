/**
 * NOCTIS Configuration
 * Single Source of Truth for asset paths, frame counts, and product data
 */
const CONFIG = {
  brand: {
    name: 'NOCTIS',
    tagline: 'THE ONLY LIGHT IN THE WORLD',
    established: 'MMXXVI',
    location: 'COLOGNE / TOKYO'
  },
  frames: {
    hero: {
      count: 596,
      desktopPrefix: 'assets/frames/hero/frame_',
      mobilePrefix: 'assets/frames/hero-mobile/frame_',
      extension: '.webp',
      digits: 4
    },
    dismantle: {
      count: 198,
      desktopPrefix: 'assets/frames/dismantle/frame_',
      mobilePrefix: 'assets/frames/dismantle-mobile/frame_',
      extension: '.webp',
      digits: 4
    }
  },
  lineup: [
    {
      id: 'gt-e',
      name: 'NOCTIS GT-E',
      badge: 'HERO SPEC',
      category: 'GRAND TOURER COUPE',
      finish: 'Matte Graphite',
      hex: '#232529',
      power: '1,200 HP',
      torque: '1,450 NM',
      accel: '2.1s',
      accelLabel: '0–100 KM/H',
      topSpeed: '330 KM/H',
      range: '840 KM',
      weight: '1,840 KG',
      curbBalance: '50 : 50',
      price: '$240,000',
      image: 'assets/cars/gt-e.webp',
      description: 'The archetype. Sculpted from continuous carbon weave with zero visible shut lines. Built for transcontinental night crossings in absolute sonic void.'
    },
    {
      id: 's',
      name: 'NOCTIS S',
      badge: 'EXECUTIVE',
      category: 'FOUR-DOOR SPORT SEDAN',
      finish: 'Satin Bone White',
      hex: '#EDEAE4',
      power: '980 HP',
      torque: '1,280 NM',
      accel: '2.4s',
      accelLabel: '0–100 KM/H',
      topSpeed: '310 KM/H',
      range: '890 KM',
      weight: '1,960 KG',
      curbBalance: '49 : 51',
      price: '$195,000',
      image: 'assets/cars/s.webp',
      description: 'An elongated four-door silhouette with flush kinetic doors and acoustic isolation. Envelops four occupants in quiet hyper-luxury.'
    },
    {
      id: 'x',
      name: 'NOCTIS X',
      badge: 'CROSSOVER',
      category: 'COUPE CROSSOVER SUV',
      finish: 'Midnight Blue',
      hex: '#111D36',
      power: '1,050 HP',
      torque: '1,380 NM',
      accel: '2.7s',
      accelLabel: '0–100 KM/H',
      topSpeed: '290 KM/H',
      range: '780 KM',
      weight: '2,120 KG',
      curbBalance: '48 : 52',
      price: '$215,000',
      image: 'assets/cars/x.webp',
      description: 'Raised ground clearance and variable air suspension paired with an aggressive fastback roofline. Dual motor vectoring engineered for unpaved terrain.'
    },
    {
      id: 'r',
      name: 'NOCTIS R',
      badge: 'TRACK CORSA',
      category: 'TWO-SEAT TRACK COUPE',
      finish: 'Satin Black / Red',
      hex: '#0A0A0C',
      power: '1,420 HP',
      torque: '1,650 NM',
      accel: '1.85s',
      accelLabel: '0–100 KM/H',
      topSpeed: '360 KM/H',
      range: '620 KM',
      weight: '1,680 KG',
      curbBalance: '47 : 53',
      price: '$320,000',
      image: 'assets/cars/r.webp',
      description: 'Radically stripped of sound insulation. Dual rear active aerodynamic carbon wing producing 850 kg of downforce at 280 km/h.'
    },
    {
      id: 'one',
      name: 'NOCTIS ONE',
      badge: 'CONCEPT PROTOTYPE',
      category: 'CONCEPT HYPERCAR',
      finish: 'Liquid Silver Metallic',
      hex: '#C0C5CC',
      power: '1,800 HP',
      torque: '2,100 NM',
      accel: '1.65s',
      accelLabel: '0–100 KM/H',
      topSpeed: '410 KM/H',
      range: '720 KM',
      weight: '1,590 KG',
      curbBalance: '46 : 54',
      price: 'BY INVITATION ONLY',
      image: 'assets/cars/one.webp',
      description: 'The extreme pinnacle. Full teardrop fighter-jet canopy, ground-effect venturi tunnels, and ceramic axial flux motors. Strictly ten bespoke allocations.'
    }
  ],
  specs: [
    { label: 'POWERTRAIN', value: 'DUAL AXIAL FLUX PMSM', detail: 'Independent front & rear torque vectoring' },
    { label: 'CHASSIS', value: 'CARBON MONOCOQUE', detail: '65,000 Nm/deg torsional stiffness' },
    { label: 'BATTERY ARCHITECTURE', value: '900V SOLID-STATE', detail: '120 kWh cell-to-chassis integrated pack' },
    { label: 'CHARGE RECHARGE', value: '11 MIN (10%–80%)', detail: '400 kW high-current cryogenic DC charge' },
    { label: 'AERODYNAMICS', value: '0.19 CD UNBROKEN', detail: 'Zero flush exterior disruption' },
    { label: 'ACOUSTIC LEVEL', value: '0.00 DB FLOOR', detail: 'Active anti-phase counter-oscillation' }
  ]
};

// Make accessible to all modules
window.CONFIG = CONFIG;

