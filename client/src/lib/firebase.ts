import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// User roles and permissions
const USER_ROLES = {
  AUTHOR: 'author',
  EDITOR: 'editor',
  PUBLISHER: 'publisher',
  ADMIN: 'admin'
};

// Article states
const ARTICLE_STATES = {
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled'
};

// Helper functions for articles
async function fetchArticles(options: {
  limit?: number,
  state?: string,
  category?: string,
  author?: string,
  featured?: boolean,
  startAfter?: any,
  tag?: string
} = {}) {
  const { limit: queryLimit = 10, state, category, author, featured, startAfter: cursor, tag } = options;
  
  let articlesQuery = collection(db, "articles");
  let constraints = [];
  
  if (state) {
    constraints.push(where("state", "==", state));
  }
  
  if (category) {
    constraints.push(where("categories", "array-contains", category));
  }
  
  if (author) {
    constraints.push(where("authorId", "==", author));
  }
  
  if (featured) {
    constraints.push(where("featured", "==", true));
  }
  
  if (tag) {
    constraints.push(where("tags", "array-contains", tag));
  }
  
  // Add ordering
  constraints.push(orderBy("publishedAt", "desc"));
  constraints.push(limit(queryLimit));
  
  // Add starting point for pagination
  if (cursor) {
    constraints.push(startAfter(cursor));
  }
  
  let q = query(articlesQuery, ...constraints);
  
  const querySnapshot = await getDocs(q);
  const articles = [];
  querySnapshot.forEach((doc) => {
    articles.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return {
    articles,
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
  };
}

// Image upload helper
async function uploadImage(file: File, path: string) {
  const storageRef = ref(storage, path);
  
  // Upload the file
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
}

// Search function
async function searchArticles(query: string, limit = 10) {
  // Simple search implementation based on title and content
  // In a production app, you might want to use Firebase Extensions like Algolia or Typesense
  
  // Create queries for title and content (case-insensitive would require Cloud Functions in production)
  const lowerQuery = query.toLowerCase();
  
  // Search on published articles only
  const titleQuerySnapshot = await getDocs(
    query(
      collection(db, "articles"),
      where("state", "==", ARTICLE_STATES.PUBLISHED),
      where("titleLowercase", ">=", lowerQuery),
      where("titleLowercase", "<=", lowerQuery + '\uf8ff'),
      limit(limit)
    )
  );

  // Get articles that match the search term
  const matchingArticles = [];
  titleQuerySnapshot.forEach((doc) => {
    matchingArticles.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return matchingArticles;
}

// Newsletter subscription
async function subscribeToNewsletter(email: string, name?: string) {
  try {
    const docRef = await addDoc(collection(db, "newsletter_subscribers"), {
      email,
      name: name || '',
      subscribedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding subscriber: ", error);
    throw error;
  }
}

export {
  app,
  auth,
  db,
  storage,
  googleProvider,
  USER_ROLES,
  ARTICLE_STATES,
  fetchArticles,
  uploadImage,
  searchArticles,
  subscribeToNewsletter,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
};
