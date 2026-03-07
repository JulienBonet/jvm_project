import useIsMobile from '../../hooks/useIsMobile';
import HomeMobile from './HomeMobile';
import HomeDesktop from './HomeDesktop';

export default function Home() {
  const isMobile = useIsMobile();

  return isMobile ? <HomeMobile /> : <HomeDesktop />;
}
