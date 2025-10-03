import { Request, Response } from 'express';
import { 
  triggerManualReminder, 
  getReminderJobStatus,
  startReminderJobs,
  getUpcomingIndividualSessions,
  getUpcomingClassSlots
} from '../services/remider.service';

// Manual trigger for testing reminders
export const triggerReminderController = async (req: Request, res: Response) => {
  try {
    const { hoursAhead } = req.body;
    
    if (hoursAhead !== 24 && hoursAhead !== 1) {
      return res.status(400).json({
        error: 'Invalid hoursAhead value. Must be 24 or 1.'
      });
    }

    console.log(`🧪 Manual reminder trigger requested for ${hoursAhead} hours ahead`);
    
    // Trigger the reminder job manually
    await triggerManualReminder(hoursAhead);
    
    res.status(200).json({
      success: true,
      message: `${hoursAhead}-hour reminder job completed successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in manual reminder trigger:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger reminder job',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get reminder job status
export const getReminderStatusController = async (req: Request, res: Response) => {
  try {
    const status = getReminderJobStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('Error getting reminder status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reminder status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Restart reminder jobs (useful for debugging)
export const restartReminderJobsController = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Restarting reminder jobs...');
    
    // Start the jobs again
    const jobs = startReminderJobs();
    
    res.status(200).json({
      success: true,
      message: 'Reminder jobs restarted successfully',
      timestamp: new Date().toISOString(),
      jobs: getReminderJobStatus().jobs
    });
    
  } catch (error) {
    console.error('Error restarting reminder jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restart reminder jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};



export const getUpcomingIndividualSessionsController = async (req: Request, res: Response) => {
  const hoursAhead = 1; // or 1 for 1-hour reminders
  try {
    // const sessions = await getUpcomingIndividualSessions(hoursAhead);
    // res.status(200).json({
    //   success: true,
    //   data: sessions
    // });

    const classSlots = await getUpcomingClassSlots(hoursAhead)
    res.status(200).json({
      success:true,
      data: classSlots
    })
  }
  catch (error) {
    console.error('Error fetching upcoming individual sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming individual sessions',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}