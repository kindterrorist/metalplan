# MetalPlans

Comprehensive athlete fitness and nutrition planning application built with React, TypeScript, and Electron. Designed for fitness trainers and athletes to manage workout plans, nutrition programs, and track progress with integrated AI features.

## Features

### 🏋️ Athlete Management
- Create and manage athlete profiles with personal information
- Track measurements, weight, body composition, and photos
- Monitor personal records and fitness goals
- Record mood and energy levels

### 💪 Workout Planning
- Design custom workout plans with detailed exercises
- Support for multiple exercise types (Machine, Dumbbell, Barbell, Bodyweight, Cable)
- Organize exercises by muscle groups (Chest, Back, Shoulders, Arms, Legs, Core, Cardio)
- Flexible day scheduling with rest day options
- Detailed exercise sets, reps, rest periods, and notes

### 🥗 Nutrition Planning
- Create personalized nutrition plans with meal scheduling
- Comprehensive food library with nutritional information
- Track calories, proteins, carbs, and fats
- Plan meals by time of day (Breakfast, Pre-workout, etc.)

### 🤖 AI Integration
- Gemini-powered AI suggestions for workout plans
- Exercise recommendations based on target muscle groups
- Smart plan generation based on athlete profiles and goals

### 📊 Progress Tracking
- Visualize progress with charts and graphs
- Track measurements over time
- Photo progress comparison (front, side, back views)
- Workout and nutrition adherence monitoring

### 🎨 Customization & Export
- Export workout plans, nutrition plans, and progress reports
- Multiple export formats (HTML, PNG)
- Customizable themes and color schemes
- Professional report templates with trainer branding

### 💾 Data Management
- Local SQLite database storage
- Automatic backup and restore functionality
- Data synchronization across sessions
- Secure data management with encryption

### 🌐 Multi-platform Support
- Cross-platform desktop application (Windows, macOS, Linux)
- Responsive UI optimized for both desktop and mobile
- RTL (right-to-left) support for Persian language
- Dark/light mode with customizable themes

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS with custom Persian typography (Vazirmatn font)
- **Desktop**: Electron for cross-platform desktop deployment
- **Database**: Better-SQLite3 for local data persistence
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK
- **Build Tool**: Vite
- **Utilities**: html2canvas for export functionality

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kindterrorist/metalplan.git
cd metalplan
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Gemini API key:
Create a `.env.local` file in the root directory and add your API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Run the application in development mode:
```bash
npm run dev
```

5. For desktop application:
```bash
npm run dev:electron
```

## Building

To create a production build:
```bash
npm run build
```

To build the desktop application:
```bash
npm run build:electron
```

## Usage

### Getting Started
1. Launch the application
2. Configure your trainer profile in Settings
3. Add athletes to manage
4. Create workout and nutrition plans
5. Track progress over time

### Creating Athlete Profiles
- Navigate to the Athletes section
- Click "Add Athlete" to create a new profile
- Fill in personal information (name, age, height, gender)
- Add initial measurements and photos
- Set fitness goals and current status

### Designing Workout Plans
- Select an athlete and navigate to their detail page
- Click "Create Plan" to start designing
- Add exercises organized by muscle groups
- Define sets, reps, rest periods, and notes for each exercise
- Schedule workout days throughout the week

### Building Nutrition Plans
- Access the nutrition builder from an athlete's profile
- Create meals with specific timing
- Add food items from the food library or create custom entries
- Set daily nutritional targets (calories, proteins, carbs, fats)

### Tracking Progress
- Log measurements regularly for each athlete
- Upload progress photos from multiple angles
- Record workout completions and nutrition adherence
- Monitor trends with visual charts

### AI Assistance
- Use the AI tools in the Tools section
- Get exercise recommendations for specific muscle groups
- Generate workout plan suggestions based on athlete profiles
- Customize AI behavior with your own prompts

## Application Architecture

The application follows a modular architecture with:

- **React Context API** for state management
- **Electron** for desktop functionality
- **SQLite** for persistent local storage
- **TypeScript interfaces** for data consistency
- **Component-based UI** with reusable elements
- **MVC-like separation** of concerns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**MetalPlans** - Empowering fitness professionals with intelligent tools for athlete management and performance optimization.