import {
  addDocumentNonBlocking,
} from '@/firebase';
import { collection, Firestore, serverTimestamp } from 'firebase/firestore';

export type AuditAction = 
  | 'user-login'
  | 'create-booking'
  | 'cancel-booking-user'
  | 'cancel-booking-admin';

export interface AuditEvent {
  userId: string;
  action: AuditAction;
  timestamp: any; // Using 'any' for serverTimestamp()
  details?: Record<string, any>;
}

/**
 * Logs an audit event to Firestore.
 * @param firestore The Firestore instance.
 * @param event The audit event to log.
 */
export function logAuditEvent(firestore: Firestore, event: Omit<AuditEvent, 'timestamp'>) {
  if (!firestore) {
    console.error("Firestore instance is not available, cannot log audit event.");
    return;
  }

  const auditLogsRef = collection(firestore, 'audit_logs');
  const logData: AuditEvent = {
    ...event,
    timestamp: serverTimestamp(),
  };

  addDocumentNonBlocking(auditLogsRef, logData);
}
