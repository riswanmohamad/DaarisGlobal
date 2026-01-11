/**
 * Daaris Global - Build Script
 * Minifies HTML, CSS, and JavaScript for GitHub Pages deployment
 */

const fs = require('fs');
const path = require('path');
const CleanCSS = require('clean-css');
const Terser = require('terser');
const htmlMinifier = require('html-minifier-terser');

const config = {
    srcDir: __dirname,
    distDir: path.join(__dirname, 'dist')
};

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

async function build() {
    console.log('\n🚀 Building for GitHub Pages...\n');
    
    try {
        // Clean and create dist directory
        if (fs.existsSync(config.distDir)) {
            fs.rmSync(config.distDir, { recursive: true });
        }
        ensureDir(config.distDir);
        ensureDir(path.join(config.distDir, 'css'));
        ensureDir(path.join(config.distDir, 'js'));

        // Minify CSS
        console.log('📦 Minifying CSS...');
        const css = fs.readFileSync(path.join(config.srcDir, 'css', 'styles.css'), 'utf8');
        const minifiedCss = new CleanCSS({ level: 2 }).minify(css);
        fs.writeFileSync(path.join(config.distDir, 'css', 'styles.min.css'), minifiedCss.styles);
        console.log('   ✓ styles.css → styles.min.css');

        // Minify JS files
        console.log('\n📦 Minifying JavaScript...');
        
        const configJs = fs.readFileSync(path.join(config.srcDir, 'js', 'config.js'), 'utf8');
        const minifiedConfig = await Terser.minify(configJs, {
            compress: { drop_console: false },
            mangle: true
        });
        fs.writeFileSync(path.join(config.distDir, 'js', 'config.min.js'), minifiedConfig.code);
        console.log('   ✓ config.js → config.min.js');

        const appJs = fs.readFileSync(path.join(config.srcDir, 'js', 'app.js'), 'utf8');
        const minifiedApp = await Terser.minify(appJs, {
            compress: { drop_console: false },
            mangle: true
        });
        fs.writeFileSync(path.join(config.distDir, 'js', 'app.min.js'), minifiedApp.code);
        console.log('   ✓ app.js → app.min.js');

        // Minify HTML and update paths
        console.log('\n📦 Minifying HTML...');
        let html = fs.readFileSync(path.join(config.srcDir, 'index.html'), 'utf8');
        
        // Update paths to minified files
        html = html
            .replace('css/styles.css', 'css/styles.min.css')
            .replace('js/config.js', 'js/config.min.js')
            .replace('js/app.js', 'js/app.min.js');
        
        const minifiedHtml = await htmlMinifier.minify(html, {
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        });
        fs.writeFileSync(path.join(config.distDir, 'index.html'), minifiedHtml);
        console.log('   ✓ index.html → index.html');

        console.log('\n✅ Build completed successfully!');
        console.log(`📁 Output directory: ${config.distDir}\n`);
        
    } catch (error) {
        console.error('\n❌ Build failed!');
        console.error(error);
        process.exit(1);
    }
}

build();
