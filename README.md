# 📦 Smart File Uploader

A demonstration project showcasing **Box SDK integration** with **AI-powered file summarization** using OpenAI. Built for the Box SDK technical assessment.

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-v16+-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 **Demo Features**

### 🚀 **Core Functionality**
- **📤 Direct Box Upload**: Upload files to Box using official Node.js SDK
- **🤖 AI-Powered Summaries**: OpenAI generates intelligent summaries for text files  
- **🏷️ Smart Metadata**: Automatic tagging and comments in Box
- **🎭 Demo Mode**: Works without credentials for testing

### 💫 **User Experience**
- **Drag & Drop Interface**: Modern, intuitive file upload
- **Real-time Feedback**: Upload progress and status updates
- **Error Handling**: Graceful fallbacks and user-friendly messages
- **Responsive Design**: Works on desktop and mobile

## 🔧 **Tech Stack**

- **Backend**: Node.js + Express
- **File Upload**: Multer middleware
- **Box Integration**: Official Box Node SDK (JWT authentication)
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Frontend**: Vanilla HTML/CSS/JavaScript

## 📁 **Project Structure**

```
smart-uploader/
├── server.js          # Main Express server with Box & OpenAI integration
├── upload.html        # Frontend interface with drag-and-drop
├── package.json       # Dependencies and scripts
├── .env.example       # Environment variables template
├── README.md         # This file
└── uploads/          # Temporary upload directory
```

## 🚀 **Quick Start**

### 1. **Clone & Install**
```bash
git clone <your-repo-url>
cd smart-uploader
npm install
```

### 2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your credentials (see Configuration section)
```

### 3. **Run in Demo Mode** (No credentials needed)
```bash
npm start
# Visit http://localhost:3000
```

### 4. **Full Setup** (Optional - for real Box uploads)
- Configure Box JWT app (see Configuration section)
- Add OpenAI API key
- Restart server

## ⚙️ **Configuration**

### **Box Developer App Setup**

1. **Create App** at [Box Developer Console](https://developer.box.com/)
2. **Choose**: Server Authentication (with JWT)
3. **Configure**:
   - Application Access: Enterprise
   - Application Scopes: Read/Write files, Manage users
   - Advanced Features: Make API calls using the as-user header
4. **Download** the JSON config file
5. **Extract credentials** for .env file

### **Environment Variables**
```bash
# Box SDK Configuration
BOX_CLIENT_ID=your_client_id
BOX_CLIENT_SECRET=your_client_secret  
BOX_ENTERPRISE_ID=your_enterprise_id
BOX_JWT_KEY_ID=your_jwt_key_id
BOX_PRIVATE_KEY="-----BEGIN ENCRYPTED PRIVATE KEY-----\nYOUR_KEY\n-----END ENCRYPTED PRIVATE KEY-----"
BOX_PASSPHRASE=your_passphrase

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=3000
```

### **Box App Authorization**
```bash
# In Box Admin Console:
# Enterprise Settings > Apps > Authorize using Client ID
```

## 🎭 **Demo Mode**

The app intelligently runs in demo mode when credentials aren't configured:

- ✅ **File uploads work** (processed locally)
- ✅ **UI fully functional** (drag-and-drop, progress, results)
- ✅ **Mock AI summaries** generated for text files
- ✅ **Simulated Box file IDs** created
- 📝 **Demo indicators** show what's simulated vs real

Perfect for testing the interface and logic without API setup!

## 📊 **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/`      | Serves the upload interface |
| `POST` | `/upload`| Handles file upload and processing |

### **Upload Response Example**
```json
{
  "success": true,
  "fileId": "12345",
  "fileName": "document.txt", 
  "summary": "This document contains...",
  "demo": false,
  "message": "File uploaded to Box successfully!"
}
```

## 🔍 **Technical Highlights**

### **Box SDK Integration**
- **JWT Authentication**: Enterprise-level security
- **File Upload**: Direct upload to Box root folder
- **Metadata Management**: Custom properties and tags
- **Comment System**: AI summaries added as file comments

### **AI Processing**
- **Smart Detection**: Identifies text files for processing
- **Content Analysis**: OpenAI GPT-3.5-turbo summarization
- **Fallback Handling**: Mock summaries when API unavailable
- **Error Recovery**: Graceful degradation

### **Production Ready**
- **Security**: Environment variable protection
- **Error Handling**: Comprehensive try-catch blocks
- **File Cleanup**: Automatic temporary file removal
- **Resource Limits**: 10MB upload size limit

## 🛠️ **Development**

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Check for issues
npm audit
```

## 🧪 **Testing**

Upload different file types to see the behavior:

- **📝 Text files** (.txt, .md, .json) → AI summaries generated
- **🖼️ Images** (.jpg, .png) → "No summary available" 
- **📄 Documents** (.pdf, .docx) → File uploaded, no summary

## 🔧 **Troubleshooting**

### **Common Issues**

| Issue | Solution |
|-------|----------|
| Box authentication fails | Check JWT credentials in .env |
| Port 3000 in use | `lsof -ti:3000 \| xargs kill -9` |
| Upload fails | Check file size (10MB limit) |
| No AI summary | Verify file is text type |

### **Debug Mode**
The server logs detailed information about:
- 🔍 File MIME type detection
- 📤 Box upload attempts  
- 🤖 AI summary generation
- ⚠️ Error conditions

## 📈 **Extensions & Ideas**

- 📁 **Custom Box folders** selection
- 🔄 **Batch upload** support  
- 👁️ **File preview** functionality
- 📊 **Advanced metadata** schemas
- 🎯 **Box Skills** integration
- 🔐 **User authentication** 
- 📱 **Mobile app** version

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🙋‍♂️ **Support**

- 📖 **Documentation**: [Box SDK Docs](https://developer.box.com/)
- 🤖 **OpenAI**: [API Documentation](https://platform.openai.com/docs)


