import { motion } from 'framer-motion';

const features = [
  'Premium video lessons',
  'Community chat access',
  'Admin-approved student access',
  'Mobile-first learning experience'
];

export default function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid w-full gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="card"
        >
          <p className="mb-3 inline-block rounded-full border border-violet-300/40 bg-violet-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-violet-200">
            PREMIUM COURSE PLATFORM
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            Learn faster with a luxury dark learning hub.
          </h1>
          <p className="mt-4 text-slate-300">
            Built with React + Vite + Tailwind, optimized for Vercel deployment, and ready for rapid feature expansion.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">View Courses</button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="card"
        >
          <h2 className="text-xl font-semibold text-cyan-300">Platform Highlights</h2>
          <ul className="mt-4 space-y-3">
            {features.map((feature) => (
              <li key={feature} className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm sm:text-base">
                {feature}
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-cyan-300/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            Responsive on mobile and desktop with premium blue/purple gradients and smooth animations.
          </div>
        </motion.div>
      </section>
    </main>
  );
}
