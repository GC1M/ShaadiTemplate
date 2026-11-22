// Photographs for the sample wedding websites, all from Wikimedia Commons (CC0 / CC BY / CC BY-SA, credited in
// each site's footer). The sites go out before the wedding, so no wedding photos: a real couple would use their
// pre-wedding shoot.

// w = the original's width: Commons refuses thumbnails wider than the original.
// A couple's own uploads have no credit line.
export type Photo = { src: string; small: string; srcSet?: string; alt: string; pos: string; credit?: { by: string; licence: string; file: string } }

export const commons = (path: string, w: number, alt: string, by: string, licence: string, pos = 'center'): Photo => {
  const name = path.split('/').pop()!
  const thumb = (x: number) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${x}px-${name}`
  const widths = [960, 1280, 1920].filter((x) => x < w)
  return {
    src: widths.length ? thumb(widths[Math.min(1, widths.length - 1)]) : `https://upload.wikimedia.org/wikipedia/commons/${path}`,
    small: widths.length ? thumb(widths[0]) : `https://upload.wikimedia.org/wikipedia/commons/${path}`, // for small frames
    srcSet: widths.map((x) => `${thumb(x)} ${x}w`).join(', ') || undefined,
    alt,
    pos,
    credit: { by, licence, file: decodeURIComponent(name) },
  }
}
// Engagement shoots, the places, and the things each ceremony is made of.
export const SHOTS = {
  silhouette: commons('c/ce/Sunset_beach_couple_%28Unsplash%29.jpg', 3456, 'A couple holding hands, silhouetted against the dusk sky', 'Caleb Ekeroth', 'CC0', '50% 65%'),
  sunsetTree: commons('5/52/Pink_sunset_couple_%28Unsplash%29.jpg', 5152, 'Two people watching the sun go down under a tree', 'Harli Marten', 'CC0', '40% 50%'),
  ring: commons('f/f8/Engaged_couple_linking_fingers_%28Unsplash%29.jpg', 3780, 'Two hands linking fingers, an engagement ring on one', 'Paul García', 'CC0', '55% 50%'),
  twirl: commons('2/2e/Punjabi_Pre_wedding_shoot_-_December_2020_03.jpg', 6048, 'A couple on a terrace at dusk, her skirt mid-twirl', 'Raja Photographer (Khalsa Studio)', 'CC BY-SA 4.0', '40% 50%'),
  bazaar: commons('c/c0/Punjabi_Pre_wedding_shoot_-_December_2020_02.jpg', 6048, 'A couple in festive clothes among juttis and parandis', 'Raja Photographer (Khalsa Studio)', 'CC BY-SA 4.0', '45% 50%'),
  embrace: commons('c/c0/Sweet_Embrace_%28163554735%29.jpeg', 2048, 'A couple embracing on a tree-lined road in golden light', 'Sushant Sakhalkar', 'CC0'),
  lodhi: commons('3/3b/Couple_Photoshoot_at_The_Lodhi_Garden.jpg', 5009, 'A couple on the steps of a tomb in Lodhi Garden', 'Akarshan Sapra', 'CC BY-SA 4.0', '50% 75%'),
  henna: commons('3/32/Mehndi_and_henna_cone.jpg', 960, 'A hand with fresh mehendi beside a henna cone', "Ilona's Henna 'n' Stuff", 'CC BY-SA 4.0', '40% 50%'),
  marigold: commons('3/3c/African_Marigold_%28405632987%29.jpg', 2816, 'A marigold in bloom', 'Dinesh Valke', 'CC BY-SA 2.0', '60% 50%'),
  diyas: commons('e/e7/Rows_of_diyas.jpg', 3872, 'Rows of lit clay diyas', 'Sneha G Gupta', 'CC BY-SA 4.0'),
  diyaLedge: commons('5/53/Diya_on_a_balcony_ledge.jpg', 4608, 'Diyas burning along a balcony ledge', 'siddarth varanasi', 'CC BY 2.0'),
  lakePalace: commons('f/f4/Taj_Lake_Palace_Udaipur.jpg', 8278, 'The Lake Palace lit up at night', 'Jakub Michankow', 'CC BY 2.0'),
  goldenTemple: commons('d/d7/Golden_Temple%2C_Amritsar_01.jpg', 5011, 'The Golden Temple across the sarovar in Amritsar', 'Bernard Gagnon', 'CC BY-SA 4.0'),
  phulkari: commons('c/cb/A_Phulkari_with_traditional_flower_pattern_on_unworked_background.jpg', 3372, 'Phulkari embroidery in silk floss', 'Chiswick Chap', 'CC BY-SA 4.0'),
  gopuram: commons('c/c8/Tower_of_Meenakshi_amman_temple.jpg', 2836, 'A painted gopuram of the Meenakshi Amman temple, Madurai', 'Maddy lens', 'CC BY-SA 4.0', '50% 30%'),
  jasmine: commons('5/56/Garland%2Cjasmine%2CTamil_Nadu354.JPG', 2592, 'Strings of jasmine buds', 'தகவலுழவன்', 'CC BY-SA 3.0'),
  rangoli: commons('8/86/A_Beautiful_Rangoli.jpg', 4608, 'A rangoli of coloured powder and flowers', 'SreeramKalyan', 'CC0'),
  basilica: commons('9/9e/Front_Elevation_of_Basilica_of_Bom_Jesus.jpg', 5468, 'The laterite front of the Basilica of Bom Jesus, Old Goa', 'iMahesh', 'CC BY-SA 4.0'),
  goaDusk: commons('2/2b/Romantic_Vagator-Chapora_Bay_after_sunset%2C_Goa%2C_India.jpg', 4032, 'Chapora bay in Goa just after sunset', 'Vyacheslav Argenberg', 'CC BY 4.0'),
  mubarakMahal: commons('1/1f/20191218_Mubarak_Mahal%2C_City_Palace%2C_Jaipur_0936_9032.jpg', 4947, 'The carved Mubarak Mahal in the City Palace, Jaipur', 'Jakub Hałun', 'CC BY-SA 4.0'),
  amerCourt: commons('d/d2/Amer_Fort%2C_Courtyard%2C_India.jpg', 3072, 'A courtyard of Amer Fort, Jaipur', 'Vyacheslav Argenberg', 'CC BY 4.0'),
  modhera: commons('e/e0/Sun_Temple%2C_Modhera_03.jpg', 5104, 'The Sun Temple at Modhera, Gujarat', 'Bernard Gagnon', 'CC BY-SA 3.0', '50% 100%'),
  peacock: commons('f/f0/Indian_Peafowl_on_Display.jpg', 2048, 'A peacock with its tail fanned', 'Trey Perry', 'CC BY 3.0'),
  chhatriLake: commons('a/ac/Gadi_Sagar%2C_Jaisalmer.JPG', 3872, 'Carved chhatris on the water of Gadisar lake, Jaisalmer', 'Jmacleantaylor', 'CC BY-SA 3.0'),
  lotus: commons('b/bb/A_lotus_in_thekkady_rose_park.jpg', 3000, 'A pink lotus in bloom', 'Kaartic', 'CC BY-SA 4.0'),
  aarti: commons('1/10/Evening_Ganga_Aarti_Assi_Ghat%2C_Varanasi_1.jpg', 4717, 'Evening Ganga aarti at Assi Ghat, Varanasi', 'Rangan Datta Wiki', 'CC BY-SA 4.0'),
  ghatBoats: commons('0/0b/Assembly_of_boats_in_Dasashwamedh_Ghat_in_the_evening_before_Arati%2C_Varanasi.jpg', 3872, 'Boats gathered at Dashashwamedh Ghat before the evening aarti', 'Sujay25', 'CC BY-SA 4.0'),
  bougainvillea: commons('a/a3/Pink_bougainvillea_in_Assam.jpg', 4000, 'Pink bougainvillea in bloom', 'Chiring chandan', 'CC BY-SA 4.0'),
  imambara: commons('0/04/Bara_Imambara%2C_Lucknow_2.jpg', 2365, 'The arches of the Bara Imambara, Lucknow', 'Slyronit', 'CC BY-SA 4.0'),
}

