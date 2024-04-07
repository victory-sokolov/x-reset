import pw from 'playwright';

// Random delay betweeb 1 - 5 seconds between actions
const delay = Math.floor(Math.random() * 5 + 1) * 1000;

const getPostCount = (tweets) => {
    const multipliers = { k: 1000, m: 1000000 };
    return (
        parseFloat(tweets) *
        multipliers[tweets.charAt(tweets.length - 1).toLowerCase()]
    );
};

async function main() {
    const browser = await pw.chromium.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://twitter.com/login');
    await page.waitForTimeout(2000);

    // Enter Twitter login credentials
    await page.type('input[name="text"]', process.env.X_USERNAME);
    await page.click('span:has-text("Next")');
    await page.type('input[name="password"]', process.env.X_PASSWORD);

    // Click the Twitter login button
    await page.click('span:has-text("Log in")');
    await page.waitForNavigation();

    // Go to Profile page
    await page.click('span:has-text("Profile")');
    await page.waitForTimeout(2000);
    await page.evaluate('window.scrollBy(0, 300);');

    // Get total amount of Tweets
    const tweetsLocator = await page
        .locator('h2[role="heading"] + div:has-text("posts")')
        .innerText();
    const tweets = tweetsLocator.replace('posts', '').trim();
    const tweetCount = getPostCount(tweets);
    console.info(`Found ${tweetsLocator}`);

    for (var i = 1; i <= tweetCount; i++) {
        try {
            await page.click('[data-testid="unretweet"]', { delay: 0 });
            await page.click('span:has-text("Undo repost")', { delay: 0 });
            console.info('Unretweeting...');
        } catch (err) {
            await page.click('div[aria-label="More"]');
            await page.click('span:has-text("Delete")');
            await page.waitForTimeout(1000);
            await page.click('div[role="button"] span:has-text("Delete")');
        }

        console.info(`Deleted ${i}/${tweetCount}`);
    }

    await browser.close();
}

main();
