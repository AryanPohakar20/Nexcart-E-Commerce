import 'dotenv/config'; // Load env vars
import { uploadImage } from '../src/services/supabaseStorageService.js';
import fs from 'fs';
import path from 'path';

const testUpload = async () => {
  try {
    console.log('Testing Supabase Image Upload...');

    // Create a dummy image buffer (a 1x1 pixel gif or just some text buffer masquerading as an image)
    const buffer = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
    
    console.log('Uploading mock buffer...');
    const result = await uploadImage(buffer, 'test-folder', 'test.gif');

    console.log('Upload Result:', result);
    
    if (result && result.url && result.path) {
      console.log('✅ TEST PASSED: Supabase upload successful and returned { url, path }');
    } else {
      console.error('❌ TEST FAILED: Supabase upload did not return { url, path } properly');
    }

  } catch (error) {
    console.error('❌ TEST FAILED with error:', error.message);
  }
};

testUpload();
