import { SITE_VARIANT, SiteSettings } from '@/lib/consts/settings'
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/private/',
        },
        host: SiteSettings[SITE_VARIANT].url,
        sitemap: SiteSettings[SITE_VARIANT].url + '/sitemap.xml',
    }
}