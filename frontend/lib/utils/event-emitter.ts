/**
 * EventEmitter - Generic event emitter for loose coupling between components
 * Follows Single Responsibility Principle
 */

type Listener<T> = (data: T) => void;
type Unsubscribe = () => void;

export class EventEmitter<T = any> {
  private events: Map<string, Set<Listener<T>>> = new Map();

  /**
   * Subscribe to an event
   * Returns unsubscribe function
   */
  on(event: string, listener: Listener<T>): Unsubscribe {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.events.get(event);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.events.delete(event);
        }
      }
    };
  }

  /**
   * Subscribe to an event (one-time)
   */
  once(event: string, listener: Listener<T>): Unsubscribe {
    const unsubscribe = this.on(event, (data) => {
      listener(data);
      unsubscribe();
    });

    return unsubscribe;
  }

  /**
   * Emit an event with data
   */
  emit(event: string, data: T): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  off(event: string): void {
    this.events.delete(event);
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
