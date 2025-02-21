// Start of my own code

const apiKey = "7e61b90dea3e436aa49eb65730b91669"; // API key for accessing the NewsAPI service

// Function to fetch news articles from the NewsAPI
async function fetchNews(category = "all") {
    try {
        // Build the URL to fetch articles from TechCrunch using the NewsAPI
        const url = `https://newsapi.org/v2/everything?domains=techcrunch.com&apiKey=${apiKey}`;
        const response = await fetch(url); // Fetch the data from the API
        if (!response.ok) throw new Error("Network response was not ok"); // Check if the request failed
        const data = await response.json(); // Parse the JSON response
        const rssContainer = document.getElementById("rss-entries"); // Container for displaying RSS entries
        rssContainer.innerHTML = ""; // Clear any existing content in the container

        // Get the current page (e.g., index.html, ai.html, etc.)
        const currentPage = window.location.pathname.split("/").pop();

        // Carousel setup only for the homepage (index.html)
        if (currentPage === "index.html") {
            // Filter articles that have both an image and a description, and limit to 10 articles
            const carouselArticles = data.articles.filter(article => 
                article.urlToImage && article.description
            ).slice(0, 10);
            const carouselInner = document.querySelector(".carousel-inner"); // Carousel content container
            const carouselIndicators = document.querySelector(".carousel-indicators"); // Carousel indicators container
            if (carouselArticles.length > 0) {
                carouselInner.innerHTML = ""; // Clear existing carousel items
                carouselIndicators.innerHTML = ""; // Clear existing indicators
                // Loop through the filtered articles to create carousel items and indicators
                carouselArticles.forEach((article, index) => {
                    // Create a carousel item for each article
                    const carouselItem = document.createElement("div");
                    carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`; // Mark the first item as active
                    carouselItem.innerHTML = `
                        <img src="${article.urlToImage}" class="d-block w-100" alt="${article.title}">
                        <div class="carousel-caption">
                            <h3>${article.title}</h3>
                            <p>${article.description}</p>
                        </div>
                    `;
                    carouselInner.appendChild(carouselItem); // Add the carousel item to the container
                    // Create an indicator button for each carousel item
                    const indicator = document.createElement("button");
                    indicator.type = "button";
                    indicator.dataset.bsTarget = "#newsCarousel"; // Link the indicator to the carousel
                    indicator.dataset.bsSlideTo = index.toString(); // Set the slide index
                    if (index === 0) indicator.classList.add("active"); // Mark the first indicator as active
                    carouselIndicators.appendChild(indicator); // Add the indicator to the container
                });
            } else {
                // If no articles are available for the carousel, hide it
                document.getElementById("newsCarousel").style.display = "none";
            }
        }

        // ========== UPDATED FILTERING LOGIC ========== //
        // Filter articles based on generated tags (e.g., AI, Security, Startups, etc.)
        const filteredArticles = data.articles.filter(article => {
            if (category === "all") return true; // Show all articles if the category is "all"
            const tags = generateTags(article); // Generate tags for the article
            return tags.includes(category); // Only include articles that match the selected category
        });
        // ========== END OF UPDATED SECTION ========== //

        // Display the filtered RSS entries with tags
        filteredArticles.forEach(article => {
            const tags = generateTags(article); // Generate tags for the article
            const entry = document.createElement("div"); // Create a container for the RSS entry
            entry.className = "rss-entry"; // Add a class for styling
            entry.onclick = () => openArticle(article); // Open the full article when clicked
            entry.innerHTML = `
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" class="rss-image">` : ''}
                <div class="rss-content">
                    <h3>${article.title}</h3> <!-- Article title -->
                    <p>${article.description || "No description available."}</p> <!-- Article description or fallback text -->
                    <small>Published on: ${new Date(article.publishedAt).toLocaleDateString()}</small> <!-- Publication date -->
                    <div class="tags">${tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div> <!-- Tags for categorization -->
                </div>
            `;
            rssContainer.appendChild(entry); // Add the entry to the RSS container
        });
    } catch (error) {
        console.error("Error fetching news:", error); // Log any errors that occur during the fetch
    }
}

// Function to generate tags for an article based on its content
function generateTags(article) {
    const keywords = {
        ai: ["AI", "Artificial Intelligence", "Machine Learning", "Deep Learning"], // Keywords for AI-related articles
        security: ["Cybersecurity", "Hacking", "Data Breach", "Privacy", "Encryption"], // Keywords for security-related articles
        startups: ["Startup", "Funding", "Entrepreneur", "Venture Capital"], // Keywords for startup-related articles
        apps: ["App", "iOS", "Android", "Mobile", "Software"], // Keywords for app-related articles
        venture: ["Investment", "VC", "Funding", "Seed", "Series A", "Series B"] // Keywords for venture-related articles
    };
    let tags = []; // Array to store matching tags
    Object.keys(keywords).forEach(category => {
        // Check if the article's title or description contains any of the keywords for the category
        if (keywords[category].some(keyword => 
            article.title.toLowerCase().includes(keyword.toLowerCase()) || 
            (article.description && article.description.toLowerCase().includes(keyword.toLowerCase()))
        )) {
            tags.push(category); // Add the category as a tag if a match is found
        }
    });
    return tags.length ? tags : ["General"]; // Return the tags, or "General" if no matches are found
}

// Function to open an article in a new page
function openArticle(article) {
    localStorage.setItem("selectedArticle", JSON.stringify(article)); // Save the selected article to localStorage
    window.location.href = "article.html"; // Redirect to the article page
}

// Run the fetchNews function when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop(); // Get the current page filename
    const categoryMap = {
        "index.html": "all", // Default category for the homepage
        "startups.html": "startups", // Category for startups page
        "ai.html": "ai", // Category for AI page
        "security.html": "security", // Category for security page
        "apps.html": "apps", // Category for apps page
        "venture.html": "venture" // Category for venture page
    };
    fetchNews(categoryMap[currentPage] || "all"); // Fetch news based on the current page's category
});

// End of my own code