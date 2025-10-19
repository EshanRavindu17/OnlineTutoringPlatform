#!/usr/bin/env node

/**
 * Critical Unit Test Runner for Online Tutoring Platform
 * Focuses on testing the most critical components for system reliability
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, cwd, description) {
  log(`\n${colors.cyan}${description}${colors.reset}`);
  log(`${colors.yellow}Running: ${command}${colors.reset}`);
  log(`${colors.blue}In directory: ${cwd}${colors.reset}`);

  try {
    const output = execSync(command, {
      cwd,
      stdio: "inherit",
      encoding: "utf8",
    });
    log(
      `${colors.green}✅ ${description} completed successfully${colors.reset}`
    );
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`);
    log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

function checkDependencies() {
  log(`${colors.bright}Checking dependencies...${colors.reset}`);

  const frontendPackageJson = path.join(__dirname, "frontend", "package.json");
  const backendPackageJson = path.join(__dirname, "backend", "package.json");

  if (!fs.existsSync(frontendPackageJson)) {
    log(`${colors.red}❌ Frontend package.json not found${colors.reset}`);
    return false;
  }

  if (!fs.existsSync(backendPackageJson)) {
    log(`${colors.red}❌ Backend package.json not found${colors.reset}`);
    return false;
  }

  log(`${colors.green}✅ Dependencies check passed${colors.reset}`);
  return true;
}

function runBackendTests() {
  log(`${colors.bright}Running Backend Critical Tests...${colors.reset}`);

  const testCommand = process.argv.includes("--watch")
    ? "npm run test:watch"
    : "npm run test";
  const coverageCommand = process.argv.includes("--coverage")
    ? "npm run test:coverage"
    : testCommand;

  return runCommand(
    coverageCommand,
    path.join(__dirname, "backend"),
    "Backend critical test suite"
  );
}

function runFrontendTests() {
  log(`${colors.bright}Running Frontend Critical Tests...${colors.reset}`);

  const testCommand = process.argv.includes("--watch")
    ? "npm run test:watch"
    : "npm run test";
  const coverageCommand = process.argv.includes("--coverage")
    ? "npm run test:coverage"
    : testCommand;

  return runCommand(
    coverageCommand,
    path.join(__dirname, "frontend"),
    "Frontend critical test suite"
  );
}

function generateTestReport() {
  log(`${colors.bright}Generating Critical Test Report...${colors.reset}`);

  const reportPath = path.join(__dirname, "critical-test-report.html");
  const frontendCoveragePath = path.join(
    __dirname,
    "frontend",
    "coverage",
    "lcov-report",
    "index.html"
  );
  const backendCoveragePath = path.join(
    __dirname,
    "backend",
    "coverage",
    "lcov-report",
    "index.html"
  );

  let reportContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Critical Unit Test Report - Online Tutoring Platform</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .coverage-link { display: inline-block; margin: 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .coverage-link:hover { background: #0056b3; }
        .critical { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; }
        .test-list { background: #f8f9fa; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Critical Unit Test Report - Online Tutoring Platform</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <div class="critical">
            <strong>⚠️ Critical Components Tested:</strong> Authentication, Payment Processing, User Management, Time Management
        </div>
    </div>
    
    <div class="section">
        <h2>📊 Coverage Reports</h2>
        <p>Click the links below to view detailed coverage reports:</p>
        <a href="${frontendCoveragePath}" class="coverage-link">Frontend Coverage Report</a>
        <a href="${backendCoveragePath}" class="coverage-link">Backend Coverage Report</a>
    </div>
    
    <div class="section">
        <h2>🔐 Critical Test Components</h2>
        
        <h3>Backend Critical Tests:</h3>
        <div class="test-list">
            <ul>
                <li><strong>JWT Utils</strong> - Authentication token management</li>
                <li><strong>Password Utils</strong> - Secure password hashing and verification</li>
                <li><strong>Admin Service</strong> - Admin authentication and authorization</li>
                <li><strong>User Service</strong> - User creation, validation, and management</li>
                <li><strong>Payment Service</strong> - Stripe payment processing integration</li>
            </ul>
        </div>
        
        <h3>Frontend Critical Tests:</h3>
        <div class="test-list">
            <ul>
                <li><strong>Time Slot Utils</strong> - Critical time management functions</li>
                <li><strong>Token Manager</strong> - Authentication state management</li>
                <li><strong>Email Verification</strong> - User email verification flow</li>
            </ul>
        </div>
    </div>
    
    <div class="section">
        <h2>🚀 Running Critical Tests</h2>
        <h3>Run all critical tests:</h3>
        <code>node test-runner.js</code>
        
        <h3>Run with coverage:</h3>
        <code>node test-runner.js --coverage</code>
        
        <h3>Run in watch mode:</h3>
        <code>node test-runner.js --watch</code>
        
        <h3>Run only backend critical tests:</h3>
        <code>cd backend && npm test</code>
        
        <h3>Run only frontend critical tests:</h3>
        <code>cd frontend && npm test</code>
    </div>
    
    <div class="section">
        <h2>🎯 Test Coverage Goals</h2>
        <div class="critical">
            <p><strong>Minimum Coverage Thresholds:</strong></p>
            <ul>
                <li>Branches: 60%</li>
                <li>Functions: 60%</li>
                <li>Lines: 60%</li>
                <li>Statements: 60%</li>
            </ul>
            <p><em>These tests focus on the most critical paths that could cause system failures.</em></p>
        </div>
    </div>
    
    <div class="section">
        <h2>🔍 What These Tests Cover</h2>
        <ul>
            <li><strong>Authentication Security:</strong> JWT token validation, password hashing, admin auth</li>
            <li><strong>Payment Processing:</strong> Stripe integration, payment intent creation, error handling</li>
            <li><strong>User Management:</strong> User creation, validation, role management</li>
            <li><strong>Time Management:</strong> Session scheduling, time slot validation</li>
            <li><strong>State Management:</strong> Token storage, authentication state persistence</li>
        </ul>
    </div>
</body>
</html>`;

  try {
    fs.writeFileSync(reportPath, reportContent);
    log(
      `${colors.green}✅ Critical test report generated: ${reportPath}${colors.reset}`
    );
  } catch (error) {
    log(
      `${colors.red}❌ Failed to generate test report: ${error.message}${colors.reset}`
    );
  }
}

function main() {
  log(
    `${colors.bright}${colors.magenta}🔒 Online Tutoring Platform - Critical Unit Test Runner${colors.reset}`
  );
  log(
    `${colors.cyan}==============================================================${colors.reset}`
  );

  const startTime = Date.now();
  let allTestsPassed = true;

  // Check dependencies
  if (!checkDependencies()) {
    log(`${colors.red}❌ Dependency check failed${colors.reset}`);
    process.exit(1);
  }

  // Run backend critical tests
  if (!process.argv.includes("--frontend-only")) {
    if (!runBackendTests()) {
      allTestsPassed = false;
    }
  }

  // Run frontend critical tests
  if (!process.argv.includes("--backend-only")) {
    if (!runFrontendTests()) {
      allTestsPassed = false;
    }
  }

  // Generate test report
  generateTestReport();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  log(
    `\n${colors.cyan}==============================================================${colors.reset}`
  );
  if (allTestsPassed) {
    log(
      `${colors.green}${colors.bright}🎉 All critical tests completed successfully!${colors.reset}`
    );
    log(
      `${colors.green}✅ System critical components are functioning properly${colors.reset}`
    );
  } else {
    log(
      `${colors.red}${colors.bright}❌ Some critical tests failed${colors.reset}`
    );
    log(
      `${colors.red}⚠️  Please review failed tests before deploying${colors.reset}`
    );
  }
  log(`${colors.blue}Total time: ${duration}s${colors.reset}`);

  if (process.argv.includes("--coverage")) {
    log(
      `${colors.yellow}📊 Coverage reports generated in coverage/ directories${colors.reset}`
    );
  }

  process.exit(allTestsPassed ? 0 : 1);
}

// Handle command line arguments
if (process.argv.includes("--help")) {
  log(
    `${colors.bright}Online Tutoring Platform - Critical Unit Test Runner${colors.reset}`
  );
  log("\nUsage: node test-runner.js [options]");
  log("\nOptions:");
  log("  --coverage       Generate coverage reports");
  log("  --watch          Run tests in watch mode");
  log("  --frontend-only  Run only frontend critical tests");
  log("  --backend-only   Run only backend critical tests");
  log("  --help           Show this help message");
  log("\nCritical Components Tested:");
  log("  • Authentication (JWT, Password Hashing)");
  log("  • Payment Processing (Stripe Integration)");
  log("  • User Management (CRUD Operations)");
  log("  • Time Management (Session Scheduling)");
  log("  • State Management (Token Storage)");
  process.exit(0);
}

main();
