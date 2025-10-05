import { 
  triggerManualReminder, 
  getReminderJobStatus,
  startReminderJobs 
} from '../services/remider.service';

// Test script for the reminder system
async function testReminderSystem() {
  console.log('🧪 Testing Email Reminder System\n');

  try {
    // 1. Check system status
    console.log('1. Checking reminder system status...');
    const status = getReminderJobStatus();
    console.log('Status:', JSON.stringify(status, null, 2));
    console.log('');

    // 2. Test manual 24-hour reminder
    console.log('2. Testing manual 24-hour reminder trigger...');
    await triggerManualReminder(24);
    console.log('✅ 24-hour reminder test completed\n');

    // 3. Test manual 1-hour reminder  
    console.log('3. Testing manual 1-hour reminder trigger...');
    await triggerManualReminder(1);
    console.log('✅ 1-hour reminder test completed\n');

    console.log('🎉 All reminder system tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Example usage for development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to run tests
  // testReminderSystem();
}

export { testReminderSystem };