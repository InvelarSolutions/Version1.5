import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have placeholder values or empty values
const hasPlaceholderValues = 
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl === 'your_supabase_project_url' ||
  supabaseAnonKey === 'your_supabase_anon_key' ||
  supabaseUrl.includes('your_supabase') ||
  supabaseAnonKey.includes('your_supabase');

// Validate environment variables
if (hasPlaceholderValues) {
  console.warn('Supabase environment variables are not configured properly. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file with your actual Supabase project credentials.');
}

// Only create client if we have valid values
export const supabase = !hasPlaceholderValues && supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Contact submission type for backward compatibility
export interface ContactSubmission {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  newsletter_subscription: boolean;
  created_at?: string;
}

// Helper functions for contact submission management
export const contactService = {
  // Insert a new contact submission
  async createContactSubmission(submissionData: Database['public']['Tables']['contact_submissions']['Insert']) {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([submissionData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create contact submission: ${error.message}`);
    }

    return data;
  },

  // Get all contact submissions (admin only)
  async getAllContactSubmissions() {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contact submissions: ${error.message}`);
    }

    return data;
  },

  // Get contact submissions with pagination
  async getContactSubmissionsPaginated(page: number = 1, limit: number = 50) {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch contact submissions: ${error.message}`);
    }

    return {
      data,
      count,
      page,
      limit,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  },

  // Search contact submissions by email or name
  async searchContactSubmissions(query: string) {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search contact submissions: ${error.message}`);
    }

    return data;
  },

  // Get contact submissions by newsletter subscription status
  async getContactSubmissionsByNewsletterStatus(subscribed: boolean) {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('newsletter_subscription', subscribed)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contact submissions by newsletter status: ${error.message}`);
    }

    return data;
  },

  // Get contact submission statistics
  async getContactSubmissionStats() {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const [totalResult, newsletterResult, recentResult] = await Promise.all([
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('newsletter_subscription', true),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    return {
      total: totalResult.count || 0,
      newsletterSubscribers: newsletterResult.count || 0,
      recentSubmissions: recentResult.count || 0
    };
  }
};