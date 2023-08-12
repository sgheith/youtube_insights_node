
const { genarateYouTubeInsights } = require('./controllers/youTubeInsightsController');

//link = 'https://www.youtube.com/watch?v=RI3JCq9-bbM'
//link = 'https://www.youtube.com/watch?v=lKfhVLqadDQ' // Marie Curie in French
//link = 'https://www.youtube.com/watch?v=WrhVdCsZHTE'  // Mahmoud Darwish in Arabic
link = 'https://www.youtube.com/watch?v=ePsLTBvpnD8' // Three-Layer Architecture Pattern

genarateYouTubeInsights(link, false).then(insights => console.log(insights))

