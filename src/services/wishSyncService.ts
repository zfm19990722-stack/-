import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Wish } from '../types';

export type SyncState = 'offline' | 'syncing' | 'synced' | 'error';

/**
 * Subscribe to the user's wishes collection in real-time
 */
export function subscribeToUserWishes(
  userId: string,
  onUpdate: (wishes: Wish[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) return () => {};

  const wishesRef = collection(db, 'users', userId, 'wishes');
  const q = query(wishesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const cloudWishes: Wish[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        cloudWishes.push({
          id: data.id || docSnap.id,
          title: data.title || '',
          category: data.category || 'lifestyle',
          details: data.details || '',
          visualizationDetails: data.visualizationDetails || '',
          visualizationDetailsEn: data.visualizationDetailsEn || '',
          isManifested: data.isManifested || false,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      onUpdate(cloudWishes);
    },
    (err) => {
      console.error('Error fetching cloud wishes:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Save or update a single wish in the user's Firestore subcollection
 */
export async function syncSaveWish(userId: string, wish: Wish): Promise<void> {
  if (!userId || !wish.id) return;
  const wishDocRef = doc(db, 'users', userId, 'wishes', wish.id);
  await setDoc(
    wishDocRef,
    {
      id: wish.id,
      userId,
      title: wish.title,
      category: wish.category,
      details: wish.details || '',
      visualizationDetails: wish.visualizationDetails || '',
      visualizationDetailsEn: wish.visualizationDetailsEn || '',
      isManifested: wish.isManifested || false,
      createdAt: wish.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Update partial fields of a wish
 */
export async function syncUpdateWish(
  userId: string,
  wishId: string,
  fields: Partial<Wish>
): Promise<void> {
  if (!userId || !wishId) return;
  const wishDocRef = doc(db, 'users', userId, 'wishes', wishId);
  await updateDoc(wishDocRef, {
    ...fields,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a wish from Firestore
 */
export async function syncDeleteWish(userId: string, wishId: string): Promise<void> {
  if (!userId || !wishId) return;
  const wishDocRef = doc(db, 'users', userId, 'wishes', wishId);
  await deleteDoc(wishDocRef);
}

/**
 * Migrate local guest wishes to the user's cloud collection upon login
 */
export async function mergeLocalWishesToCloud(
  userId: string,
  localWishes: Wish[]
): Promise<Wish[]> {
  if (!userId || !localWishes || localWishes.length === 0) {
    return [];
  }

  try {
    const wishesRef = collection(db, 'users', userId, 'wishes');
    const existingCloudSnap = await getDocs(wishesRef);
    const cloudWishIds = new Set<string>();
    existingCloudSnap.forEach((d) => cloudWishIds.add(d.id));

    const batch = writeBatch(db);
    let newUploadCount = 0;

    localWishes.forEach((wish) => {
      // If wish is not already in cloud or is a sample/custom local wish, merge it
      if (!cloudWishIds.has(wish.id)) {
        const docRef = doc(db, 'users', userId, 'wishes', wish.id);
        batch.set(docRef, {
          id: wish.id,
          userId,
          title: wish.title,
          category: wish.category,
          details: wish.details || '',
          visualizationDetails: wish.visualizationDetails || '',
          visualizationDetailsEn: wish.visualizationDetailsEn || '',
          isManifested: wish.isManifested || false,
          createdAt: wish.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        newUploadCount++;
      }
    });

    if (newUploadCount > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.error('Error merging local wishes to cloud:', err);
  }

  return localWishes;
}
