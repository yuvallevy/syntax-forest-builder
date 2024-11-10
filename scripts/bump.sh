#!/bin/bash
# Bump the version number of npbloom-web and npbloom-core at the same time,
# and prepare the change list for detailing the changes in the new version.
# Usage: bump.sh [patch|minor|major]

# Read version number from npbloom-web/package.json
current=$(jq -r .version ../npbloom-web/package.json)

# Get the bump type from the first argument
bump=$1

# Split the version number into an array
IFS='.' read -r -a version <<< "$current"

# Increment the version number based on the bump type
case $bump in
  patch)
    version[2]=$((${version[2]} + 1))
    ;;
  minor)
    version[1]=$((${version[1]} + 1))
    version[2]=0
    ;;
  major)
    version[0]=$((${version[0]} + 1))
    version[1]=0
    version[2]=0
    ;;
  *)
    echo "Usage: bump.sh [patch|minor|major]"
    exit 1
    ;;
esac

# Join the version number array into a string
new="${version[0]}.${version[1]}.${version[2]}"
if [ "${version[2]}" -eq 0 ]; then
  newshort="${version[0]}.${version[1]}"
else
  newshort="${version[0]}.${version[1]}.${version[2]}"
fi

# Update the version number in npbloom-web/package.json
jq ".version = \"$new\"" ../npbloom-web/package.json > tmp.json
mv tmp.json ../npbloom-web/package.json
# Update the version number in npbloom-web/package-lock.json
jq ".version = \"$new\"" ../npbloom-web/package-lock.json > tmp.json
jq ".packages.\"\".version = \"$new\"" tmp.json > tmp2.json
mv tmp2.json ../npbloom-web/package-lock.json
rm tmp.json
# Update the version number in npbloom-core/build.gradle.kts
sed -i "s/version = \".*\"/version = \"$newshort\"/g" ../npbloom-core/build.gradle.kts
# Update the version number and clear change list in npbloom-web/src/currentVersion.tsx
# (lazy solution: remove all lines starting with two spaces)
sed -i "s/currentVersion: string = '.*'/currentVersion: string = '$newshort'/g" ../npbloom-web/src/currentVersion.tsx
sed -i '/^  /d' ../npbloom-web/src/currentVersion.tsx
# Add a new entry in HISTORY.md
# Skip the first line (the title), insert a new line with the new version number and the current date,
# then insert a new line for the new version's change list
sed -i "1 a\\
### $newshort ($(date +%Y-%m-%d))\\
" ../HISTORY.md

echo "Bumped version number from $current to $newshort."
echo "Fill in all changes in HISTORY.md."
echo "Include important changes in npbloom-web/src/currentVersion.tsx to display them in the app."
echo "When you're done, press Enter to commit the changes."
read
git add ../npbloom-web/package.json ../npbloom-web/package-lock.json ../npbloom-core/build.gradle.kts ../npbloom-web/src/currentVersion.tsx ../HISTORY.md
git commit -m "Bump version to $newshort"
