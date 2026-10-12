ChemCheck - Know What's Inside

A website that helps people understand the ingredients in everyday products.
Built with Next.js, React and Tailwind CSS for a college project.

What it does
- Reads ingredient lists from a typed list, a label photo (OCR in the browser) or a barcode lookup
- Lets you confirm or edit the detected ingredients before analysis
- Matches each ingredient against a reviewed dataset (data/ingredients.json)
- Classifies ingredients as green, yellow, red or grey, and explains why
- Shows a results dashboard, a comparison page, saved history, methodology and privacy pages
- Optionally adds an AI written plain-language summary (needs an API key)

Honesty rules built into the code
- An ingredient that is not in the dataset is always grey. It is never guessed.
- The AI never decides a classification. It only rewrites facts already in the report.
- If the AI key or a database is missing, the site shows a setup message, not fake results.
- There is no score out of 100, because no validated method exists for it.

How to run
1. Install Node.js 18 or newer from nodejs.org
2. In this folder run: npm install
3. Copy the file .env.example to .env.local
4. Optional: put your Anthropic API key in .env.local after ANTHROPIC_API_KEY=
5. Run: npm run dev
6. Open http://localhost:3000

Folder guide
- app: the pages (home, analyze, results, compare, history, about, privacy) and the API routes
- app/api/analyze: matches ingredients and builds the report
- app/api/barcode: looks up barcodes in Open Food Facts, Open Beauty Facts and Open Products Facts
- components: reusable page pieces
- lib: parsing, matching, storage and AI helper code
- data/ingredients.json: the reviewed ingredient dataset

Adding an ingredient to the dataset
1. Copy an existing entry in data/ingredients.json
2. Change the id, name, aliases (other spellings, INS or E numbers) and the text fields
3. Only write facts you have checked in a source, and list that source in the sources field
4. appliesTo says where the information is valid: cosmetic, food or household
5. classByCategory lets one ingredient have a different colour in a different category

Before you submit
The dataset is a starter set. Every entry links to a publisher or database, but the links open the
publisher's general database or topic page. Check each entry against its source and correct anything
that does not match. Indian regulatory status is deliberately marked as not verified.

Deploying
The site needs a server for the API routes, so use a host that runs Next.js, such as Vercel.
Add ANTHROPIC_API_KEY in the host's environment settings. Never put the key in front-end code.
