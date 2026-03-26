const campaigns = [
  {
    campaign_id: "PK001",
    creator_id: "user123",
    title: "Help Build Clean Water Wells",
    short_description: "Providing clean water access to rural communities",
    long_description: "Our mission is to bring clean, safe drinking water to remote villages that lack basic water infrastructure. Each well can serve up to 500 people and dramatically improve health outcomes.",
    category: "charity", // charity, personal, medical, education, emergency
    goal_amount: 50000,
    raised_amount: 23500,
    image: "https://images.unsplash.com/photo-1541840031508-326b77c9a17e?w=400",
    start_date: "2025-01-15",
    end_date: "2025-06-15"
  },
  {
    campaign_id: "PK002", 
    creator_id: "user456",
    title: "Emergency Medical Treatment",
    short_description: "Urgent surgery needed for 8-year-old child",
    long_description: "Little Ahmad needs immediate heart surgery that his family cannot afford. The operation costs $15,000 and must be done within the next month to save his life.",
    category: "medical",
    goal_amount: 15000,
    raised_amount: 8750,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
    start_date: "2025-02-01",
    end_date: "2025-04-01"
  },
  {
    campaign_id: "PK003",
    creator_id: "user789",
    title: "Scholarship Fund for Underprivileged Students", 
    short_description: "Supporting higher education for deserving students",
    long_description: "This scholarship fund aims to provide financial assistance to bright students from low-income families who dream of pursuing higher education but lack the resources.",
    category: "education",
    goal_amount: 100000,
    raised_amount: 45200,
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400",
    start_date: "2025-01-01", 
    end_date: "2025-12-31"
  },
  {
    campaign_id: "PK004",
    creator_id: "user321",
    title: "Flood Relief Fund",
    short_description: "Emergency aid for flood-affected families",
    long_description: "Recent floods have displaced hundreds of families. This fund will provide immediate relief including food, shelter, and basic necessities to those who have lost everything.",
    category: "emergency",
    goal_amount: 75000,
    raised_amount: 75000,
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400",
    start_date: "2025-03-10",
    end_date: "2025-05-10"
  },
  {
    campaign_id: "PK005",
    creator_id: "user654",
    title: "Start My Small Business",
    short_description: "Launching a local handicrafts business",
    long_description: "I want to start a small business selling traditional handicrafts to support my family and preserve local artisan skills. The funds will go towards materials, equipment, and initial inventory.",
    category: "personal", 
    goal_amount: 20000,
    raised_amount: 5500,
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400",
    start_date: "2025-02-15",
    end_date: "2025-08-15"
  }
];
export default campaigns