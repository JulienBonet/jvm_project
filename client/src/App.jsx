import { Outlet } from 'react-router-dom';
import { FormatProvider } from './context/FormatContext.tsx';
import Header from './components/Header/Header.tsx';
import Footer from './components/Footer/Footer';

function App() {
  return (
    <FormatProvider>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh', // prend toute la hauteur de l'écran
        }}
      >
        <Header />

        <main
          style={{
            flex: 1, // pousse le footer en bas si le contenu est court
          }}
        >
          <Outlet />
        </main>

        <Footer />
      </div>
    </FormatProvider>
  );
}

export default App;
