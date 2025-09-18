const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bplyxhysnhgwawjwflcm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbHl4aHlzbmhnd2F3andmbGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwODI2MTYsImV4cCI6MjA3MzY1ODYxNn0.esNby8Bd85rL588Fb5PoDDCKVVmE_k8z36vP5Y8lAhQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('🚀 Creating Sequel Tracker tables...');

  try {
    // Test basic connection first
    console.log('🔍 Testing connection...');
    const { data, error } = await supabase.from('auth.users').select('count').limit(1);

    if (error) {
      console.log('Connection test result:', error);
    } else {
      console.log('✅ Connection successful');
    }

    // For now, let's create some test data to verify our connection works
    console.log('📝 The database schema needs to be created via Supabase Dashboard SQL Editor');
    console.log('');
    console.log('Please go to your Supabase Dashboard:');
    console.log('1. Visit: https://supabase.com/dashboard/project/bplyxhysnhgwawjwflcm');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the SQL from supabase-schema.sql file');
    console.log('');
    console.log('After that, you can use the MCP servers and this application!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

createTables();