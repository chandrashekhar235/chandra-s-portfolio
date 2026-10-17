import { MetadataRoute } from 'next'
import { PERSONAL_INFO } from '@/lib/content'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PERSONAL_INFO.name} — Portfolio`,
    short_name: 'Chandra Shekhar',
    description: 'Personal portfolio of Chandra Shekhar. Full Stack Developer and UI/UX Designer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF9F5',
    theme_color: '#141413',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
