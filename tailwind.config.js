/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        cream: '#F5F0E8',
        parchment: '#EDE8DC',
        ink: '#1A1209',
        sage: '#7A8C6E',
        copper: '#B5703A',
        rust: '#C4542A',
        mist: '#C8D4C0',
        charcoal: '#2D2D2D',
      },
    },
  },
  plugins: [],
}
