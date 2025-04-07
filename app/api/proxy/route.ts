import { NextResponse } from 'next/server';

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // If we get a 502, the server might be spinning up
      if (response.status === 502) {
        console.log(`Attempt ${i + 1}: Server returned 502, waiting ${delay}ms before retry...`);
        await wait(delay);
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
      await wait(delay);
    }
  }
  throw new Error('Max retries reached');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      console.error('No file received or invalid file');
      return NextResponse.json(
        { error: 'No file received or invalid file' },
        { status: 400 }
      );
    }

    console.log('Forwarding request to prediction service with file:', file.name, 'size:', file.size);
    
    // Forward the request to the prediction service with retry logic
    const response = await fetchWithRetry('https://specialbarnacle.onrender.com/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Prediction service error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      let errorMessage = `Prediction service error: ${response.status} ${response.statusText}`;
      if (response.status === 502) {
        errorMessage = 'The prediction service is currently unavailable or starting up. Please try again in a few moments.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to process image', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetchWithRetry('https://specialbarnacle.onrender.com/', {
      method: 'GET'
    }, 2, 1000);
    
    if (!response.ok) {
      throw new Error('Prediction service is not responding');
    }
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        error: 'Service unavailable', 
        details: 'The prediction service is currently starting up or unavailable. Please try again in a few moments.'
      },
      { status: 503 }
    );
  }
} 