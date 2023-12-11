# React Native Offline Map Demo

## Overview
This React Native project, built using Expo, demonstrates the implementation of offline map functionality. It allows users to download and store map tiles for offline viewing, ensuring map accessibility even without an internet connection.

## Key Features
- **Offline Map Viewing:** Users can download map tiles while online and view the map offline using these stored tiles.
- **Dynamic Region Selection:** The app allows users to select specific regions for downloading map tiles.
- **User-Friendly Interface:** A simple and intuitive interface for managing offline map capabilities.

## Project Structure
- `App.tsx`: The main component of the app, containing the primary logic and rendering the MapView and DownloadSettings components.
- `DownloadSettings.tsx`: A component that allows users to select the number of zoom levels and initiate the tile downloading process.
- `TileGrid.ts`: Contains the logic for calculating the grid of tiles based on the selected region and zoom levels.
- `index.ts`: Serves as the entry point for the app, primarily used for organizing and exporting components.

## Getting Started

### Prerequisites
- Node.js
- Expo CLI
- iOS Simulator/Android Emulator or a physical device

### Installation
1. Clone the repository:
git clone [Your Repository URL]
2. Navigate to the project directory:
cd rn-offline-map-demo
3. Install dependencies:
npm install

### Running the App
- Run the app in an iOS simulator:
npm run ios
- Run the app in an Android emulator:
npm run android
- For physical devices, use Expo Go.

## How It Works

### Offline Map Functionality
- The app utilizes `react-native-maps` for rendering maps.
- Users select a region and the number of zoom levels for which to download tiles.
- The `TileGrid` module calculates the required tiles, which are then downloaded and stored locally.
- In offline mode, the app uses these locally stored tiles to display the map.

### Components
- **MapView (`App.tsx`):** Renders the map and handles region changes.
- **DownloadSettings (`DownloadSettings.tsx`):** Manages the selection of zoom levels and initiates the downloading process.
- **TileGrid (`TileGrid.ts`):** Calculates the grid of tiles needed for the selected region and zoom levels.

### Downloading and Storing Map Tiles
1. **Selecting Region and Zoom Levels:**
 - The app allows users to choose a specific geographical region and the number of zoom levels for which they want to download tiles. 
 - This selection is made in the `DownloadSettings` component.

2. **Calculating Required Tiles (`TileGrid.ts`):**
 - Based on the user's selection, the app calculates which tiles are needed. This calculation considers the latitude, longitude, and zoom levels to determine the specific tiles that cover the selected area.
 - Each tile is a small square part of the map, representing a specific geographical area at a certain zoom level.

3. **Fetching Tiles from the Server:**
 - The app fetches these tiles from a map tile server. The server URL and path for the tiles are defined in the app's constants (typically found in `AppConstants`).
 - A common format for tile URLs is: `{Server URL}/{z}/{x}/{y}.png`, where `z` is the zoom level, and `x` and `y` are the tile coordinates.
 - The app sends requests to these URLs to fetch the individual `.png` images (tiles).

4. **Storing Tiles Locally (`expo-file-system`):**
 - Once a tile is fetched, it's stored locally on the device using the Expo File System API.
 - The app creates a directory structure reflecting the zoom levels and tile coordinates, ensuring an organized storage system for easy retrieval.
 - For example, tiles might be stored in a structure like `local_directory/z/x/y.png`.

### Displaying Maps in Offline Mode
- When the app operates in offline mode, the `MapView` component is configured to source its tiles from the local storage instead of fetching them from the server.
- This switch is managed by changing the `urlTemplate` prop of the `UrlTile` component within `MapView`.
- In offline mode, the `urlTemplate` points to the local directory where the tiles are stored, enabling the app to display the map using the downloaded tiles.

### Managing Offline Data
- Users have options to clear the downloaded tiles and redownload them as needed.
- The app provides UI components to manage these functionalities, allowing users to handle their offline map data effectively.

### Technical Considerations
- Handling Large Amounts of Data: Downloading tiles for wide regions or multiple zoom levels can involve a large number of files, which might consume significant storage space.
- Performance Optimization: Efficiently managing network requests and local file storage is crucial for a smooth user experience.
- Error Handling: The app includes error handling to manage scenarios like failed downloads or storage issues.

