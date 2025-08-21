/**
 * Plugin test script
 */

const fs = require('fs');
const path = require('path');

class PluginTester {
    constructor() {
        this.pluginDir = __dirname;
        this.testResults = [];
        this.requiredFiles = [
            'manifest.json',
            'main.js',
            'subtitle.html',
            'README.md'
        ];
    }

    async runTests() {
        console.log('🧪 Running plugin tests...\n');
        
        try {
            // Test file structure
            await this.testFileStructure();
            
            // Test manifest
            await this.testManifest();
            
            // Test main.js
            await this.testMainJs();
            
            // Test subtitle.html
            await this.testSubtitleHtml();
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Test failed:', error);
            process.exit(1);
        }
    }

    async testFileStructure() {
        console.log('📁 Testing file structure...');
        
        for (const file of this.requiredFiles) {
            const filePath = path.join(this.pluginDir, file);
            const exists = fs.existsSync(filePath);
            
            this.addTestResult(`File exists: ${file}`, exists);
            
            if (exists) {
                const stats = fs.statSync(filePath);
                this.addTestResult(`File size: ${file} (${(stats.size / 1024).toFixed(2)} KB)`, stats.size > 0);
            }
        }
        
        console.log('✅ File structure test completed\n');
    }

    async testManifest() {
        console.log('📋 Testing manifest.json...');
        
        const manifestPath = path.join(this.pluginDir, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Required fields
        const requiredFields = ['name', 'version', 'description', 'main'];
        for (const field of requiredFields) {
            this.addTestResult(`Manifest has ${field}`, !!manifest[field]);
        }
        
        // Check main file exists
        const mainPath = path.join(this.pluginDir, manifest.main);
        this.addTestResult(`Main file exists: ${manifest.main}`, fs.existsSync(mainPath));
        
        // Check permissions
        if (manifest.permissions) {
            this.addTestResult('Has permissions', Array.isArray(manifest.permissions));
            this.addTestResult('Has required permissions', 
                manifest.permissions.includes('fileSystem') && 
                manifest.permissions.includes('item') &&
                manifest.permissions.includes('player')
            );
        }
        
        console.log('✅ Manifest test completed\n');
    }

    async testMainJs() {
        console.log('🔧 Testing main.js...');
        
        const mainPath = path.join(this.pluginDir, 'main.js');
        const content = fs.readFileSync(mainPath, 'utf8');
        
        // Check for required components
        this.addTestResult('Has EagleSubtitlePlugin class', content.includes('class EagleSubtitlePlugin'));
        this.addTestResult('Has SubtitleParser class', content.includes('class SubtitleParser'));
        this.addTestResult('Has eagle.onPluginCreate', content.includes('eagle.onPluginCreate'));
        this.addTestResult('Has eagle.onPluginRun', content.includes('eagle.onPluginRun'));
        this.addTestResult('Has eagle.player events', content.includes('eagle.player.on'));
        
        // Check for required methods
        const requiredMethods = ['init', 'setupEventListeners', 'handleFileSelection', 'loadSubtitles'];
        for (const method of requiredMethods) {
            this.addTestResult(`Has method: ${method}`, content.includes(method));
        }
        
        console.log('✅ Main.js test completed\n');
    }

    async testSubtitleHtml() {
        console.log('🌐 Testing subtitle.html...');
        
        const subtitlePath = path.join(this.pluginDir, 'subtitle.html');
        const content = fs.readFileSync(subtitlePath, 'utf8');
        
        // Check for HTML structure
        this.addTestResult('Has HTML doctype', content.includes('<!DOCTYPE html>'));
        this.addTestResult('Has subtitle container', content.includes('id="subtitleContainer"'));
        this.addTestResult('Has subtitle text', content.includes('id="subtitleText"'));
        this.addTestResult('Has control panel', content.includes('id="controlPanel"'));
        
        // Check for JavaScript
        this.addTestResult('Has electron require', content.includes('require(\'electron\')'));
        this.addTestResult('Has IPC listeners', content.includes('ipcRenderer.on'));
        
        // Check for CSS
        this.addTestResult('Has embedded CSS', content.includes('<style>'));
        this.addTestResult('Has responsive design', content.includes('@media'));
        
        console.log('✅ Subtitle.html test completed\n');
    }

    addTestResult(description, passed) {
        this.testResults.push({
            description,
            passed,
            timestamp: new Date().toISOString()
        });
    }

    displayResults() {
        console.log('📊 Test Results:\n');
        
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = this.testResults.filter(r => !r.passed).length;
        const total = this.testResults.length;
        
        console.log(`Total tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success rate: ${((passed / total) * 100).toFixed(1)}%\n`);
        
        if (failed > 0) {
            console.log('❌ Failed tests:');
            this.testResults
                .filter(r => !r.passed)
                .forEach(r => {
                    console.log(`  - ${r.description}`);
                });
            console.log('');
        }
        
        if (failed === 0) {
            console.log('🎉 All tests passed! Plugin is ready for use.\n');
        } else {
            console.log('⚠️ Some tests failed. Please fix the issues before using the plugin.\n');
            process.exit(1);
        }
    }
}

// Run tests
const tester = new PluginTester();
tester.runTests();