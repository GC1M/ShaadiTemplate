// Reel formats copied from the wedding reels going viral on Instagram in 2025-26 (outfit changes, camera-roll dumps,
// "watch his face", the entry, "mere bhai ki shaadi", sangeet hook steps, vidaai, POV, phone vs photographer), cut the
// way wedding filmmakers cut: hard cuts on the beat, one flash at most, subtle motion, little text, one grade.
// Each slot says what to put there, so a family with no editing skill only picks photos and clips.

export type Trans = 'cut' | 'punch' | 'flash' | 'whip' | 'dip' | 'fade'
export type Motion = 'in' | 'out' | 'drift' | 'still'
export type Grade = 'warm' | 'desi' | 'pastel' | 'bw' | 'digicam'
export type TextStyle = 'box' | 'type' | 'serif' | 'label'

export interface Slot {
  beats: number
  hint: string // what to put here, shown to the family
  motion?: Motion // stills only; unset varies it shot to shot
  trans?: Trans // into this shot; unset is a hard cut
  speed?: number // clips: 0.5 slow motion; 0 holds the first frame (freeze)
  text?: string // {caption} {names} {date}
  style?: TextStyle
  pos?: 'top' | 'mid' | 'low'
}

export interface Format {
  id: string
  name: string
  hook: string
  event: string
  bpm: number
  beat: 'soft' | 'dhol' | 'slow' // built-in track
  grade: Grade
  caption?: string // default for {caption}, editable
  examples?: string[]
  header?: TextStyle // {caption} held on screen the whole reel, from frame one
  end?: true // names and date fade in over the last shot
  sounds?: string[] // trending sounds this format is usually posted with
  samples?: string[] // keys in SAMPLES, one per slot: what the format shows before the family adds photos
  slots: Slot[]
}

export const FORMATS: Format[] = [
  {
    id: 'highlights',
    name: 'Wedding highlights',
    hook: 'The filmmaker cut: a slow build, a fast burst on the drop, a quiet ending',
    event: 'Whole wedding',
    bpm: 100,
    beat: 'dhol',
    grade: 'warm',
    caption: 'the wedding of',
    examples: ['the wedding of', 'udaipur, february', 'three days, one forever'],
    end: true,
    samples: ['pheras', 'mandap', 'brideMirror', 'groom', 'baraatParents', 'firstLook', 'varmala', 'sindoor', 'familyDance', 'brotherDance', 'mehendi', 'father', 'couple'],
    slots: [
      { beats: 4, hint: 'Your best moving moment: a clip of the two of you', text: '{caption}', style: 'serif', pos: 'mid' },
      { beats: 3, hint: 'The venue or decor, wide' },
      { beats: 3, hint: 'Bride getting ready' },
      { beats: 3, hint: 'Groom getting ready' },
      { beats: 3, hint: 'Baraat or the entry' },
      { beats: 1, hint: 'Varmala', trans: 'flash' },
      { beats: 1, hint: 'Pheras' },
      { beats: 1, hint: 'Sindoor or mangalsutra' },
      { beats: 1, hint: 'Family laughing' },
      { beats: 1, hint: 'Friends dancing' },
      { beats: 1, hint: 'A detail: hands, mehendi, rings' },
      { beats: 6, hint: 'A hug with parents or the vidaai (clip plays slow)', speed: 0.6, trans: 'dip' },
      { beats: 8, hint: 'The two of you walking, or a forehead touch', speed: 0.5, motion: 'in' },
    ],
  },
  {
    id: 'camera-roll',
    name: 'Camera roll',
    hook: '"I take a lot of pictures": candid phone photos, no effects, one caption',
    event: 'Any function',
    bpm: 90,
    beat: 'soft',
    grade: 'digicam',
    caption: 'our wedding, unedited',
    examples: ['our wedding, unedited', "the photographer didn't get these", 'camera roll from the best weekend'],
    header: 'type',
    sounds: ['The "I take a lot of pictures" original sound'],
    samples: ['haldiFriends', 'brideMirror', 'mithai', 'dance', 'familyDance', 'diya', 'jewellery', 'bridesmaids', 'sisters', 'brideSmile'],
    slots: [
      { beats: 2, hint: 'A candid selfie', motion: 'still' },
      { beats: 2, hint: 'Mirror photo while getting ready', motion: 'still' },
      { beats: 2, hint: 'The food or the mithai', motion: 'still' },
      { beats: 2, hint: 'Dance floor, blurry is fine', motion: 'still' },
      { beats: 2, hint: 'Guests being silly', motion: 'still' },
      { beats: 2, hint: 'A flash photo at night', motion: 'still' },
      { beats: 2, hint: 'Shoes, jewellery or a detail', motion: 'still' },
      { beats: 2, hint: 'Friends together', motion: 'still' },
      { beats: 2, hint: 'The two of you, candid', motion: 'still' },
      { beats: 4, hint: 'Your favourite one', motion: 'still' },
    ],
  },
  {
    id: 'every-look',
    name: 'Every look',
    hook: 'One clip per function, the outfit switching on every beat',
    event: 'All functions',
    bpm: 124,
    beat: 'dhol',
    grade: 'desi',
    end: true,
    sounds: ['An upbeat Bollywood or Punjabi track with a clear drop'],
    samples: ['haldiFriends', 'mehendiClip', 'brideMakeup', 'bridePortrait', 'reception', 'brideNamaskaram'],
    slots: [
      { beats: 4, hint: 'Clip: walking or spinning toward the camera in your haldi outfit', text: 'haldi', style: 'label', pos: 'low' },
      { beats: 4, hint: 'Same move in your mehendi outfit', text: 'mehendi', style: 'label', pos: 'low' },
      { beats: 4, hint: 'Same move in your sangeet outfit', text: 'sangeet', style: 'label', pos: 'low' },
      { beats: 4, hint: 'Same move in your wedding outfit', text: 'the wedding', style: 'label', pos: 'low' },
      { beats: 4, hint: 'Same move in your reception outfit', text: 'reception', style: 'label', pos: 'low' },
      { beats: 8, hint: 'The bridal look, a slow turn (plays in slow motion)', speed: 0.5, trans: 'punch' },
    ],
  },
  {
    id: 'watch-his-face',
    name: 'Watch his face',
    hook: 'The bride walks in, the caption tells you to watch the groom, then the freeze',
    event: 'Entry or first look',
    bpm: 80,
    beat: 'soft',
    grade: 'warm',
    caption: 'watch the groom, not the bride',
    examples: ['watch the groom, not the bride', 'he held it together for exactly 4 seconds', 'watch her dad'],
    header: 'box',
    sounds: ['Kudmayi', 'Kesariya (piano)'],
    samples: ['brideEntry', 'groom', 'groomOnWay', 'varmala'],
    slots: [
      { beats: 4, hint: 'Clip: the bride walking in' },
      { beats: 6, hint: "Clip: the groom's face as he sees her (plays slow)", speed: 0.5 },
      { beats: 4, hint: 'His reaction, closer (the same clip is fine)', speed: 0.5, trans: 'punch' },
      { beats: 6, hint: 'The moment they see each other (holds as a freeze)', speed: 0 },
    ],
  },
  {
    id: 'the-entry',
    name: 'The entry',
    hook: 'Slow motion under the phoolon ki chaadar, back to full speed at the stage',
    event: 'Wedding',
    bpm: 76,
    beat: 'soft',
    grade: 'warm',
    end: true,
    sounds: ['Sau Aasmaan', 'Saiyaara (reprise)'],
    samples: ['phoolonKiChaadar', 'kaleereClip', 'brideSmile', 'brideEntry'],
    slots: [
      { beats: 8, hint: 'Clip: the bride under the flower canopy, wide (plays slow)', speed: 0.5 },
      { beats: 4, hint: 'Close-up: jewellery, hands or feet', speed: 0.5, motion: 'in' },
      { beats: 4, hint: 'Her smile', speed: 0.5 },
      { beats: 8, hint: 'Clip: reaching the stage or the groom', trans: 'punch' },
    ],
  },
  {
    id: 'bhai-ki-shaadi',
    name: 'Mere bhai ki shaadi',
    hook: 'The squad line-up, one cousin per beat, the groom revealed on the drop',
    event: 'Baraat or sangeet',
    bpm: 124,
    beat: 'dhol',
    grade: 'desi',
    caption: 'mere bhai ki shaadi hai',
    examples: ['mere bhai ki shaadi hai', 'meri behen ki shaadi hai', 'the cousins have arrived'],
    header: 'box',
    sounds: ['A punchy Punjabi track with a drop'],
    samples: ['sisters', 'bridesmaids', 'haldiFriends', 'groomGuests', 'brotherDance', 'baraatParents', 'groom'],
    slots: [
      { beats: 2, hint: 'Cousin or friend 1, posing' },
      { beats: 2, hint: 'Cousin or friend 2' },
      { beats: 2, hint: 'Cousin or friend 3' },
      { beats: 2, hint: 'Cousin or friend 4' },
      { beats: 2, hint: 'Cousin or friend 5' },
      { beats: 2, hint: 'Cousin or friend 6' },
      { beats: 8, hint: 'The groom (or bride): the reveal', trans: 'flash', motion: 'in' },
    ],
  },
  {
    id: 'sangeet',
    name: 'Sangeet night',
    hook: 'The family performance with punch-ins on the hook step',
    event: 'Sangeet',
    bpm: 124,
    beat: 'dhol',
    grade: 'desi',
    caption: 'when the brothers practised for 3 months',
    examples: ['when the brothers practised for 3 months', 'she said no dance. then this', 'the aunties stole the show'],
    header: 'box',
    sounds: ['Shararat', 'Aaj Ki Raat'],
    samples: ['sangeet', 'dance', 'familyDance', 'brotherDance', 'garba'],
    slots: [
      { beats: 8, hint: 'Clip: the group performance, wide' },
      { beats: 2, hint: 'Close-up: the hook step', trans: 'punch' },
      { beats: 2, hint: 'Another dancer, close', trans: 'punch' },
      { beats: 4, hint: 'The bride or groom dancing' },
      { beats: 8, hint: 'The big finish, everyone together', trans: 'flash' },
    ],
  },
  {
    id: 'vidaai',
    name: 'The goodbye',
    hook: 'Vidaai in black and white, slowed down, one line of text',
    event: 'Vidaai',
    bpm: 70,
    beat: 'slow',
    grade: 'bw',
    caption: 'the hardest goodbye',
    examples: ['the hardest goodbye', 'she was ours for 26 years', 'papa held it together until here'],
    sounds: ['Din Shagna Da'],
    samples: ['father', 'brideSmile', 'brideNamaskaram', 'vidaai', 'bridePortrait'],
    slots: [
      { beats: 6, hint: 'The bride hugging her mother (plays slow)', speed: 0.6, motion: 'in', text: '{caption}', style: 'serif', pos: 'low' },
      { beats: 4, hint: "Her father's face", speed: 0.6, trans: 'fade' },
      { beats: 4, hint: 'The rice throw over her shoulder', speed: 0.6, trans: 'fade' },
      { beats: 6, hint: 'The car pulling away', speed: 0.6, trans: 'fade' },
      { beats: 6, hint: 'One last look back (holds as a freeze)', speed: 0, trans: 'fade', motion: 'in' },
    ],
  },
  {
    id: 'pov',
    name: 'POV',
    hook: 'One "POV:" caption over a few clips, the most relatable format',
    event: 'Any function',
    bpm: 96,
    beat: 'soft',
    grade: 'pastel',
    caption: 'POV: your pinterest board came to life',
    examples: ['POV: your pinterest board came to life', "POV: you're the bride's cousin at 2am sangeet prep", 'POV: you said a small wedding'],
    header: 'box',
    samples: ['mandap', 'mehendi', 'couple'],
    slots: [
      { beats: 6, hint: 'Wide: the decor or the whole scene', motion: 'in' },
      { beats: 4, hint: 'A detail close-up' },
      { beats: 6, hint: 'The two of you, or the dance floor', motion: 'out' },
    ],
  },
  {
    id: 'phone-vs-photographer',
    name: 'Phone vs photographer',
    hook: 'The messy phone clip, then the photographer’s final photo on the beat',
    event: 'Any function',
    bpm: 90,
    beat: 'soft',
    grade: 'warm',
    samples: ['mehendiClip', 'couple'],
    slots: [
      { beats: 8, hint: 'Your phone clip of the pose being set up', text: 'what we saw', style: 'box', pos: 'top', motion: 'still' },
      { beats: 8, hint: "The photographer's final photo", text: 'what the photographer got', style: 'box', pos: 'top', trans: 'flash', motion: 'in' },
    ],
  },
]
