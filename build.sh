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

cp -r index.html css/ assets/ data.json firebase-messaging-sw.js dist/

npm install
./node_modules/rollup/dist/bin/rollup  -c rollup.config.js
cp -r js/libs dist/js/libs/

echo "Build completed successfully."
