import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';

const Layout = ({ children, title = 'Simple MP3 Player' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Simple mobile-friendly MP3 player" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" />
        <style jsx global>{`
          .safe-area-top {
            padding-top: env(safe-area-inset-top);
          }
          .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
          .safe-area-height-top {
            height: env(safe-area-inset-top);
          }
          .safe-area-height-bottom {
            height: env(safe-area-inset-bottom);
          }
        `}</style>
      </Head>

      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        role="main"
      >
        {/* Status bar spacer for mobile */}
        <div className="safe-area-height-top bg-transparent" />
        
        {/* Header */}
        <motion.header 
          className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 safe-area-top"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          role="banner"
        >
          <div className="max-w-md mx-auto px-4 py-3 sm:px-6">
            <h1 className="text-xl font-semibold text-white text-center sm:text-2xl">
              🎵 MP3 Player
            </h1>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 safe-area-bottom" role="main">
          <div className="max-w-md mx-auto px-4 py-6 sm:px-6 sm:py-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {children}
            </motion.div>
          </div>
        </main>

        {/* Bottom safe area for mobile */}
        <div className="safe-area-height-bottom bg-transparent" />
      </motion.div>
    </>
  );
};

export default Layout;