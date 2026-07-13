import { EventEmitter } from 'events';
import { Types } from 'mongoose';
import logger from '../utils/logger.js';

/**
 * Typed Event Bus — in-process event system for decoupled architecture.
 *
 * Why an event bus?
 * Without it, the ApplicationService would need to directly call:
 * - NotificationService (to notify employer)
 * - AnalyticsService (to update trending data)
 * - EmailService (to send confirmation)
 * - CacheService (to invalidate stale data)
 *
 * This creates tight coupling. With the event bus:
 * - ApplicationService emits 'application.created'
 * - Handlers independently react (notifications, analytics, email)
 * - Adding new reactions requires zero changes to the emitter
 *
 * Interview note: This is the Observer pattern / pub-sub at the application level.
 * At scale, you'd replace this with a message queue (RabbitMQ, Kafka, SQS).
 * The event bus is the in-process equivalent with zero infrastructure overhead.
 */

// ─── Event Type Definitions ─────────────────────────────────────────────────────

export interface DomainEvents {
  'application.created': {
    applicationId: string;
    jobId: string;
    applicantId: string;
    employerId: string;
    jobTitle: string;
  };
  'application.statusChanged': {
    applicationId: string;
    jobId: string;
    applicantId: string;
    newStatus: string;
    jobTitle: string;
  };
  'job.created': {
    jobId: string;
    employerId: string;
    title: string;
  };
  'user.registered': {
    userId: string;
    email: string;
    role: string;
  };
  'user.login': {
    userId: string;
    ip: string;
    userAgent: string;
  };
  'user.passwordReset': {
    userId: string;
    email: string;
  };
  'review.created': {
    reviewId: string;
    rateeId: string;
    raterId: string;
    rating: number;
    jobTitle: string;
  };
  'payment.confirmed': {
    applicationId: string;
    employerId: string;
    applicantId: string;
    jobTitle: string;
  };
  'dispute.raised': {
    disputeId: string;
    againstId: string;
    raisedById: string;
    reason: string;
    jobTitle: string;
  };
}

export type DomainEventName = keyof DomainEvents;

// ─── Event Bus Implementation ───────────────────────────────────────────────────

class EventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    // Increase max listeners since we may have many handlers per event
    this.emitter.setMaxListeners(20);
  }

  /**
   * Emit a domain event.
   * All registered handlers for this event will be called asynchronously.
   */
  emit<E extends DomainEventName>(event: E, payload: DomainEvents[E]): void {
    logger.debug(`Event emitted: ${event}`, { payload });
    this.emitter.emit(event, payload);
  }

  /**
   * Register a handler for a domain event.
   * Handlers are wrapped in try/catch so a failing handler doesn't
   * affect other handlers or the emitter.
   */
  on<E extends DomainEventName>(
    event: E,
    handler: (payload: DomainEvents[E]) => void | Promise<void>,
  ): void {
    this.emitter.on(event, async (payload: DomainEvents[E]) => {
      try {
        await handler(payload);
      } catch (error) {
        // Event handler errors should never crash the process or affect the caller
        logger.error(`Event handler error for '${event}':`, error);
      }
    });
    logger.debug(`Event handler registered: ${event}`);
  }

  /**
   * Register a one-time handler.
   */
  once<E extends DomainEventName>(
    event: E,
    handler: (payload: DomainEvents[E]) => void | Promise<void>,
  ): void {
    this.emitter.once(event, async (payload: DomainEvents[E]) => {
      try {
        await handler(payload);
      } catch (error) {
        logger.error(`One-time event handler error for '${event}':`, error);
      }
    });
  }

  /**
   * Remove all handlers for an event (useful in tests).
   */
  removeAllListeners(event?: DomainEventName): void {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
  }
}

// Singleton — one event bus per process
export const eventBus = new EventBus();
