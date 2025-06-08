// Database connection test utility
import { supabase } from './supabase';

export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  if (!supabase) {
    console.error('❌ Supabase client is not initialized');
    return false;
  }

  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('contact_submissions')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError);
      return false;
    }

    console.log('✅ Basic connection successful');
    console.log(`📊 Total records in database: ${connectionTest.count || 0}`);

    // Test 2: Read permissions
    console.log('🔐 Testing read permissions...');
    const { data: readTest, error: readError } = await supabase
      .from('contact_submissions')
      .select('id, created_at')
      .limit(1);

    if (readError) {
      console.log('⚠️ Read test (expected for anonymous users):', readError.message);
    } else {
      console.log('✅ Read permissions working');
    }

    // Test 3: Insert permissions (with test data)
    console.log('📝 Testing insert permissions...');
    const testSubmission = {
      first_name: 'Test',
      last_name: 'User',
      email: `test-${Date.now()}@example.com`,
      phone: '+1 555-0123',
      company_name: 'Test Company',
      industry: 'technology',
      additional_notes: 'This is a test submission',
      newsletter_subscription: false
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('contact_submissions')
      .insert([testSubmission])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      return false;
    }

    console.log('✅ Insert permissions working');
    console.log('📄 Test record created:', insertTest.id);

    // Test 4: Clean up test data
    if (insertTest?.id) {
      console.log('🧹 Cleaning up test data...');
      const { error: deleteError } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', insertTest.id);

      if (deleteError) {
        console.log('⚠️ Could not delete test record (this is normal for anonymous users)');
      } else {
        console.log('✅ Test data cleaned up');
      }
    }

    console.log('🎉 All database tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Database test failed with exception:', error);
    return false;
  }
};

export const getDatabaseStats = async () => {
  if (!supabase) {
    return null;
  }

  try {
    const [totalResult, recentResult, newsletterResult] = await Promise.all([
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('contact_submissions').select('*', { count: 'exact', head: true })
        .eq('newsletter_subscription', true)
    ]);

    return {
      total: totalResult.count || 0,
      recent: recentResult.count || 0,
      newsletter: newsletterResult.count || 0
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
};