/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mason: {
                    green: '#006633',
                    gold: '#FFCC33',
                    dark: '#1a1a1a',
                }
            }
        },
    },
    plugins: [],
}
