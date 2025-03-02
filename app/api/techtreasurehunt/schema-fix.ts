import { createClient } from '@/app/utils/supabase/server';

/**
 * This utility function checks and attempts to fix issues with the image_code_rounds table
 * if it doesn't match the expected schema.
 */
export async function fixImageCodeSchema() {
  try {
    const supabase = await createClient();
    
    // Check if table exists with proper structure
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'image_code_rounds' });
    
    if (tableError) {
      console.error('Error checking table info:', tableError);
      return false;
    }
    
    console.log('Table info:', tableInfo);
    
    // Create sample image data
    const sampleImages = [
      {
        id: crypto.randomUUID(),
        code: "TH123",
        image_url: "https://placehold.co/600x400/png?text=Code+Challenge+1",
        hint: "Look for three numbers"
      },
      {
        id: crypto.randomUUID(),
        code: "NT456",
        image_url: "https://placehold.co/600x400/png?text=Code+Challenge+2",
        hint: "Code is visible but hard to read"
      },
      {
        id: crypto.randomUUID(),
        code: "HU789",
        image_url: "https://placehold.co/600x400/png?text=Code+Challenge+3",
        hint: "Look at the corners"
      }
    ];
    
    // If images column is jsonb[], try to update types
    try {
      // Get a sample round from event_rounds
      const { data: sampleRound, error: sampleError } = await supabase
        .from('event_rounds')
        .select('id')
        .eq('round_type', 'image_code')
        .limit(1)
        .single();
        
      if (sampleError || !sampleRound) {
        console.log('Could not find a sample image_code round');
        return false;
      }
      
      // Insert sample data to ensure we have valid entries
      const { data: insertData, error: insertError } = await supabase
        .from('image_code_rounds')
        .upsert({
          round_id: sampleRound.id,
          images: sampleImages,
          time_limit: 600,
          passing_score: 0.7
        }, { onConflict: 'round_id' });
        
      if (insertError) {
        console.error('Error inserting sample data:', insertError);
        
        // Try alternate format
        const { error: altError } = await supabase
          .from('image_code_rounds')
          .upsert({
            round_id: sampleRound.id,
            image_count: 3,
            images: JSON.stringify(sampleImages),
            time_limit: 600,
            passing_score: 0.7
          }, { onConflict: 'round_id' });
          
        if (altError) {
          console.error('Error inserting alternate format:', altError);
          return false;
        }
      }
      
      return true;
      
    } catch (error) {
      console.error('Error fixing schema:', error);
      return false;
    }
    
  } catch (error) {
    console.error('Unexpected error in schema fix:', error);
    return false;
  }
}
