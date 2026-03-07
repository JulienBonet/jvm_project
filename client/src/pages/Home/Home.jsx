import useIsMobile from '../../hooks/useIsMobile.ts';
import HomeMobile from './HomeMobile.tsx';
import HomeDesktop from './HomeDesktop.tsx';

export default function Home() {
  const isMobile = useIsMobile();

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}
