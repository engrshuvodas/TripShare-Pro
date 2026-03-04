# ✈️ TripSplit Pro

**Expense Splitting for Travel Groups**

TripSplit Pro is a sophisticated, responsive, and offline-first web application designed to handle complex group expense splitting during trips. Built with modern UI/UX principles, it features a glassmorphism design system and works entirely on the client-side using `LocalStorage`.

![TripSplit Pro Mockup](https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1000)

## ✨ Features

- **Trip Management**: Create trips with specific locations, start dates, and end dates.
- **Member Management**: Add travel buddies with their names, WhatsApp numbers, and even profile photos (Base64 storage).
- **Smart Splitting**: Add expenses and choose exactly who shared the cost. The app automatically calculates the debt/balance for each member.
- **Dynamic Dashboard**: View total trip costs, per-member breakdowns, and expense history grouped by date.
- **WhatsApp Integration**: Generate and send personalized expense summaries to members with a single click.
- **Customizable Settings**: Support for multiple currencies (INR, USD, EUR), dark/light/system themes, and timezone preferences.
- **Privacy Focused**: No backend, no trackers. All data stays in your browser's local storage.

## 🛠️ Tech Stack

- **Structure**: Semantic HTML5
- **Styling**: Modern CSS3 (Flexbox, Grid, Glassmorphism, Responsive Design)
- **Logic**: Vanilla JavaScript (ES6+)
- **Storage**: Browser LocalStorage API
- **Fonts**: Google Fonts (Inter & Outfit)

## 🚀 How to Deploy on Vercel

Since TripSplit Pro is a static web application, it's perfect for Vercel's static hosting.

1.  **Push to GitHub**: Upload these files (`index.html`, `style.css`, `script.js`) to a new GitHub repository.
2.  **Import to Vercel**:
    - Log in to [Vercel](https://vercel.com).
    - Click **"Add New"** > **"Project"**.
    - Import your GitHub repository.
3.  **Deployment Settings**:
    - Vercel will automatically detect it as a static project.
    - No build command or install command is needed.
    - Click **"Deploy"**.
4.  **Done!**: Your app will be live on a `.vercel.app` domain.

## 📂 Folder Structure

```text
TripSplit-Pro/
├── index.html    # Main application structure
├── style.css     # Glassmorphism design system & styles
├── script.js     # State management & app logic
└── README.md     # Project documentation
```

## 🗺️ Roadmap

- [ ] Export trip data as CSV/PDF.
- [ ] Multiple trip support (switching between saved trips).
- [ ] Add categories to expenses (Food, Transport, etc.) with custom icons.
- [ ] Multi-language support.

## 📄 License

MIT License - Copyright (c) 2024 TripSplit Pro