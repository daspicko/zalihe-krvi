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

cp -r index.html js/ css/ assets/ data.json firebase-messaging-sw.js dist/

echo "Build completed successfully."
