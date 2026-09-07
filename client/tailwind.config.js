export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E1A',
        card: '#10141F',
        border: '#1E2433',
        muted: '#8A93AB',
        accent: '#6366F1',
        accent2: '#3B82F6',
        danger: '#EF4444',
        warning: '#F59E0B',
        info: '#22D3EE',
        success: '#22C55E',
        critical: '#FF3B30'
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-red': 'glowRed 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite'
      },
      keyframes: {
        glowRed: {
          '0%': { boxShadow: '0 0 5px #EF4444' },
          '100%': { boxShadow: '0 0 20px #EF4444, 0 0 40px #EF444433' }
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        }
      }
    }
  },
  plugins: []
}
