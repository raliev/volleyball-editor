export const SCALE = 40;
export const COURT_CENTER_X = 400;
export const COURT_CENTER_Y = 250;
export const OBJ_OFFSET = 25;

export const CUSTOM_PROPS = [
  'id', 'role', 'customName', 'fromId', 'toId', 'rad',
  'label', 'labelBgColor', 'strokeDashArray', 'selectable',
  'hasControls', 'lockScalingX', 'lockScalingY', 'lockRotation',
  'perPixelTargetFind', 'lineType', 'isMetadata', 'pose', 'arrowType', 'hitType'
];

export const HIT_TYPES = [
  { label: 'Auto', value: 'auto' }, // Added Auto
  { label: 'Offensive / Attack', value: 'offensive' },
  { label: 'Defensive / Recovery', value: 'defensive' },
  { label: 'Placement / Tactical', value: 'tactical' }
];

export const PLAYER_POSES = [
  { label: 'Auto', value: 'auto' },
  { label: 'Passing', value: 'passing' },
  { label: 'Serving', value: 'serve' },
  { label: 'Blocking', value: 'block' },
  { label: 'Attacking', value: 'attack' }
];

export const PRESET_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' }
];

export const PLAYER_POSITIONS = {
  left: { 
    '1': { x: 100, y: 370 }, 
    '2': { x: 300, y: 370 }, 
    '3': { x: 300, y: 250 }, 
    '4': { x: 300, y: 130 }, 
    '5': { x: 100, y: 130 }, 
    '6': { x: 100, y: 250 } 
  },
  right: { 
    '1': { x: 700, y: 130 }, 
    '2': { x: 500, y: 130 }, 
    '3': { x: 500, y: 250 }, 
    '4': { x: 500, y: 370 }, 
    '5': { x: 700, y: 370 }, 
    '6': { x: 700, y: 250 } 
  },
  left_extra: { 
    'A': { x: 100, y: 35 }, 
    'B': { x: 100, y: 465 }, 
    'C': { x: 20, y: 130 }, 
    'D': { x: 20, y: 250 }, 
    'E': { x: 20, y: 370 }, 
    'F': { x: 300, y: 35 }, 
    'G': { x: 300, y: 465 } 
  },
  right_extra: { 
    'A': { x: 700, y: 35 }, 
    'B': { x: 700, y: 465 }, 
    'C': { x: 780, y: 130 }, 
    'D': { x: 780, y: 250 }, 
    'E': { x: 780, y: 370 }, 
    'F': { x: 500, y: 35 }, 
    'G': { x: 500, y: 465 } 
  }
};

export const COURT_ZONES = [
  { n: '5', x: 100, y: 130 }, { n: '6', x: 100, y: 250 }, { n: '1', x: 100, y: 370 },
  { n: '4', x: 300, y: 130 }, { n: '3', x: 300, y: 250 }, { n: '2', x: 300, y: 370 },
  { n: '2', x: 500, y: 130 }, { n: '3', x: 500, y: 250 }, { n: '4', x: 500, y: 370 },
  { n: '1', x: 700, y: 130 }, { n: '6', x: 700, y: 250 }, { n: '5', x: 700, y: 370 },
  { n: 'A', x: 100, y: 35 }, { n: 'B', x: 100, y: 465 }, { n: 'C', x: 20, y: 130 }, 
  { n: 'D', x: 20, y: 250 }, { n: 'E', x: 20, y: 370 }, { n: 'F', x: 300, y: 35 }, 
  { n: 'G', x: 300, y: 465 },
  { n: 'A', x: 700, y: 35 }, { n: 'B', x: 700, y: 465 }, { n: 'C', x: 780, y: 130 }, 
  { n: 'D', x: 780, y: 250 }, { n: 'E', x: 780, y: 370 }, { n: 'F', x: 500, y: 35 }, 
  { n: 'G', x: 500, y: 465 }
];

