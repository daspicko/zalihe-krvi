if [[ -d dist ]]; then
    echo "Removing old build..."
    rm -rf dist
fi

mkdir dist

if [[ ! -f data.json ]]; then
    cd scrapper 
    echo "Installing scrapper dependencies..."
    npm install
    echo "Running scrapper..."
    node index.js
    cd ..
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

npm install
npm run rollup

cp -r js/libs dist/js/libs/

echo "Build completed successfully."
