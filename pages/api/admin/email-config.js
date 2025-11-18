import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), '.env.email');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Load current email configuration
      const config = loadEmailConfig();
      return res.status(200).json(config);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to load email configuration' });
    }
  }

  if (req.method === 'POST') {
    try {
      const {
        mailer,
        port,
        host,
        username,
        password,
        localDomain,
        senderName,
        senderEmail
      } = req.body;

      // Validate required fields
      if (!host || !username || !password || !senderEmail) {
        return res.status(400).json({ 
          error: 'Host, username, password, and sender email are required' 
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(senderEmail)) {
        return res.status(400).json({ error: 'Invalid sender email format' });
      }

      // Save configuration
      const config = {
        mailer: mailer || 'SMTP',
        port: port || '587',
        host,
        username,
        password,
        localDomain: localDomain || '',
        senderName: senderName || 'Gameva',
        senderEmail
      };

      saveEmailConfig(config);

      // Update environment variables for immediate use
      process.env.EMAIL_USER = username;
      process.env.EMAIL_PASS = password;
      process.env.EMAIL_HOST = host;
      process.env.EMAIL_PORT = port;
      process.env.EMAIL_FROM_NAME = senderName;
      process.env.EMAIL_FROM_ADDRESS = senderEmail;

      return res.status(200).json({ 
        success: true, 
        message: 'Email configuration saved successfully',
        config: {
          ...config,
          password: '***' // Don't return password in response
        }
      });
    } catch (error) {
      console.error('Email config save error:', error);
      return res.status(500).json({ error: 'Failed to save email configuration' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function loadEmailConfig() {
  try {
    // Try to load from custom config file first
    if (fs.existsSync(CONFIG_FILE)) {
      const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
      const config = JSON.parse(configContent);
      return config;
    }

    // Fallback to environment variables
    return {
      mailer: process.env.EMAIL_MAILER || 'SMTP',
      port: process.env.EMAIL_PORT || '587',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      username: process.env.EMAIL_USER || '',
      password: '', // Never return actual password
      localDomain: process.env.EMAIL_LOCAL_DOMAIN || '',
      senderName: process.env.EMAIL_FROM_NAME || 'Gameva',
      senderEmail: process.env.EMAIL_FROM_ADDRESS || ''
    };
  } catch (error) {
    // Return default configuration
    return {
      mailer: 'SMTP',
      port: '587',
      host: 'smtp.gmail.com',
      username: '',
      password: '',
      localDomain: '',
      senderName: 'Gameva',
      senderEmail: ''
    };
  }
}

function saveEmailConfig(config) {
  try {
    // Save to custom config file
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    // Also update .env file for persistence
    updateEnvFile(config);
  } catch (error) {
    console.error('Failed to save email config:', error);
    throw error;
  }
}

function updateEnvFile(config) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    // Read existing .env file
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Update or add email configuration variables
    const emailVars = {
      EMAIL_MAILER: config.mailer,
      EMAIL_HOST: config.host,
      EMAIL_PORT: config.port,
      EMAIL_USER: config.username,
      EMAIL_PASS: config.password,
      EMAIL_LOCAL_DOMAIN: config.localDomain,
      EMAIL_FROM_NAME: config.senderName,
      EMAIL_FROM_ADDRESS: config.senderEmail
    };

    // Update each variable
    Object.entries(emailVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });

    // Write back to .env file
    fs.writeFileSync(envPath, envContent.trim() + '\n');
  } catch (error) {
    console.error('Failed to update .env file:', error);
  }
}