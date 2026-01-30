import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-sans text-text-primary">
      <Header />
      {/* Espaciado superior para compensar el header fijo */}
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};
export default MainLayout;