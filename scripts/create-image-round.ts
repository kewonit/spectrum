// This is a utility script to create an image code round for testing
// You can copy-paste this into your browser console after logged in

async function createImageRound() {
  // Replace with the actual Round ID for your image code round
  const roundId = 'YOUR_IMAGE_ROUND_ID_HERE'; 
  
  try {
    const response = await fetch('/api/techtreasurehunt/init-image-round', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roundId }),
    });
    
    const result = await response.json();
    console.log('Image round creation result:', result);
    
    if (response.ok) {
      console.log('✅ Image round created successfully!');
    } else {
      console.error('❌ Failed to create image round:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('Script error:', error);
  }
}

// Execute the function
createImageRound().then(data => {
  console.log('Done!', data);
});
