import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

export interface HeroImage {
  id: string;
  url: string;
  alt: string;
}

const DEFAULT_IMAGES: HeroImage[] = [
  { id: '1', url: 'https://picsum.photos/seed/laboratory-science/1920/1080', alt: 'Advanced Laboratory Analysis' },
  { id: '2', url: 'https://picsum.photos/seed/microscope-metallurgy/1920/1080', alt: 'Precision Metallurgy' },
  { id: '3', url: 'https://picsum.photos/seed/industrial-control-room/1920/1080', alt: 'Mining Operations Hub' }
];

export const getHeroImages = async (): Promise<HeroImage[]> => {
  try {
    const coll = collection(db, 'hero_config');
    const snapshot = await getDocs(coll);
    
    if (snapshot.empty) {
      return DEFAULT_IMAGES;
    }
    
    return snapshot.docs.map(doc => doc.data() as HeroImage);
  } catch (error) {
    // If it's a permission error (likely during first load or cold start), 
    // gracefully fallback to defaults without flooding console
    if (error instanceof Error && (error.message.includes('permissions') || error.message.includes('permission-denied'))) {
      return DEFAULT_IMAGES;
    }
    console.error("Error fetching hero images:", error);
    return DEFAULT_IMAGES;
  }
};

export const seedHeroImages = async (): Promise<void> => {
  try {
    for (const img of DEFAULT_IMAGES) {
      await setDoc(doc(db, 'hero_config', img.id), img);
    }
    console.log("Hero images seeded successfully");
  } catch (error) {
    console.error("Failed to seed hero images:", error);
  }
};
