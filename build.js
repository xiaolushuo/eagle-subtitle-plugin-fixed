/**
 * Build script for Eagle subtitle plugin
 */

const fs = require('fs');
const path = require('path');

class PluginBuilder {
    constructor() {
        this.pluginDir = __dirname;
        this.distDir = path.join(__dirname, 'dist');
        this.requiredFiles = [
            'manifest.json',
            'main.js',
            'subtitle.html',
            'README.md'
        ];
    }

    async build() {
        console.log('🔨 Building Eagle subtitle plugin...');
        
        try {
            // Clean dist directory
            await this.cleanDist();
            
            // Create dist directory
            await this.createDist();
            
            // Copy required files
            await this.copyRequiredFiles();
            
            // Validate plugin
            await this.validatePlugin();
            
            // Create package info
            await this.createPackageInfo();
            
            console.log('✅ Plugin built successfully!');
            console.log('📁 Output directory:', this.distDir);
            
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    async cleanDist() {
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true, force: true });
            console.log('🧹 Cleaned dist directory');
        }
    }

    async createDist() {
        fs.mkdirSync(this.distDir, { recursive: true });
        console.log('📁 Created dist directory');
    }

    async copyRequiredFiles() {
        for (const file of this.requiredFiles) {
            const srcPath = path.join(this.pluginDir, file);
            const destPath = path.join(this.distDir, file);
            
            if (fs.existsSync(srcPath)) {
                fs.copyFileSync(srcPath, destPath);
                console.log(`📄 Copied: ${file}`);
            } else {
                throw new Error(`Required file missing: ${file}`);
            }
        }
    }

    async validatePlugin() {
        const manifestPath = path.join(this.distDir, 'manifest.json');
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        
        // Validate manifest structure
        const requiredFields = ['name', 'version', 'description', 'main'];
        for (const field of requiredFields) {
            if (!manifest[field]) {
                throw new Error(`Manifest missing required field: ${field}`);
            }
        }
        
        // Validate main file exists
        const mainPath = path.join(this.distDir, manifest.main);
        if (!fs.existsSync(mainPath)) {
            throw new Error(`Main file not found: ${manifest.main}`);
        }
        
        console.log('✅ Plugin validation passed');
    }

    async createPackageInfo() {
        const packageInfo = {
            name: 'Eagle Subtitle Plugin',
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            files: [],
            size: 0
        };
        
        // Calculate total size and list files
        const files = fs.readdirSync(this.distDir);
        for (const file of files) {
            const filePath = path.join(this.distDir, file);
            const stats = fs.statSync(filePath);
            packageInfo.files.push({
                name: file,
                size: stats.size
            });
            packageInfo.size += stats.size;
        }
        
        // Save package info
        const packageInfoPath = path.join(this.distDir, 'package-info.json');
        fs.writeFileSync(packageInfoPath, JSON.stringify(packageInfo, null, 2));
        
        console.log('📊 Package size:', (packageInfo.size / 1024).toFixed(2) + ' KB');
        console.log('📋 Package info created');
    }
}

// Run build
const builder = new PluginBuilder();
builder.build();