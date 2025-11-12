#!/usr/bin/env node

/**
 * Firebase Setup Checker
 * Run this to verify your Firebase configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Setup Checker\n');

// Check 1: .env file exists
console.log('1️⃣  Checking .env file...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env file found');
  
  // Read and check environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'VUE_APP_FIREBASE_API_KEY',
    'VUE_APP_FIREBASE_AUTH_DOMAIN',
    'VUE_APP_FIREBASE_PROJECT_ID',
    'VUE_APP_FIREBASE_STORAGE_BUCKET',
    'VUE_APP_FIREBASE_MESSAGING_SENDER_ID',
    'VUE_APP_FIREBASE_APP_ID'
  ];
  
  let allVarsSet = true;
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=your-`) || !envContent.includes(varName)) {
      console.log(`   ❌ ${varName} not configured`);
      allVarsSet = false;
    } else {
      console.log(`   ✅ ${varName} configured`);
    }
  });
  
  if (!allVarsSet) {
    console.log('\n   ⚠️  Some Firebase variables are not configured!');
    console.log('   → Edit .env file with your Firebase project credentials');
  }
} else {
  console.log('   ❌ .env file not found');
  console.log('   → Run: cp .env.example .env');
  console.log('   → Then edit .env with your Firebase credentials\n');
}

// Check 2: node_modules
console.log('\n2️⃣  Checking dependencies...');
if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('   ✅ Dependencies installed');
} else {
  console.log('   ❌ Dependencies not installed');
  console.log('   → Run: npm install\n');
}

// Check 3: Firebase Functions
console.log('\n3️⃣  Checking Firebase Functions...');
const functionsPath = path.join(__dirname, 'functions');
if (fs.existsSync(functionsPath)) {
  console.log('   ✅ Functions folder exists');
  
  if (fs.existsSync(path.join(functionsPath, 'node_modules'))) {
    console.log('   ✅ Functions dependencies installed');
  } else {
    console.log('   ⚠️  Functions dependencies not installed');
    console.log('   → Run: cd functions && npm install');
  }
} else {
  console.log('   ❌ Functions folder not found');
}

// Check 4: Firebase CLI
console.log('\n4️⃣  Checking Firebase CLI...');
const { execSync } = require('child_process');
try {
  const firebaseVersion = execSync('firebase --version', { encoding: 'utf8' });
  console.log(`   ✅ Firebase CLI installed (${firebaseVersion.trim()})`);
} catch (error) {
  console.log('   ⚠️  Firebase CLI not installed');
  console.log('   → Run: npm install -g firebase-tools');
  console.log('   → Then: firebase login');
}

// Check 5: Package.json
console.log('\n5️⃣  Checking package.json...');
if (fs.existsSync(path.join(__dirname, 'package.json'))) {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log(`   ✅ Project: ${pkg.name}`);
  console.log(`   ✅ Version: ${pkg.version}`);
} else {
  console.log('   ❌ package.json not found');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📋 SUMMARY\n');

console.log('To run your project:');
console.log('1. Make sure .env is configured ✅');
console.log('2. Run: npm install (if not done) ✅');
console.log('3. Run: npm run serve 🚀\n');

console.log('Optional (for full features):');
console.log('4. Run: cd functions && npm install');
console.log('5. Run: firebase login');
console.log('6. Run: firebase emulators:start\n');

console.log('Your app will be at: http://localhost:8080');
console.log('='.repeat(50) + '\n');

console.log('Need help? Read HOW_TO_RUN.md 📚\n');
