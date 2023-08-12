
const { genarateYouTubeInsights } = require('./controllers/youTubeInsightsController');

link = 'https://www.youtube.com/watch?v=RI3JCq9-bbM'
//link = 'https://www.youtube.com/watch?v=lKfhVLqadDQ' // Marie Curie in French
//link = 'https://www.youtube.com/watch?v=WrhVdCsZHTE'  // Mahmoud Darwish in Arabic

genarateYouTubeInsights(link, false)
