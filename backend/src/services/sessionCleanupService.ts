import { autoExpireScheduledSessions, autoCompleteLongRunningSessions } from './sessionService';

// Session cleanup service to handle automatic session state transitions
class SessionCleanupService {
  private expireInterval: NodeJS.Timeout | null = null;
  private completeInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Start the cleanup service with configurable intervals
  start(options: {
    expireCheckIntervalMs?: number;
    completeCheckIntervalMs?: number;
  } = {}) {
    const {
      expireCheckIntervalMs = 5 * 60 * 1000, // Default: 5 minutes
      completeCheckIntervalMs = 10 * 60 * 1000, // Default: 10 minutes
    } = options;

    if (this.isRunning) {
      console.log('Session cleanup service is already running');
      return;
    }

    console.log('Starting session cleanup service...');
    console.log(`- Auto-expire check interval: ${expireCheckIntervalMs / 1000}s`);
    console.log(`- Auto-complete check interval: ${completeCheckIntervalMs / 1000}s`);

    // Set up auto-expiry of scheduled sessions
    this.expireInterval = setInterval(async () => {
      try {
        const result = await autoExpireScheduledSessions();
        if (result.expiredCount > 0) {
          console.log(`Auto-expired ${result.expiredCount} sessions:`, result.sessionIds);
        }
      } catch (error) {
        console.error('Error in auto-expire scheduled sessions:', error);
      }
    }, expireCheckIntervalMs);

    // Set up auto-completion of long running sessions
    this.completeInterval = setInterval(async () => {
      try {
        const result = await autoCompleteLongRunningSessions();
        if (result.completedCount > 0) {
          console.log(`Auto-completed ${result.completedCount} long running sessions:`, result.sessionIds);
        }
      } catch (error) {
        console.error('Error in auto-complete long running sessions:', error);
      }
    }, completeCheckIntervalMs);

    this.isRunning = true;
    console.log('Session cleanup service started successfully');
  }

  // Stop the cleanup service
  stop() {
    if (!this.isRunning) {
      console.log('Session cleanup service is not running');
      return;
    }

    console.log('Stopping session cleanup service...');

    if (this.expireInterval) {
      clearInterval(this.expireInterval);
      this.expireInterval = null;
    }

    if (this.completeInterval) {
      clearInterval(this.completeInterval);
      this.completeInterval = null;
    }

    this.isRunning = false;
    console.log('Session cleanup service stopped');
  }

  // Get the current status of the cleanup service
  getStatus() {
    return {
      isRunning: this.isRunning,
      expireIntervalActive: !!this.expireInterval,
      completeIntervalActive: !!this.completeInterval,
    };
  }

  // Run cleanup operations manually (useful for testing or admin operations)
  async runManualCleanup() {
    console.log('Running manual session cleanup...');
    
    try {
      const expireResult = await autoExpireScheduledSessions();
      const completeResult = await autoCompleteLongRunningSessions();
      
      const result = {
        expiredSessions: expireResult.expiredCount,
        expiredSessionIds: expireResult.sessionIds,
        completedSessions: completeResult.completedCount,
        completedSessionIds: completeResult.sessionIds,
        timestamp: new Date().toISOString(),
      };

      console.log('Manual cleanup completed:', result);
      return result;
    } catch (error) {
      console.error('Error in manual cleanup:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const sessionCleanupService = new SessionCleanupService();
export default sessionCleanupService;