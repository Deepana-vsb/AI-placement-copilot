# 🚀 AI Placement Copilot

An intelligent, AI-powered career preparation platform built for engineering students to ace placements — featuring mock interviews, resume review, aptitude practice, coding labs, and more.

---

## ✨ Features

| Module | Description |
|---|---|
| 🤖 **Mock Interview** | AI-driven technical & HR mock interview with real-time feedback |
| 📄 **Resume Review** | ATS-scoring engine with AI feedback on resume content |
| 🧠 **Skill Gap Analysis** | Maps your skills to job requirements and identifies gaps |
| 🎤 **Communication Calibration** | Voice-based speech trainer with scoring & recruiter vocabulary tips |
| 🧮 **Aptitude Prep Lab** | AI-generated quizzes across Arithmetic, DI, Modern Math & more |
| 💻 **Coding Practice** | Live in-browser coding sandbox with multi-language support |
| ☕ **Java Practice** | Java-specific coding exercises with compile & run |
| 🗄️ **SQL Practice** | SQL query sandbox with real-time evaluation |
| 📅 **Smart Planner** | Drag-and-drop daily/weekly study planner with task management |
| 🏆 **Achievements** | Gamified XP, streaks and badges system |
| 👤 **Student Profile** | Comprehensive profile with academics and performance analytics |

---

## 🎨 Design System

Built with the **Lavender AI** premium color palette:

| Token | Color |
|---|---|
| Background | `#FCFCFF` |
| Navbar | `#312E81` |
| Sidebar | `#4338CA` |
| Cards | `#FFFFFF` |
| Primary | `#7C3AED` |
| Accent | `#06B6D4` |
| Heading | `#1F2937` |
| Body Text | `#6B7280` |
| Borders | `#E5E7EB` |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (Custom design tokens)
- **Google Material Symbols** (Icons)
- **DiceBear Avatars** (Dynamic profile pictures)
- **Web Speech API** (Voice input)

### Backend
- **Spring Boot 3** (Java 17)
- **MongoDB** (Primary DB) + Local JSON fallback (offline mode)
- **Groq API** (LLM — fast AI inference)
- **Piston API** (Code execution sandbox)

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.9+
- MongoDB (optional — app runs in offline mode automatically)

### 1. Clone the Repository
```bash
git clone https://github.com/Deepana-vsb/AI-placement-copilot.git
cd AI-placement-copilot/placement-copilot
```

### 2. Start the Backend
```bash
cd backend
./mvnw spring-boot:run
# Server starts at http://localhost:8080
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# App opens at http://localhost:3000
```

---

## 🔑 Environment Variables

Create a `.env` file inside `backend/src/main/resources/` or set application properties:

```properties
# Groq API Key (for AI features)
GROQ_API_KEY=your_groq_api_key_here

# MongoDB URI (optional — offline mode is automatic)
MONGODB_URI=mongodb://localhost:27017/placementcopilot

# JWT Secret
JWT_SECRET=your_secret_key_here
```

---

## 📁 Project Structure

```
AI-placement-copilot/
├── placement-copilot/
│   ├── frontend/           # Next.js App
│   │   ├── app/            # Pages (dashboard, mock, resume, etc.)
│   │   ├── components/     # Shared components (Sidebar, etc.)
│   │   └── tailwind.config.ts
│   └── backend/            # Spring Boot API
│       └── src/main/java/
│           └── com/placementcopilot/
│               ├── controller/
│               ├── service/
│               ├── model/
│               └── repository/
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

This project is for educational and portfolio purposes.

---

> Built with ❤️ by Deepana
