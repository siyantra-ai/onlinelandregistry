import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid and not placeholders
const isConfigured = supabaseUrl && supabaseAnonKey && 
                     supabaseUrl !== 'YOUR_SUPABASE_URL' && 
                     supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * Save an enquiry to Supabase, falling back to LocalStorage if not configured.
 * @param {Object} enquiryData - The details of the enquiry
 * @returns {Promise<{success: boolean, data?: any, error?: any}>}
 */
export async function saveEnquiry(enquiryData) {
  const payload = {
    ...enquiryData,
    created_at: new Date().toISOString(),
  };

  console.log('[Enquiry Submit] Processing payload:', payload);

  // If Supabase is configured, save it there
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('enquiries')
        .insert([payload])
        .select();

      if (error) throw error;
      
      // Attempt to mock email/WhatsApp trigger endpoint (if defined)
      try {
        await triggerNotification(payload);
      } catch (notifyErr) {
        console.warn('Notification trigger skipped or failed:', notifyErr.message);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Supabase save error, falling back to localStorage:', error);
      saveToFallback(payload);
      return { success: true, data: payload, warning: 'Saved locally due to server error' };
    }
  } else {
    // LocalStorage Fallback for preview/offline mode
    saveToFallback(payload);
    
    // Simulate API network latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    return { 
      success: true, 
      data: payload, 
      warning: 'Supabase URL/Key missing. Saved to LocalStorage fallback.' 
    };
  }
}

function saveToFallback(payload) {
  try {
    const existing = JSON.parse(localStorage.getItem('landregistry_enquiries') || '[]');
    existing.push(payload);
    localStorage.setItem('landregistry_enquiries', JSON.stringify(existing));
    console.log('[Enquiry] Saved to localStorage backup:', payload);
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

// Simulates sending notification emails/WhatsApp to team
async function triggerNotification(payload) {
  console.log('[Notification Alert] Dispatching alert to conveyancing team...', {
    recipient: 'team@landregistrytransfers.com',
    subject: `New ${payload.service || 'General'} Enquiry - ${payload.name}`,
    body: `Name: ${payload.name}\nPhone: ${payload.phone}\nEmail: ${payload.email}\nDetails: ${payload.notes || 'None'}`
  });
}

/**
 * Save a help request/contact enquiry to Supabase help_requests table.
 */
export async function saveHelpRequest(helpRequestData) {
  const payload = {
    name: helpRequestData.name,
    email: helpRequestData.email,
    subject: helpRequestData.subject,
    message: helpRequestData.body,
    source: 'LRT'
  };

  try {
    const response = await fetch('http://localhost:3001/api/webhooks/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Failed to submit request');
    }

    return { success: true };
  } catch (error) {
    console.error('Webhook help request save error:', error);
    return { success: false, error };
  }
}
