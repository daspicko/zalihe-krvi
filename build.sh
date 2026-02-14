npm ci
cd scraper && npm ci && cd ..

./quality.sh || {
    echo "Quality checks failed. Build aborted."
    exit 1
}

if [[ -d dist ]]; then
    rm -rf dist
fi

mkdir dist

if [[ ! -f data.json ]]; then
    cd scraper && node index.js && cd ..
fi

if [[ ! -f data.json ]]; then
    echo "Data fetching failed."
    exit 1
fi

cp index.html dist/
cp 404.html dist/
cp data.json dist/
cp firebase-messaging-sw.js dist/
cp manifest.json dist/

cp -r css/ dist/
cp -r assets/ dist/

npm run rollup # Build with rollup and apply hashes to filenames

cp -r js/libs dist/js/libs/ # Run after rollup to avoid overwriting

echo "Build completed successfully."
