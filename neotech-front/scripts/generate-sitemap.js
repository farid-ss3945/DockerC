/**
 * Sitemap Generator Script
 * 
 * This script generates a sitemap.xml file for the Smart Team Electronics website.
 * Run this script periodically or as part of your build process to keep the sitemap updated.
 * 
 * Usage: node scripts/generate-sitemap.js
 * 
 * Note: For a production app, you may want to fetch actual product/category URLs
 * from your API and generate dynamic sitemaps.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://smartteam.az'; // Update with your actual domain
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Static pages that should always be in the sitemap
const staticPages = [
  {
    url: '',
    changefreq: 'daily',
    priority: '1.0',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/contact',
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/brands',
    changefreq: 'weekly',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/products',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/products/hot-deals',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/products/recommended',
    changefreq: 'daily',
    priority: '0.9',
    lastmod: new Date().toISOString().split('T')[0]
  },
];

// Generate XML sitemap
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // Add static pages
  staticPages.forEach(page => {
    xml += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Note: In a production environment, you would fetch products and categories
  // from your API and add them dynamically here. For example:
  /*
  // Example: Add product pages
  products.forEach(product => {
    xml += `  <url>
    <loc>${BASE_URL}/details/${product.id}</loc>
    <lastmod>${product.updatedAt || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Example: Add category pages
  categories.forEach(category => {
    xml += `  <url>
    <loc>${BASE_URL}/products/${category.slug}</loc>
    <lastmod>${category.updatedAt || today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });
  */

  xml += `</urlset>`;

  return xml;
}

// Write sitemap to file
try {
  const sitemap = generateSitemap();
  fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
  console.log(`✅ Sitemap generated successfully at ${OUTPUT_PATH}`);
  console.log(`📄 Total URLs: ${staticPages.length}`);
  console.log(`\n💡 Tip: For production, fetch products and categories from your API to generate a complete sitemap.`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}

