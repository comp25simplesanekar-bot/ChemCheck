module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "rgb(244, 250, 246)",
          100: "rgb(226, 243, 232)",
          200: "rgb(196, 230, 208)",
          300: "rgb(150, 208, 172)",
          500: "rgb(58, 160, 104)",
          600: "rgb(40, 134, 84)",
          700: "rgb(32, 107, 69)",
          900: "rgb(18, 58, 40)",
        },
        ink: {
          DEFAULT: "rgb(28, 40, 34)",
          soft: "rgb(88, 102, 94)",
        },
        okbg: "rgb(227, 246, 234)",
        okfg: "rgb(24, 110, 62)",
        okdot: "rgb(46, 165, 94)",
        warnbg: "rgb(255, 244, 206)",
        warnfg: "rgb(133, 90, 0)",
        warndot: "rgb(232, 168, 0)",
        badbg: "rgb(253, 231, 228)",
        badfg: "rgb(160, 34, 34)",
        baddot: "rgb(214, 62, 56)",
        nabg: "rgb(236, 239, 238)",
        nafg: "rgb(78, 90, 84)",
        nadot: "rgb(140, 152, 146)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(32, 107, 69, 0.08)",
        lift: "0 16px 40px rgba(32, 107, 69, 0.14)",
      },
      fontFamily: {
        display: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "serif"],
        body: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
