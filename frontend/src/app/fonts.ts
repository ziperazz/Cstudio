import localFont from 'next/font/local';

export const outfitFont = localFont({
  src: [
    {
      path: '../../public/fonts/Outfit-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Outfit-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Outfit-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Outfit-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Outfit-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Outfit-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Outfit-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-outfit',
  display: 'swap',
});

export const orbitronFont = localFont({
  src: '../../public/fonts/Orbitron.ttf',
  weight: '400 900',
  variable: '--font-orbitron',
  display: 'swap',
});