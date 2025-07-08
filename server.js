const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BoxSDK = require('box-node-sdk');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize Box SDK (only if credentials are provided)
let sdk = null;
if (process.env.BOX_CLIENT_ID && process.env.BOX_PRIVATE_KEY && process.env.BOX_PRIVATE_KEY !== 'your_box_private_key') {
  try {
    sdk = new BoxSDK({
      clientID: process.env.BOX_CLIENT_ID,
      clientSecret: process.env.BOX_CLIENT_SECRET,
      appAuth: {
        keyID: process.env.BOX_JWT_KEY_ID,
        privateKey: process.env.BOX_PRIVATE_KEY.replace(/\\n/g, '\n'),
        passphrase: process.env.BOX_PASSPHRASE
      }
    });
    console.log('✅ Box SDK initialized successfully');
  } catch (error) {
    console.log('❌ Box SDK initialization failed:', error.message);
    console.log('💡 Running in demo mode - uploads will be simulated');
    sdk = null;
  }
} else {
  console.log('💡 Box credentials not found - running in demo mode');
}

// Initialize OpenAI (only if API key is provided)
let openai = null;if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key') {
  try {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI initialized successfully');
  } catch (error) {
    console.log('❌ OpenAI initialization failed:', error.message);
  }
} else {
  console.log('💡 OpenAI API key not found - using mock summaries');
}

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'upload.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 File uploaded locally:', req.file.filename);
    
    let boxFile;
    let summary = '';

    // Try Box upload if SDK is available
    if (sdk && process.env.BOX_ENTERPRISE_ID) {
      try {
        console.log('📤 Attempting Box upload...');
        const serviceAccountClient = sdk.getAppAuthClient('enterprise', process.env.BOX_ENTERPRISE_ID);
        
        const fileStream = fs.createReadStream(req.file.path);
        boxFile = await serviceAccountClient.files.uploadFile(
          '0', // Root folder
          req.file.originalname,
          fileStream
        );

        console.log('✅ File uploaded to Box:', boxFile.entries[0].id);
      } catch (boxError) {
        console.error('❌ Box upload error:', boxError.message);
        boxFile = null;
      }
    }
    // Demo mode simulation if Box upload failed or not configured
    if (!boxFile) {
      console.log('🎭 Demo mode: Simulating Box upload...');
      boxFile = {
        entries: [{
          id: 'demo_' + Date.now(),
          name: req.file.originalname
        }]
      };
    }

    // Generate AI summary for text files
    console.log('🔍 File MIME type:', req.file.mimetype);
    console.log('🔍 File extension:', path.extname(req.file.originalname));
    
    if (req.file.mimetype.startsWith('text/') || 
        req.file.mimetype === 'application/json' ||
        ['.txt', '.md', '.json', '.js', '.html', '.css', '.xml', '.csv'].includes(path.extname(req.file.originalname).toLowerCase())) {
      
      console.log('📝 Processing text file for AI summary...');
      const fileContent = fs.readFileSync(req.file.path, 'utf8');
      console.log('📄 File content preview:', fileContent.slice(0, 100) + '...');
      summary = await generateSummary(fileContent);
      console.log('✅ Generated summary:', summary);
      
      // Add comment to Box file with summary (only if real Box upload)
      if (sdk && boxFile.entries[0].id.indexOf('demo_') === -1) {
        try {
          const serviceAccountClient = sdk.getAppAuthClient('enterprise', process.env.BOX_ENTERPRISE_ID);
          await serviceAccountClient.comments.create(boxFile.entries[0].id, {
            message: `AI Summary: ${summary}`
          });
          console.log('✅ Added AI summary comment to Box file');
        } catch (commentError) {
          console.log('⚠️ Could not add comment to Box file:', commentError.message);
        }
      }
    } else {
      console.log('⏭️ Skipping AI summary - not a text file');
    }

    // Add metadata tag (only if real Box upload)
    if (sdk && boxFile.entries[0].id.indexOf('demo_') === -1) {
      try {
        const serviceAccountClient = sdk.getAppAuthClient('enterprise', process.env.BOX_ENTERPRISE_ID);
        await serviceAccountClient.files.addMetadata(
          boxFile.entries[0].id,
          'global',
          'properties',
          {
            uploadedBy: 'Smart Uploader',
            uploadDate: new Date().toISOString(),
            hasSummary: summary ? 'true' : 'false'
          }
        );
        console.log('✅ Added metadata to Box file');
      } catch (metadataError) {
        console.log('⚠️ Could not add metadata to Box file:', metadataError.message);
      }
    }
    // Clean up local file
    fs.unlinkSync(req.file.path);

    const isDemo = boxFile.entries[0].id.indexOf('demo_') === 0;
    
    res.json({
      success: true,
      fileId: boxFile.entries[0].id,
      fileName: boxFile.entries[0].name,
      summary: summary || (req.file.mimetype.startsWith('text/') || ['.txt', '.md', '.json'].includes(path.extname(req.file.originalname).toLowerCase()) ? 
        '🎭 Demo summary: Mock AI summary for text content (configure OpenAI for real summaries)' : 
        'No summary available for this file type'),
      demo: isDemo,
      message: isDemo ? '🎭 Demo mode: File processed locally (configure Box credentials for real uploads)' : '✅ File uploaded to Box successfully!'
    });

  } catch (error) {
    console.error('💥 Upload error:', error);
    
    // Clean up local file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
});

// Generate summary using OpenAI
async function generateSummary(content) {
  try {
    if (!openai) {
      return '🎭 Demo summary: This is a mock AI summary since OpenAI is not configured. The file contains text content that would normally be summarized by GPT.';
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes file contents in 2-3 sentences.'
        },
        {
          role: 'user',
          content: `Please summarize this file content: ${content.slice(0, 2000)}...`
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI error:', error);
    return '🎭 Demo summary: AI summarization failed, showing mock summary instead. The file contains text content.';
  }
}
app.listen(PORT, () => {
  console.log(`🚀 Smart File Uploader running on http://localhost:${PORT}`);
  console.log('📋 Status:');
  console.log(`   Box SDK: ${sdk ? '✅ Ready' : '❌ Demo mode'}`);
  console.log(`   OpenAI: ${openai ? '✅ Ready' : '❌ Mock summaries'}`);
  console.log('');
  console.log('💡 To enable full functionality, configure your .env file with:');
  console.log('   - Box SDK credentials (JWT app)');
  console.log('   - OpenAI API key');
});