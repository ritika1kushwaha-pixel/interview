import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  InterviewSession,
  Question,
  SavedFeedbackItem,
} from '../types/interview';

const LOCAL_STORAGE_INTERVIEWS_KEY = 'acemock_local_interviews';
const LOCAL_STORAGE_QUESTIONS_KEY = 'acemock_local_questions';
const LOCAL_STORAGE_FEEDBACK_KEY = 'acemock_local_feedback';

// Helper for local storage backup
function getLocalInterviews(): InterviewSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INTERVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalInterviews(list: InterviewSession[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_INTERVIEWS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Local storage write failed:', err);
  }
}

function getLocalQuestions(interviewId: string): Question[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_QUESTIONS_KEY}_${interviewId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalQuestions(interviewId: string, questions: Question[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_QUESTIONS_KEY}_${interviewId}`, JSON.stringify(questions));
  } catch (err) {
    console.warn('Local storage write failed:', err);
  }
}

function getLocalFeedback(): SavedFeedbackItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFeedback(list: SavedFeedbackItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_FEEDBACK_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Local storage write failed:', err);
  }
}

// --- INTERVIEWS ---

export async function createInterviewInCloud(
  session: Omit<InterviewSession, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const fullSession: InterviewSession = {
    ...session,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Always save locally first as reliable cache
  const localList = getLocalInterviews();
  const filtered = localList.filter((s) => s.interviewId !== session.interviewId);
  saveLocalInterviews([fullSession, ...filtered]);

  // If user is authenticated with Firebase, persist to Firestore
  if (auth.currentUser && auth.currentUser.uid === session.userId) {
    const path = `interviews/${session.interviewId}`;
    try {
      const docRef = doc(db, 'interviews', session.interviewId);
      await setDoc(docRef, {
        interviewId: session.interviewId,
        userId: session.userId,
        title: session.title,
        domain: session.domain,
        role: session.role,
        seniority: session.seniority,
        difficulty: session.difficulty,
        interviewType: session.interviewType,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.totalQuestions,
        overallScore: session.overallScore || 0,
        technicalScore: session.technicalScore || 0,
        communicationScore: session.communicationScore || 0,
        confidenceScore: session.confidenceScore || 0,
        summaryFeedback: session.summaryFeedback || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Firestore write warning:', error);
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

export async function updateInterviewInCloud(
  interviewId: string,
  updates: Partial<InterviewSession>
): Promise<void> {
  // Update in local cache
  const localList = getLocalInterviews();
  const updatedList = localList.map((s) =>
    s.interviewId === interviewId ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
  );
  saveLocalInterviews(updatedList);

  // If user is authenticated, update in Firestore
  if (auth.currentUser) {
    const path = `interviews/${interviewId}`;
    try {
      const docRef = doc(db, 'interviews', interviewId);
      const cleanUpdates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };
      if (updates.status !== undefined) cleanUpdates.status = updates.status;
      if (updates.currentQuestionIndex !== undefined) cleanUpdates.currentQuestionIndex = updates.currentQuestionIndex;
      if (updates.overallScore !== undefined) cleanUpdates.overallScore = updates.overallScore;
      if (updates.technicalScore !== undefined) cleanUpdates.technicalScore = updates.technicalScore;
      if (updates.communicationScore !== undefined) cleanUpdates.communicationScore = updates.communicationScore;
      if (updates.confidenceScore !== undefined) cleanUpdates.confidenceScore = updates.confidenceScore;
      if (updates.summaryFeedback !== undefined) cleanUpdates.summaryFeedback = updates.summaryFeedback;

      await setDoc(docRef, cleanUpdates, { merge: true });
    } catch (error) {
      console.warn('Firestore update warning:', error);
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}

export async function fetchUserInterviews(userId?: string): Promise<InterviewSession[]> {
  const localItems = getLocalInterviews();

  if (!auth.currentUser || !userId || userId === 'guest_candidate') {
    return localItems;
  }

  const path = 'interviews';
  try {
    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const firestoreItems: InterviewSession[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        interviewId: data.interviewId,
        userId: data.userId,
        title: data.title,
        domain: data.domain,
        role: data.role,
        seniority: data.seniority,
        difficulty: data.difficulty,
        interviewType: data.interviewType,
        status: data.status,
        currentQuestionIndex: data.currentQuestionIndex || 0,
        totalQuestions: data.totalQuestions || 0,
        overallScore: data.overallScore || 0,
        technicalScore: data.technicalScore || 0,
        communicationScore: data.communicationScore || 0,
        confidenceScore: data.confidenceScore || 0,
        summaryFeedback: data.summaryFeedback || '',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    // Merge firestore and local items without duplicates
    const ids = new Set(firestoreItems.map((item) => item.interviewId));
    const merged = [...firestoreItems];
    for (const loc of localItems) {
      if (!ids.has(loc.interviewId)) {
        merged.push(loc);
      }
    }
    return merged;
  } catch (error) {
    console.warn('Firestore fetch warning, returning local cache:', error);
    return localItems;
  }
}

// --- QUESTIONS SUBCOLLECTION ---

export async function saveQuestionToCloud(
  interviewId: string,
  question: Omit<Question, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const fullQ: Question = {
    ...question,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Local storage update
  const localQ = getLocalQuestions(interviewId);
  const updatedQ = localQ.filter((q) => q.questionId !== question.questionId);
  saveLocalQuestions(interviewId, [...updatedQ, fullQ]);

  // Firestore update
  if (auth.currentUser && auth.currentUser.uid === question.userId) {
    const path = `interviews/${interviewId}/questions/${question.questionId}`;
    try {
      const docRef = doc(db, 'interviews', interviewId, 'questions', question.questionId);
      await setDoc(docRef, {
        questionId: question.questionId,
        interviewId: question.interviewId,
        userId: question.userId,
        order: question.order,
        questionText: question.questionText,
        category: question.category || 'General',
        status: question.status,
        userAnswer: question.userAnswer || '',
        audioDurationSeconds: question.audioDurationSeconds || 0,
        technicalScore: question.technicalScore ?? 0,
        communicationScore: question.communicationScore ?? 0,
        confidenceScore: question.confidenceScore ?? 0,
        strengths: (question.strengths || []).slice(0, 10),
        improvements: (question.improvements || []).slice(0, 10),
        modelAnswer: question.modelAnswer || '',
        followUpQuestion: question.followUpQuestion || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Firestore question save warning:', error);
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function fetchInterviewQuestions(interviewId: string): Promise<Question[]> {
  const localList = getLocalQuestions(interviewId);

  if (!auth.currentUser) {
    return localList;
  }

  const path = `interviews/${interviewId}/questions`;
  try {
    const q = query(
      collection(db, 'interviews', interviewId, 'questions'),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    const firestoreList: Question[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        questionId: data.questionId,
        interviewId: data.interviewId,
        userId: data.userId,
        order: data.order,
        questionText: data.questionText,
        category: data.category,
        userAnswer: data.userAnswer,
        audioDurationSeconds: data.audioDurationSeconds,
        status: data.status,
        technicalScore: data.technicalScore,
        communicationScore: data.communicationScore,
        confidenceScore: data.confidenceScore,
        strengths: data.strengths || [],
        improvements: data.improvements || [],
        modelAnswer: data.modelAnswer,
        followUpQuestion: data.followUpQuestion,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    return firestoreList.length > 0 ? firestoreList : localList;
  } catch (error) {
    console.warn('Firestore fetch questions warning, using local:', error);
    return localList;
  }
}

// --- SAVED FEEDBACK / REVISION FLASHCARDS ---

export async function saveFeedbackBookmark(
  item: Omit<SavedFeedbackItem, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const fullItem: SavedFeedbackItem = {
    ...item,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Local storage save
  const currentLocal = getLocalFeedback();
  const filtered = currentLocal.filter((b) => b.feedbackId !== item.feedbackId);
  saveLocalFeedback([fullItem, ...filtered]);

  // Firestore save
  if (auth.currentUser && auth.currentUser.uid === item.userId) {
    const path = `saved_feedback/${item.feedbackId}`;
    try {
      const docRef = doc(db, 'saved_feedback', item.feedbackId);
      await setDoc(docRef, {
        feedbackId: item.feedbackId,
        userId: item.userId,
        interviewId: item.interviewId || '',
        questionText: item.questionText,
        domain: item.domain || 'general',
        keyTakeaway: item.keyTakeaway,
        modelAnswer: item.modelAnswer || '',
        category: item.category || 'Competency',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.warn('Firestore bookmark save warning:', error);
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

export async function fetchSavedFeedbackBookmarks(userId?: string): Promise<SavedFeedbackItem[]> {
  const localItems = getLocalFeedback();

  if (!auth.currentUser || !userId || userId === 'guest_candidate') {
    return localItems;
  }

  const path = 'saved_feedback';
  try {
    const q = query(
      collection(db, 'saved_feedback'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    const firestoreItems: SavedFeedbackItem[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        feedbackId: data.feedbackId,
        userId: data.userId,
        interviewId: data.interviewId,
        questionText: data.questionText,
        domain: data.domain,
        keyTakeaway: data.keyTakeaway,
        modelAnswer: data.modelAnswer,
        category: data.category,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    const ids = new Set(firestoreItems.map((item) => item.feedbackId));
    const merged = [...firestoreItems];
    for (const loc of localItems) {
      if (!ids.has(loc.feedbackId)) {
        merged.push(loc);
      }
    }
    return merged;
  } catch (error) {
    console.warn('Firestore feedback fetch warning, using local:', error);
    return localItems;
  }
}

export async function deleteSavedFeedbackBookmark(feedbackId: string): Promise<void> {
  const currentLocal = getLocalFeedback();
  saveLocalFeedback(currentLocal.filter((b) => b.feedbackId !== feedbackId));

  if (auth.currentUser) {
    const path = `saved_feedback/${feedbackId}`;
    try {
      await deleteDoc(doc(db, 'saved_feedback', feedbackId));
    } catch (error) {
      console.warn('Firestore delete bookmark warning:', error);
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

// --- USER CUMULATIVE STATS ---

export async function updateUserStatsAfterInterview(
  userId: string,
  newScore: number
): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return;
  }

  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const current = docSnap.data();
      const currentTotal = current.totalInterviews || 0;
      const currentAvg = current.averageScore || 0;
      const updatedTotal = currentTotal + 1;
      const updatedAvg = Math.round((currentAvg * currentTotal + newScore) / updatedTotal);

      await setDoc(
        userDocRef,
        {
          totalInterviews: updatedTotal,
          averageScore: updatedAvg,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.warn('Firestore user stats warning:', error);
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
