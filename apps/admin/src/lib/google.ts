import { google } from 'googleapis';

// Initialize Google Auth
function getGoogleAuth() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Google Service Account credentials are not configured');
  }

  // Replace escaped newlines in private key
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/presentations',
    ],
  });

  return auth;
}

// Google Calendar API
export async function createCalendarEvent(eventData: {
  summary: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
}) {
  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const startDateTime = eventData.startTime
    ? new Date(`${eventData.startDate.toISOString().split('T')[0]}T${eventData.startTime}`)
    : eventData.startDate;

  const endDateTime = eventData.endTime
    ? new Date(`${eventData.endDate.toISOString().split('T')[0]}T${eventData.endTime}`)
    : eventData.endDate;

  const event = {
    summary: eventData.summary,
    description: eventData.description,
    location: eventData.location,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Europe/Berlin',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Europe/Berlin',
    },
  };

  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    requestBody: event,
  });

  return response.data.id;
}

export async function updateCalendarEvent(
  eventId: string,
  eventData: {
    summary?: string;
    description?: string;
    location?: string;
    startDate?: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
  }
) {
  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  const updateData: any = {};

  if (eventData.summary) updateData.summary = eventData.summary;
  if (eventData.description) updateData.description = eventData.description;
  if (eventData.location) updateData.location = eventData.location;

  if (eventData.startDate) {
    const startDateTime = eventData.startTime
      ? new Date(`${eventData.startDate.toISOString().split('T')[0]}T${eventData.startTime}`)
      : eventData.startDate;

    updateData.start = {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Europe/Berlin',
    };
  }

  if (eventData.endDate) {
    const endDateTime = eventData.endTime
      ? new Date(`${eventData.endDate.toISOString().split('T')[0]}T${eventData.endTime}`)
      : eventData.endDate;

    updateData.end = {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Europe/Berlin',
    };
  }

  await calendar.events.patch({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    eventId: eventId,
    requestBody: updateData,
  });
}

export async function deleteCalendarEvent(eventId: string) {
  const auth = getGoogleAuth();
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.delete({
    calendarId: process.env.GOOGLE_CALENDAR_ID!,
    eventId: eventId,
  });
}

// Google Drive API
export async function uploadFileToDrive(
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
) {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });

  const fileMetadata = {
    name: fileName,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
  };

  const media = {
    mimeType: mimeType,
    body: fileBuffer,
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id, webViewLink',
  });

  // Make file publicly readable
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
  };
}

// Google Slides API (for certificate generation)
export async function createCertificateFromTemplate(
  templateId: string,
  replacements: { [key: string]: string }
) {
  const auth = getGoogleAuth();
  const slides = google.slides({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });

  // Copy template
  const copyResponse = await drive.files.copy({
    fileId: templateId,
    requestBody: {
      name: `Zertifikat_${replacements.zertifikat_nummer || Date.now()}`,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
    },
  });

  const newFileId = copyResponse.data.id!;

  // Replace text in slides
  const requests = Object.entries(replacements).map(([key, value]) => ({
    replaceAllText: {
      containsText: {
        text: `{{${key}}}`,
        matchCase: false,
      },
      replaceText: value,
    },
  }));

  if (requests.length > 0) {
    await slides.presentations.batchUpdate({
      presentationId: newFileId,
      requestBody: {
        requests: requests,
      },
    });
  }

  // Get web view link
  const file = await drive.files.get({
    fileId: newFileId,
    fields: 'webViewLink',
  });

  return {
    fileId: newFileId,
    webViewLink: file.data.webViewLink!,
  };
}
