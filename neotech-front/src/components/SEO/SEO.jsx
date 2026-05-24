import { useEffect, useMemo } from 'react';
import i18n from '../../i18n';

/**
 * SEO Component for managing meta tags, Open Graph, Twitter Cards, and structured data
 * Optimized for Azerbaijan market with hreflang tags and geo-targeting
 * Compatible with React 19 - uses native DOM manipulation instead of react-helmet-async
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.keywords - Meta keywords (comma-separated)
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - Open Graph type (website, article, product, etc.)
 * @param {Object} props.product - Product data for structured data
 * @param {Object} props.organization - Organization data for structured data
 * @param {boolean} props.noindex - Whether to prevent indexing
 */
const SEO = ({
  title = 'NeoTech Electronics - AzÉ™rbaycanda Premium Elektronika MaÄŸazasÄ±',
  description = 'NeoTech Electronics-dÉ™ É™n son elektronika, kompyuter, noutbuk, printer, mÃ¼ÅŸahidÉ™ sistemlÉ™ri vÉ™ daha Ã§oxunu alÄ±n. AzÉ™rbaycanda É™n yaxÅŸÄ± qiymÉ™tlÉ™r, keyfiyyÉ™tli mÉ™hsullar vÉ™ É™la mÃ¼ÅŸtÉ™ri xidmÉ™ti.',
  keywords = 'elektronika, kompyuter, noutbuk, printer, mÃ¼ÅŸahidÉ™, NeoTech, AzÉ™rbaycan, onlayn maÄŸaza, elektronika maÄŸazasÄ±, electronics, computers, laptops, printers, surveillance, Azerbaijan, online store',
  image = '/Icons/logo.svg',
  url,
  type = 'website',
  product = null,
  organization = null,
  noindex = false,
}) => {
  const siteUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://neotech.az'; // Update with your actual domain
  
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  
  // Get current language (default to Azerbaijani for Azerbaijan market)
  const currentLang = i18n.language || 'az';
  const htmlLang = currentLang === 'az' ? 'az' : 'en';
  
  // Default organization data with LocalBusiness schema for Azerbaijan
  const defaultOrganization = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    name: 'NeoTech Electronics',
    url: siteUrl,
    logo: `${siteUrl}/Icons/logo.svg`,
    description: 'AzÉ™rbaycanda premium elektronika maÄŸazasÄ±',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Qurban Abbasov 35',
      addressLocality: 'Baku',
      addressRegion: 'Baku',
      addressCountry: 'AZ',
      postalCode: '' // Add postal code if available
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.4093, // Approximate Baku coordinates - update with exact location if needed
      longitude: 49.8671  // Approximate Baku coordinates - update with exact location if needed
    },
    areaServed: {
      '@type': 'Country',
      name: 'Azerbaijan'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+994702971707',
      email: 'info@neotech.az',
      availableLanguage: ['az', 'en'],
      areaServed: 'AZ'
    },
    sameAs: [
      'https://www.facebook.com/neotech',
      'https://www.instagram.com/neotech.az',
      'https://www.tiktok.com/@neotech.az'
    ]
  }), [siteUrl]);

  // Product structured data
  const productStructuredData = useMemo(() => product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription,
    image: product.images && Array.isArray(product.images) && product.images.length > 0
      ? product.images.map(img => typeof img === 'string' ? `${siteUrl}${img}` : `${siteUrl}${img.imageUrl || img}`)
      : product.imageUrl ? [`${siteUrl}${product.imageUrl}`] : [fullImageUrl],
    sku: product.sku,
    brand: product.brandName ? {
      '@type': 'Brand',
      name: product.brandName
    } : undefined,
    category: product.categoryName,
    offers: {
      '@type': 'Offer',
      url: fullUrl,
      priceCurrency: 'AZN',
      price: product.prices && product.prices.length > 0 
        ? product.prices[0].discountedPrice || product.prices[0].price
        : product.currentPrice || product.price,
      availability: product.stockQuantity > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 0
    } : undefined,
  } : null, [product, siteUrl, fullUrl, fullImageUrl]);

  // Breadcrumb structured data
  const breadcrumbStructuredData = useMemo(() => product && product.categoryName ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl
      },
      ...(product.parentCategoryName ? [{
        '@type': 'ListItem',
        position: 2,
        name: product.parentCategoryName,
        item: `${siteUrl}/categories/${product.parentCategorySlug?.toLowerCase().replace(/\s+/g, '-')}`
      }] : []),
      ...(product.categoryName ? [{
        '@type': 'ListItem',
        position: product.parentCategoryName ? 3 : 2,
        name: product.categoryName,
        item: `${siteUrl}/products/${product.categorySlug?.toLowerCase().replace(/\s+/g, '-')}`
      }] : []),
      {
        '@type': 'ListItem',
        position: (product.parentCategoryName ? 4 : product.categoryName ? 3 : 2),
        name: product.name,
        item: fullUrl
      }
    ]
  } : null, [product, siteUrl, fullUrl]);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const head = document.head;
    const elements = [];

    // Helper function to create or update meta tag
    const setMetaTag = (attribute, value, content) => {
      let element = head.querySelector(`meta[${attribute}="${value}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, value);
        head.appendChild(element);
        elements.push(element);
      }
      element.setAttribute('content', content);
    };

    // Helper function to create or update link tag
    const setLinkTag = (rel, href) => {
      let element = head.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        head.appendChild(element);
        elements.push(element);
      }
      element.setAttribute('href', href);
    };

    // Helper function to create or update script tag for structured data
    const setStructuredData = (id, data) => {
      // Remove existing script with same id
      const existing = head.querySelector(`script[data-seo-id="${id}"]`);
      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-seo-id', id);
      script.textContent = JSON.stringify(data);
      head.appendChild(script);
      elements.push(script);
    };

    // Set HTML lang attribute for better SEO
    document.documentElement.setAttribute('lang', htmlLang);

    // Set title
    document.title = title;

    // Basic Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'author', 'NeoTech Electronics');
    setMetaTag('name', 'robots', noindex 
      ? 'noindex, nofollow' 
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );
    setMetaTag('httpEquiv', 'Content-Language', currentLang === 'az' ? 'az' : 'en');
    
    // Geo-targeting for Azerbaijan
    setMetaTag('name', 'geo.region', 'AZ');
    setMetaTag('name', 'geo.placename', 'Baku, Azerbaijan');
    setMetaTag('name', 'geo.position', '40.4093;49.8671'); // Baku coordinates
    setMetaTag('name', 'ICBM', '40.4093, 49.8671'); // Baku coordinates

    // Canonical URL
    setLinkTag('canonical', fullUrl);
    
    // Hreflang tags for Azerbaijani and English versions
    // This tells search engines about language alternatives
    const basePath = fullUrl.replace(siteUrl, '').split('?')[0]; // Remove existing query params
    const setHreflang = (lang, href) => {
      let element = head.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'alternate');
        element.setAttribute('hreflang', lang);
        head.appendChild(element);
        elements.push(element);
      }
      element.setAttribute('href', href);
    };
    
    // Set hreflang tags for both language versions
    setHreflang('az', `${siteUrl}${basePath}?lang=az`);
    setHreflang('en', `${siteUrl}${basePath}?lang=en`);
    setHreflang('x-default', `${siteUrl}${basePath}?lang=az`); // Default to Azerbaijani

    // Open Graph Tags
    setMetaTag('property', 'og:type', type);
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', fullImageUrl);
    setMetaTag('property', 'og:url', fullUrl);
    setMetaTag('property', 'og:site_name', 'NeoTech Electronics');
    setMetaTag('property', 'og:locale', currentLang === 'az' ? 'az_AZ' : 'en_US');
    setMetaTag('property', 'og:locale:alternate', currentLang === 'az' ? 'en_US' : 'az_AZ');
    
    // Additional Open Graph tags for Azerbaijan
    setMetaTag('property', 'og:country-name', 'Azerbaijan');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullImageUrl);

    // Structured Data - Organization
    const orgData = organization || defaultOrganization;
    setStructuredData('organization', orgData);

    // Structured Data - Product
    if (productStructuredData) {
      setStructuredData('product', productStructuredData);
    }

    // Structured Data - Breadcrumb
    if (breadcrumbStructuredData) {
      setStructuredData('breadcrumb', breadcrumbStructuredData);
    }

    // Cleanup function
    return () => {
      // Remove structured data scripts on unmount
      const scripts = head.querySelectorAll('script[data-seo-id]');
      scripts.forEach(script => script.remove());
    };
  }, [title, description, keywords, fullUrl, fullImageUrl, type, noindex, product, organization, productStructuredData, breadcrumbStructuredData, defaultOrganization, siteUrl, currentLang, htmlLang]);

  // This component doesn't render anything
  return null;
};

export default SEO;

