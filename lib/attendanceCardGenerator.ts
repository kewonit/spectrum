import domtoimage from 'dom-to-image';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

// Interface for the card generation result
interface CardGenerationResult {
  success: boolean;
  imageUrl?: string;
  fileName?: string;
  error?: string;
}

/**
 * Generates an attendance card image from profile data without UI
 */
export async function generateAttendanceCardImage(profile: any): Promise<CardGenerationResult> {
  try {
    // Create a container div that will be rendered offscreen
    const container = document.createElement('div');
    
    // Apply initial styles before adding to DOM
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.zIndex = '-1000';
    container.style.width = '340px'; // Set width directly on container
    container.style.backgroundColor = '#f8fafc';
    container.style.borderRadius = '12px';
    container.style.overflow = 'hidden';
    container.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    // Make sure container is visible during rendering
    container.style.opacity = '1';
    container.style.visibility = 'visible';
    container.style.minHeight = '700px';
    
    // Add to DOM
    document.body.appendChild(container);
    
    try {
      // Build the full card HTML with inline styles
      container.innerHTML = generateCardHTML(profile);
      
      // Preload the logo to ensure it renders
      await preloadImage("https://res.cloudinary.com/dfyrk32ua/image/upload/v1705914025/Spectrum/Homepage/logo_qb4lcm.png");
      
      // Wait for all images to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate QR code for the placeholder
      const qrCodeElement = container.querySelector('.qr-code-placeholder');
      if (qrCodeElement) {
        // Generate QR code as data URL
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(profile.id || 'unknown', {
            width: 140,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            },
            errorCorrectionLevel: 'H'
          });
          
          // Create and append the image to the placeholder
          const qrCodeImage = document.createElement('img');
          qrCodeImage.src = qrCodeDataUrl;
          qrCodeImage.width = 140;
          qrCodeImage.height = 140;
          qrCodeImage.alt = 'QR Code';
          qrCodeImage.style.display = 'block';
          
          // Clear any existing content and append the new QR code image
          qrCodeElement.innerHTML = '';
          qrCodeElement.appendChild(qrCodeImage);
          
          // Wait for QR code to render
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (qrError) {
          console.error("Failed to generate QR code:", qrError);
        }
      }
      
      // Force layout calculation
      container.getBoundingClientRect();
      
      // Try generating with dom-to-image first
      try {
        // Generate high-resolution image
        const scale = 3;
        const options = {
          quality: 1.0,
          bgcolor: '#f8fafc',
          height: container.offsetHeight * scale,
          width: container.offsetWidth * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${container.offsetWidth}px`,
            height: `${container.offsetHeight}px`
          },
          cacheBust: true
        };
        
        console.log("Generating high-resolution image with dimensions:", 
          container.offsetWidth, "x", container.offsetHeight);
        
        const blob = await domtoimage.toBlob(container, options);
        const imageUrl = URL.createObjectURL(blob);
        
        // Create filename
        const date = new Date().toLocaleDateString().replace(/\//g, '-');
        const fileName = `${profile.full_name || 'Attendee'}-Spectrum-Card-${date}.png`;
        
        // Cleanup
        document.body.removeChild(container);
        
        return {
          success: true,
          imageUrl,
          fileName
        };
      } catch (domToImageError) {
        console.warn("dom-to-image failed, trying html2canvas fallback:", domToImageError);
        
        // Fallback to html2canvas
        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#f8fafc',
          logging: true,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.body.querySelector('[data-html2canvas-clone]');
            if (clonedElement) {
              // Make sure cloned element is visible
              (clonedElement as HTMLElement).style.visibility = 'visible';
              (clonedElement as HTMLElement).style.opacity = '1';
              (clonedElement as HTMLElement).style.minHeight = '700px';
              (clonedElement as HTMLElement).style.width = '340px';
            }
          }
        });
        
        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          try {
            canvas.toBlob(blob => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to create blob from canvas"));
            }, 'image/png', 1.0);
          } catch (e) {
            reject(e);
          }
        });
        
        const imageUrl = URL.createObjectURL(blob);
        
        // Create filename
        const date = new Date().toLocaleDateString().replace(/\//g, '-');
        const fileName = `${profile.full_name || 'Attendee'}-Spectrum-Card-${date}.png`;
        
        // Cleanup
        document.body.removeChild(container);
        
        return {
          success: true,
          imageUrl,
          fileName
        };
      }
    } catch (innerError) {
      // Make sure to clean up if we hit an error
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
      throw innerError;
    }
  } catch (error) {
    console.error("Error generating attendance card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Simple function that generates just a QR code with name - guaranteed to work
 */
export async function generateSimpleQRCard(profile: any): Promise<CardGenerationResult> {
  try {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Set canvas dimensions
    canvas.width = 600;
    canvas.height = 800;
    
    // Fill background
    ctx.fillStyle = '#EBE9E0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add header
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, 120);
    
    // Add logo text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SPECTRUM 2025', canvas.width / 2, 70);
    
    // Add title
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Attendance Card', canvas.width / 2, 180);
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(profile.id || 'unknown', {
      width: 320,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    });
    
    // Load QR code image
    const qrCode = new Image();
    await new Promise((resolve, reject) => {
      qrCode.onload = resolve;
      qrCode.onerror = reject;
      qrCode.src = qrCodeDataUrl;
    });
    
    // Draw QR code
    const qrX = (canvas.width - 320) / 2;
    ctx.drawImage(qrCode, qrX, 220, 320, 320);
    
    // Add user name
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(profile.full_name || 'User', canvas.width / 2, 600);
    
    // Add instruction text
    ctx.fillStyle = '#6b7280';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Scan for event check-in', canvas.width / 2, 650);
    
    // Draw footer
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PCCOE Spectrum', canvas.width / 2, canvas.height - 30);
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob from canvas"));
        }, 'image/png', 1.0);
      } catch (e) {
        reject(e);
      }
    });
    
    const imageUrl = URL.createObjectURL(blob);
    
    // Create filename
    const date = new Date().toLocaleDateString().replace(/\//g, '-');
    const fileName = `${profile.full_name || 'Attendee'}-QR-Card-${date}.png`;
    
    return {
      success: true,
      imageUrl,
      fileName
    };
  } catch (error) {
    console.error("Error generating simple QR card:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Preload an image to ensure it's in the browser cache
 */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Generates the HTML content for the attendance card
 */
function generateCardHTML(profile: any): string {
  // Get the registered events
  let eventsHtml = '<p class="text-xs text-gray-500 italic" style="margin: 0;">No registered events</p>';
  
  try {
    // Get events from localStorage if available (fallback mechanism)
    const storedRegistrations = localStorage.getItem('userRegistrations');
    const registrations = storedRegistrations ? JSON.parse(storedRegistrations) : [];
    
    if (registrations && registrations.length > 0) {
      eventsHtml = registrations.map((reg: any) => `
        <div style="background-color: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #f0f0f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
            <span style="font-weight: 500; font-size: 12px; color: #374151; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${reg.event?.name || 'Event'}</span>
            <span style="background-color: ${reg.type === 'solo' ? '#F5F3FF' : '#EFF6FF'}; color: ${reg.type === 'solo' ? '#7C3AED' : '#3B82F6'}; font-size: 10px; padding: 2px 6px; border-radius: 9999px; border: 1px solid ${reg.type === 'solo' ? '#DDD6FE' : '#BFDBFE'};">
              ${reg.type === 'solo' ? 'Solo' : 'Team'}
            </span>
          </div>
          ${reg.type === 'team' && reg.team ? `
            <p style="font-size: 10px; color: #6B7280; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              Team: ${reg.team.name}
            </p>
          ` : ''}
        </div>
      `).join('');
    }
  } catch (e) {
    console.error("Error generating events HTML:", e);
  }

  // Generate a static HTML version of the card
  return `
    <div style="width: 340px; background-color: #EBE9E0; font-family: system-ui, -apple-system, sans-serif; position: relative; overflow: hidden;">
      <!-- Logo header -->
      <div style="background-color: black; padding: 20px; border-bottom: 1px solid #1a202c; display: flex; justify-content: center; align-items: center;">
        <img 
          src="https://res.cloudinary.com/dfyrk32ua/image/upload/v1705914025/Spectrum/Homepage/logo_qb4lcm.png"
          alt="Spectrum Logo" 
          style="height: 64px; width: auto; object-fit: contain;"
          crossorigin="anonymous"
        />
      </div>
      
      <!-- Card header -->
      <div style="padding: 20px; display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-weight: bold; color: #1e3a8a; margin: 0;">Attendance Card</h3>
        <div style="background-color: rgba(37, 99, 235, 0.1); color: #2563eb; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500;">
          SPECTRUM 2025
        </div>
      </div>
      
      <!-- QR Code section -->
      <div style="padding: 0 20px 16px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="background-color: white; padding: 10px; border-radius: 8px; border: 1px solid #f3f4f6; box-shadow: 0 1px 2px rgba(0,0,0,0.05); margin-bottom: 8px; width: 150px; height: 150px; display: flex; align-items: center; justify-content: center;">
          <!-- QR code will be injected here -->
          <div class="qr-code-placeholder" style="width:140px; height:140px;"></div>
        </div>
        <p style="font-size: 12px; text-align: center; color: #6b7280; margin: 0;">Scan for event check-in</p>
      </div>
      
      <!-- Profile info section -->
      <div style="padding: 12px 20px; border-top: 1px solid rgba(59, 130, 246, 0.1); border-bottom: 1px solid rgba(59, 130, 246, 0.1); background-color: rgba(255, 255, 255, 0.6);">
        <h2 style="font-weight: bold; font-size: 18px; color: #1f2937; margin: 0 0 8px 0;">
          ${profile.full_name || 'N/A'}
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px 12px;">
          <div>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 2px 0;">Email</p>
            <p style="font-weight: 500; color: #4b5563; font-size: 14px; margin: 0; overflow: hidden; text-overflow: ellipsis;">${profile.email || 'N/A'}</p>
          </div>
          <div>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 2px 0;">Phone</p>
            <p style="font-weight: 500; color: #4b5563; font-size: 14px; margin: 0;">${profile.phone || 'N/A'}</p>
          </div>
          <div style="grid-column: span 2; margin-top: 2px;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 2px 0;">College</p>
            <p style="font-weight: 500; color: #2563eb; font-size: 14px; margin: 0; overflow: hidden; text-overflow: ellipsis;">${profile.college_name || 'N/A'}</p>
          </div>
        </div>
      </div>
      
      <!-- Registered events section -->
      <div style="padding: 12px 20px; min-height: 100px;">
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <p style="font-size: 14px; font-weight: 500; color: #2563eb; margin: 0;">Registered Events</p>
        </div>
        
        <div style="max-height: 180px; overflow-y: auto;">
          ${eventsHtml}
        </div>
      </div>
      
      <!-- Footer section -->
      <div style="padding: 16px; display: flex; justify-content: space-between; align-items: center; background-color: rgba(255, 255, 255, 0.4); font-size: 12px; color: #6b7280; border-top: 1px solid rgba(59, 130, 246, 0.1);">
        <div>ID: ${profile.id ? profile.id.substring(0, 8) + '...' : 'N/A'}</div>
        <div style="font-weight: 500; color: #2563eb;">PCCOE Spectrum</div>
      </div>
      
      <!-- Background elements -->
      <div style="position: absolute; top: 0; right: 0; height: 128px; width: 128px; margin-top: -64px; margin-right: -64px; background-color: rgba(191, 219, 254, 0.3); border-radius: 9999px; filter: blur(16px);"></div>
      <div style="position: absolute; bottom: 0; left: 0; height: 96px; width: 96px; margin-bottom: -48px; margin-left: -48px; background-color: rgba(216, 180, 254, 0.3); border-radius: 9999px; filter: blur(16px);"></div>
    </div>
  `;
}
