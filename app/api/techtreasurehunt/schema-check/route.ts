import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { fixImageCodeSchema } from '../schema-fix';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the image_code_rounds table schema
    const { data: columns, error: columnsError } = await supabase.rpc(
      'get_table_columns',
      { table_name: 'image_code_rounds' }
    );
    
    if (columnsError) {
      console.error('Error fetching columns:', columnsError);
      return NextResponse.json({ error: 'Failed to fetch schema' }, { status: 500 });
    }
    
    // Get sample data
    const { data: rounds, error: roundsError } = await supabase
      .from('image_code_rounds')
      .select('*')
      .limit(1);
    
    if (roundsError) {
      console.error('Error fetching sample data:', roundsError);
    }
    
    const sampleData = rounds && rounds.length > 0 ? rounds[0] : null;
    
    // Check if we need to fix the schema
    const needsFix = !sampleData || !sampleData.images;
    
    let fixResult = false;
    if (needsFix) {
      console.log('Schema needs fixing, attempting to fix...');
      fixResult = await fixImageCodeSchema();
    }
    
    // Check image_code_submissions table too
    const { data: submissionColumns, error: submissionError } = await supabase.rpc(
      'get_table_columns',
      { table_name: 'image_code_submissions' }
    );
    
    return NextResponse.json({
      status: 'success',
      schema: {
        columns,
        sample: sampleData ? {
          hasImages: !!sampleData.images,
          imageType: typeof sampleData.images,
          isArray: Array.isArray(sampleData.images)
        } : null,
        needsFix,
        fixAttempted: needsFix,
        fixResult: needsFix ? fixResult : null
      },
      submissions: {
        columns: submissionColumns,
        error: submissionError ? submissionError.message : null
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in schema-check route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
