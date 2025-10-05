import {getZoomAccessToken} from '../config/zoomAuth';
import axios from 'axios';


export async function createZoomMeeting(topic: string, startTime: string, duration: number) {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    const accountId = process.env.ZOOM_ACCOUNT_ID;

    if (!clientId || !clientSecret || !accountId) {
        throw new Error('Zoom credentials are not set in environment variables');
    }

    try {
        const accessToken = await getZoomAccessToken(clientId, clientSecret, accountId);
        
        const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      {
        topic: topic || "Tutoring Session",
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: duration || 60,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          waiting_room: true,
          mute_upon_entry: true,
          auto_recording: "local",
          recording_authentication: true,
          approval_type: 2
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

        // return response.data;

        const host_url = response.data.start_url;
        const join_url = response.data.join_url;

        return { host_url, join_url };

    } catch (error) {
        console.error("Error getting Zoom access token:", error);
        throw new Error("Failed to get Zoom access token");
    }
}