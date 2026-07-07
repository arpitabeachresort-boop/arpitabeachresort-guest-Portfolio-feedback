import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { FeedbackSubmission, GuestInfo } from '../types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
export const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/forms.body');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/gmail.send');

let isSigningIn = false;
let cachedAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('arpita_google_token') : null;

// Initialize Auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Try loading from localStorage as final fallback
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem('arpita_google_token') : null;
        if (savedToken) {
          cachedAccessToken = savedToken;
          if (onAuthSuccess) onAuthSuccess(user, savedToken);
        } else if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('arpita_google_token');
      }
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve Google Access Token.');
    }
    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('arpita_google_token', cachedAccessToken);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    const isPopupClosed = error?.code === 'auth/popup-closed-by-user' || 
                          error?.message?.includes('auth/popup-closed-by-user');
    if (isPopupClosed) {
      console.warn('Google Sign In popup closed or blocked.');
    } else {
      console.error('Google Sign In Error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Log out
export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('arpita_google_token');
  }
};

export const getAccessToken = () => cachedAccessToken;

// Interacting with Google APIs
export interface GoogleResources {
  spreadsheetId: string;
  spreadsheetUrl: string;
  formId: string;
  formUrl: string;
}

// Create a premium Google Spreadsheet and Google Form in user's Drive
export const createSpreadsheetAndForm = async (accessToken: string, hotelName: string): Promise<GoogleResources> => {
  // 1. Create Spreadsheet
  const sheetTitle = `${hotelName} - Guest Feedback Database`;
  const sheetResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: { title: sheetTitle },
      sheets: [
        {
          properties: { title: 'Feedback Responses' },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: [
                {
                  values: [
                    { userEnteredValue: { stringValue: 'Feedback ID' } },
                    { userEnteredValue: { stringValue: 'Timestamp' } },
                    { userEnteredValue: { stringValue: 'Guest Name' } },
                    { userEnteredValue: { stringValue: 'Room Number' } },
                    { userEnteredValue: { stringValue: 'Mobile' } },
                    { userEnteredValue: { stringValue: 'Email' } },
                    { userEnteredValue: { stringValue: 'Nationality' } },
                    { userEnteredValue: { stringValue: 'Purpose of Visit' } },
                    { userEnteredValue: { stringValue: 'Check-In Date' } },
                    { userEnteredValue: { stringValue: 'Check-Out Date' } },
                    { userEnteredValue: { stringValue: 'Department' } },
                    { userEnteredValue: { stringValue: 'Staff Name' } },
                    { userEnteredValue: { stringValue: 'Average Rating' } },
                    { userEnteredValue: { stringValue: 'Ratings JSON' } },
                    { userEnteredValue: { stringValue: 'Staff Recognition' } },
                    { userEnteredValue: { stringValue: 'Open Comments' } },
                    { userEnteredValue: { stringValue: 'Suggestions' } },
                    { userEnteredValue: { stringValue: 'Requires Recovery' } },
                    { userEnteredValue: { stringValue: 'Recovery Status' } }
                  ]
                }
              ]
            }
          ]
        }
      ]
    })
  });

  if (!sheetResponse.ok) {
    const errText = await sheetResponse.text();
    throw new Error(`Google Sheets creation failed: ${errText}`);
  }

  const sheetData = await sheetResponse.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Create Google Form
  const formTitle = `${hotelName} - Five-Star Feedback`;
  const formResponse = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title: formTitle,
        documentTitle: `${hotelName} Guest Survey`,
        description: `Welcome to ${hotelName}, Chandipur, Odisha, India. We are committed to providing you with an exquisite five-star experience. Please share your valuable comments with us.`
      }
    })
  });

  if (!formResponse.ok) {
    const errText = await formResponse.text();
    throw new Error(`Google Forms creation failed: ${errText}`);
  }

  const formData = await formResponse.json();
  const formId = formData.formId;
  const formUrl = formData.responderUri;

  // 3. Add premium questions to the Google Form
  const batchResponse = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          createItem: {
            item: {
              title: 'Guest Name',
              description: 'Please enter your full name as registered at check-in.',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {}
                }
              }
            },
            location: { index: 0 }
          }
        },
        {
          createItem: {
            item: {
              title: 'Room Number / Suite',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {}
                }
              }
            },
            location: { index: 1 }
          }
        },
        {
          createItem: {
            item: {
              title: 'Department of Stay / Visit',
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'DROP_DOWN',
                    options: [
                      { value: 'Front Office' },
                      { value: 'Amethyst Restaurant' },
                      { value: 'In-Room Dining' },
                      { value: 'The Waves Bar & Lounge' },
                      { value: 'Housekeeping' },
                      { value: 'Utsav Grand Hall' },
                      { value: 'Conference & Events' },
                      { value: 'Infinity Swimming Pool' },
                      { value: 'Nirvana Coastal Spa' },
                      { value: 'Gym & Fitness Centre' },
                      { value: 'Security & Safety' },
                      { value: 'Overall Resort Experience' }
                    ]
                  }
                }
              }
            },
            location: { index: 2 }
          }
        },
        {
          createItem: {
            item: {
              title: 'Overall Luxury Rating',
              description: 'Please rate your overall experience with our resort.',
              questionItem: {
                question: {
                  required: true,
                  scaleQuestion: {
                    low: 1,
                    high: 5,
                    lowLabel: 'Needs Improvement',
                    highLabel: 'Excellent (Five-Star)'
                  }
                }
              }
            },
            location: { index: 3 }
          }
        },
        {
          createItem: {
            item: {
              title: 'Exceptional Staff Recognition',
              description: 'Would you like to recognize any outstanding staff member who made your stay special?',
              questionItem: {
                question: {
                  required: false,
                  textQuestion: {}
                }
              }
            },
            location: { index: 4 }
          }
        },
        {
          createItem: {
            item: {
              title: 'Open Comments & Suggestions',
              description: 'Your feedback helps us continuously improve our signature Indian hospitality.',
              questionItem: {
                question: {
                  required: false,
                  textQuestion: { paragraph: true }
                }
              }
            },
            location: { index: 5 }
          }
        }
      ]
    })
  });

  if (!batchResponse.ok) {
    console.error('Failed to configure Google Form questions:', await batchResponse.text());
  }

  // Pre-seed with one initial welcome row in Sheet
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Feedback Responses!A2:S2:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [[
          'WELCOME-01',
          new Date().toISOString(),
          'Prestige VIP Guest',
          'Villa 101',
          '+91 7504838884',
          'gm@arpitabeachresort.in',
          'Indian',
          'VIP Guests',
          '2026-07-01',
          '2026-07-05',
          'Overall Resort Experience',
          'General Manager',
          '5.0',
          JSON.stringify({ ov_satisfaction: 5, ov_hospitality: 5, ov_upkeep: 5, ov_nps: 5, ov_recovery: 5 }),
          'Outstanding Front Desk Team',
          'Absolutely beautiful beachfront. The hospitality is impeccable and the Odia crab curry is a masterpiece!',
          'Keep up the high standard of maintenance.',
          'No',
          'Resolved'
        ]]
      })
    });
  } catch (e) {
    console.error('Error pre-seeding sheet:', e);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    formId,
    formUrl
  };
};

// Ensure the sheet tab "Feedback Responses" exists, creating it if necessary
export const ensureFeedbackResponsesSheetExists = async (
  accessToken: string,
  spreadsheetId: string
): Promise<void> => {
  try {
    const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!metaResponse.ok) {
      console.warn('Failed to fetch spreadsheet metadata:', await metaResponse.text());
      return;
    }

    const metaData = await metaResponse.json();
    const sheetTitles: string[] = (metaData.sheets || []).map((s: any) => s.properties?.title);

    if (!sheetTitles.includes('Feedback Responses')) {
      console.log('Feedback Responses sheet tab not found. Creating tab...');
      const createResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Feedback Responses'
                }
              }
            }
          ]
        })
      });

      if (createResponse.ok) {
        console.log('Successfully created Feedback Responses tab. Writing headers...');
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Feedback Responses!A1:S1?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [[
              'Feedback ID',
              'Timestamp',
              'Guest Name',
              'Room Number',
              'Mobile',
              'Email',
              'Nationality',
              'Purpose of Visit',
              'Check-In Date',
              'Check-Out Date',
              'Department',
              'Staff Name',
              'Average Rating',
              'Ratings JSON',
              'Staff Recognition',
              'Open Comments',
              'Suggestions',
              'Requires Recovery',
              'Recovery Status'
            ]]
          })
        });
      } else {
        console.error('Failed to create sheet tab:', await createResponse.text());
      }
    }
  } catch (error) {
    console.error('Error in ensureFeedbackResponsesSheetExists:', error);
  }
};

// Append a guest feedback submission to the active Google Spreadsheet
export const appendFeedbackToGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string,
  feedback: FeedbackSubmission
): Promise<boolean> => {
  // Ensure the sheet tab exists
  await ensureFeedbackResponsesSheetExists(accessToken, spreadsheetId);
  const avgRating = Object.values(feedback.ratings).length > 0
    ? (Object.values(feedback.ratings).reduce((a, b) => a + b, 0) / Object.values(feedback.ratings).length).toFixed(1)
    : '5.0';

  const rowValues = [
    feedback.id,
    feedback.timestamp,
    feedback.guestInfo.name,
    feedback.guestInfo.roomNumber,
    feedback.guestInfo.mobile || 'N/A',
    feedback.guestInfo.email || 'N/A',
    feedback.guestInfo.nationality,
    feedback.guestInfo.purposeOfVisit,
    feedback.guestInfo.checkInDate,
    feedback.guestInfo.checkOutDate,
    feedback.guestInfo.department,
    feedback.guestInfo.staffName || 'N/A',
    avgRating,
    JSON.stringify(feedback.ratings),
    feedback.outstandingStaff || 'N/A',
    feedback.comments || 'N/A',
    feedback.suggestions || 'N/A',
    feedback.requiresRecovery ? 'Yes' : 'No',
    feedback.recoveryStatus || 'Pending'
  ];

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Feedback Responses!A2:S2:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [rowValues]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets append failed: ${response.status} ${errorText}`);
  }

  return true;
};

// Read feedback from Google Spreadsheet values
export const fetchFeedbackFromGoogleSheet = async (
  accessToken: string,
  spreadsheetId: string
): Promise<FeedbackSubmission[]> => {
  // Ensure the sheet tab "Feedback Responses" exists before reading
  await ensureFeedbackResponsesSheetExists(accessToken, spreadsheetId);

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Feedback Responses!A2:S1000`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch from Google Spreadsheet. Status: ${response.status}. Details: ${errorText}`);
  }

  const data = await response.json();
  const rows = data.values || [];
  
  return rows.map((row: any[], index: number) => {
    let ratings: Record<string, number> = {};
    try {
      ratings = JSON.parse(row[13] || '{}');
    } catch (e) {
      // fallback
      ratings = { ov_satisfaction: parseFloat(row[12]) || 5 };
    }

    const guestInfo: GuestInfo = {
      name: row[2] || 'Anonymous Guest',
      roomNumber: row[3] || 'N/A',
      mobile: row[4] || '',
      email: row[5] || '',
      nationality: row[6] || 'Indian',
      purposeOfVisit: row[7] || 'Families',
      checkInDate: row[8] || '',
      checkOutDate: row[9] || '',
      department: row[10] || 'Overall Resort Experience',
      staffName: row[11] || ''
    };

    return {
      id: row[0] || `SHEET-ROW-${index}`,
      timestamp: row[1] || new Date().toISOString(),
      guestInfo,
      ratings,
      outstandingStaff: row[14] || '',
      comments: row[15] || '',
      suggestions: row[16] || '',
      requiresRecovery: row[17] === 'Yes',
      recoveryStatus: row[18] as any || 'Resolved',
      isRepeatGuest: index % 5 === 0 // mock pattern
    };
  });
};

// Send an email alert using the Gmail API
export const sendManagerAlertEmail = async (
  accessToken: string,
  managerEmail: string,
  feedback: FeedbackSubmission
): Promise<boolean> => {
  try {
    const avgRating = Object.values(feedback.ratings).length > 0
      ? (Object.values(feedback.ratings).reduce((a, b) => a + b, 0) / Object.values(feedback.ratings).length).toFixed(1)
      : '3.0';

    const subject = `ALERT: Needs Improvement Feedback Recieved - Room/Table ${feedback.guestInfo.roomNumber}`;
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ebd665; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #0f172a; padding: 24px; text-align: center; border-bottom: 2px solid #aa841d;">
          <h1 style="color: #ebd665; margin: 0; font-size: 20px; letter-spacing: 2px; font-weight: bold; text-transform: uppercase;">ARPITA BEACH RESORT</h1>
          <p style="color: #94a3b8; margin: 4px 0 0; font-size: 11px; letter-spacing: 1px;">IMMEDIATE SERVICE RECOVERY REQUIRED</p>
        </div>
        <div style="padding: 24px; background-color: #ffffff; color: #1e293b;">
          <h2 style="color: #e11d48; margin-top: 0; font-size: 18px;">
            ⚠️ Low Rating Guest Feedback Recorded
          </h2>
          <p style="font-size: 14px; line-height: 1.5; color: #475569;">
            A guest has submitted feedback for the <strong>${feedback.guestInfo.department}</strong> department that falls below our 5-star standard (<strong>Average Rating: ${avgRating} ★</strong>).
          </p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #aa841d; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; font-size: 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">GUEST DETAILS</h3>
            <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; width: 120px;"><strong>Guest Name:</strong></td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${feedback.guestInfo.name}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Room/Table:</strong></td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: bold;">${feedback.guestInfo.roomNumber}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Mobile:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${feedback.guestInfo.mobile || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Email:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${feedback.guestInfo.email || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Department:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${feedback.guestInfo.department}</td>
              </tr>
              ${feedback.guestInfo.staffName ? `
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Staff Named:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${feedback.guestInfo.staffName}</td>
              </tr>` : ''}
            </table>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 8px;">RATINGS BREAKDOWN</h3>
            <div style="margin-bottom: 12px;">
              ${Object.entries(feedback.ratings).map(([key, val]) => `
                <span style="background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 6px; margin-bottom: 6px; display: inline-block;">
                  <strong>${key.replace('ov_', '').replace('_', ' ').toUpperCase()}:</strong> ${val}/5 ★
                </span>
              `).join('')}
            </div>
          </div>

          ${feedback.comments ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 4px;">GUEST COMMENTS</h3>
            <p style="font-size: 13px; line-height: 1.5; color: #334155; font-style: italic; background-color: #fffbeb; padding: 12px; border-radius: 8px; border: 1px solid #fef3c7; margin: 0;">
              "${feedback.comments}"
            </p>
          </div>` : ''}

          ${feedback.suggestions ? `
          <div style="margin-bottom: 20px;">
            <h3 style="font-size: 14px; color: #0f172a; margin-bottom: 4px;">CONSTRUCTIVE SUGGESTIONS</h3>
            <p style="font-size: 13px; line-height: 1.5; color: #334155; background-color: #f0fdf4; padding: 12px; border-radius: 8px; border: 1px solid #dcfce7; margin: 0;">
              "${feedback.suggestions}"
            </p>
          </div>` : ''}

          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
            <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">Please initiate the Service Recovery protocol as defined by the Forbes Five-Star SOP.</p>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Arpita Beach Resort Guest Feedback & Recovery Automation Engine
        </div>
      </div>
    `;

    // Format RFC 2822 email message with headers and body
    // Note: To support non-ASCII characters, we'll format as UTF-8
    const emailStr = [
      `To: ${managerEmail}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: base64',
      '',
      btoa(unescape(encodeURIComponent(htmlBody)))
    ].join('\r\n');

    // Base64url encode the entire RFC 2822 structure
    const base64UrlEmail = btoa(unescape(encodeURIComponent(emailStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64UrlEmail
      })
    });

    if (!response.ok) {
      console.error('Gmail API send failed:', await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending alert email:', error);
    return false;
  }
};
