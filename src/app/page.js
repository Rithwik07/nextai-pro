// src/app/page.js
"use client"; // This is necessary for client-side interactions like Framer Motion

import { motion } from 'framer-motion';
import Link from 'next/link'; // For navigation links
import { useEffect } from 'react'; // To handle potential Bootstrap JS needs, if any (though not strictly needed for basic CSS)

export default function LandingPage() {
  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const featureCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
    hover: { scale: 1.03, transition: { type: "spring", stiffness: 300 } }
  };

  // Optional: If you need Bootstrap's JS components (e.g., dropdowns, carousels)
  // ensure Bootstrap's JS is loaded. For this basic landing page, it's not strictly
  // necessary, but good practice to keep in mind if you expand.
  useEffect(() => {
    // You might load Bootstrap's JS here if you were using components that depend on it
    // e.g., import 'bootstrap/dist/js/bootstrap.bundle.min.js';
    // For this design, pure CSS Bootstrap classes are sufficient.
  }, []);

  return (
    <div className="bg-dark text-white min-vh-100 d-flex flex-column" style={{ fontFamily: 'sans-serif' }}>
      {/* Navbar */}
      <motion.nav
        className="navbar navbar-expand-lg navbar-dark bg-dark py-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <div className="container">
          <Link href="/" className="navbar-brand fs-4 fw-bold text-info">
            NextAI Pro
          </Link>
          <div className="ms-auto">
            <Link href="/chat" className="btn btn-outline-info rounded-pill px-4 py-2">
              Launch App
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="position-relative d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center px-3 py-5 overflow-hidden" style={{ minHeight: 'calc(100vh - 76px)' /* Adjust based on navbar height */ }}>
        {/* Background Gradient Effect - using custom CSS for similar look */}
        <div className="position-absolute w-100 h-100 top-0 start-0 z-0 opacity-25" style={{
            background: 'radial-gradient(circle at 25% 25%, rgba(102, 0, 204, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(0, 102, 204, 0.3) 0%, transparent 50%)',
            animation: 'gradient-animate 15s ease infinite'
          }}></div>
        {/* Custom CSS for gradient animation - ensure this goes into globals.css or a style tag */}
        <style jsx global>{`
          @keyframes gradient-animate {
            0% { background-position: 0% 0%, 100% 100%; }
            50% { background-position: 100% 0%, 0% 100%; }
            100% { background-position: 0% 0%, 100% 100%; }
          }
        `}</style>


        <motion.div
          className="position-relative z-10 mx-auto"
          style={{ maxWidth: '960px' }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            className="display-3 fw-bolder lh-sm mb-4 text-white"
            variants={itemVariants}
            style={{
              background: 'linear-gradient(90deg, #663399, #00BFFF)', /* Purple to Sky Blue */
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 'min(5rem, 12vw)' // Responsive font size
            }}
          >
            Your AI Assistant. <br /> Unlocked by Voice.
          </motion.h1>
          <motion.p
            className="lead text-white-50 mb-5 mx-auto"
            variants={itemVariants}
            style={{ maxWidth: '700px', fontSize: 'min(1.5rem, 4.5vw)' }} // Responsive font size
          >
            Engage in natural conversations, automate tasks, and get instant answers with seamless voice commands. Experience the future of interaction.
          </motion.p>
          <motion.div variants={itemVariants}>
            <Link
              href="/chat"
              className="btn btn-info btn-lg rounded-pill px-5 py-3 shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #663399, #00BFFF)', // Purple to Sky Blue
                border: 'none',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.25rem'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              Get Started Free
              <svg className="ms-2" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container py-5">
        <motion.h2
          className="display-4 fw-bold text-center mb-5 text-white"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'linear-gradient(90deg, #663399, #00BFFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Powerful Features at Your Command
        </motion.h2>

        <motion.div
          className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Feature Card 1 */}
          <div className="col">
            <motion.div
              className="card h-100 bg-dark text-white border-secondary shadow-lg rounded-3 p-4"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="card-body text-center">
                <div className="mb-4 text-info">
                  <svg className="bi" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                </div>
                <h3 className="card-title fs-3 fw-semibold mb-3">Real-time Voice Chat</h3>
                <p className="card-text text-white-50">Engage in dynamic conversations with the AI using your voice, and hear instant, natural responses.</p>
              </div>
            </motion.div>
          </div>

          {/* Feature Card 2 */}
          <div className="col">
            <motion.div
              className="card h-100 bg-dark text-white border-secondary shadow-lg rounded-3 p-4"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="card-body text-center">
                <div className="mb-4 text-info">
                  <svg className="bi" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <h3 className="card-title fs-3 fw-semibold mb-3">Intelligent Task Automation</h3>
                <p className="card-text text-white-50">Command the AI to perform silent actions like copying text or opening URLs, streamlining your workflow.</p>
              </div>
            </motion.div>
          </div>

          {/* Feature Card 3 */}
          <div className="col">
            <motion.div
              className="card h-100 bg-dark text-white border-secondary shadow-lg rounded-3 p-4"
              variants={featureCardVariants}
              whileHover="hover"
            >
              <div className="card-body text-center">
                <div className="mb-4 text-info">
                  <svg className="bi" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h3 className="card-title fs-3 fw-semibold mb-3">Customizable Experience</h3>
                <p className="card-text text-white-50">Control AI voice output with mute options, and look forward to advanced voice selection with cloud APIs.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-dark py-5 text-center">
        <motion.div
          className="container py-5"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="display-4 fw-bold text-white mb-4">Ready to Experience NextAI Pro?</h2>
          <p className="lead text-white-50 mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            Join the revolution of voice-controlled AI. Get started in seconds.
          </p>
          <Link
            href="/chat"
            className="btn btn-primary btn-lg rounded-pill px-5 py-3 shadow-lg"
            style={{
              background: 'linear-gradient(90deg, #663399, #00BFFF)', // Purple to Sky Blue
              border: 'none',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Launch Your AI Assistant
            <svg className="ms-3" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-4 text-center text-secondary small">
        <div className="container">
          <p className="mb-1">&copy; {new Date().getFullYear()} NextAI Pro. All rights reserved.</p>
          <p className="mb-0">Built with Next.js, Bootstrap, and Framer Motion.</p>
        </div>
      </footer>
    </div>
  );
}