import React, { FC, useState, useMemo } from 'react';
import { StyleSheet, Text, ActivityIndicator, View } from 'react-native';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import { Card, Button } from '@rneui/themed';
import { tileGridForRegion } from '../utilities/TileGrid';
import { AppConstants } from '../constants';
import { Region } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  mapRegion: Region;
  onFinish: () => void;
  totalSizeInMB: string;
  setTotalSizeInMB: (totalSizeInMB: string) => void;
};

export const DownloadSettings: FC<Props> = ({
  mapRegion,
  onFinish,
  totalSizeInMB,
  setTotalSizeInMB,
}) => {
  const [numZoomLevels, setZoomLevels] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // const [totalSizeInMB, setTotalSizeInMB] = useState('')
  console.log(AppConstants.TILE_FOLDER);
  

  const currentZoom = useMemo(() => {
    const zoom = calcZoom(mapRegion.longitudeDelta);
    return zoom;
  }, [mapRegion]);

  // Function to update the total size after each download
  async function updateTotalSize(size: number) {
    try {
      const existingSize = (await AsyncStorage.getItem('totalTileSize')) || '0';
      const newSize = parseInt(existingSize) + size;
      await AsyncStorage.setItem('totalTileSize', newSize.toString());
    } catch (error) {
      console.error('Error updating total size:', error);
    }
  }

  // Function to display the total size
  async function displayTotalSize() {
    try {
      const totalSize = (await AsyncStorage.getItem('totalTileSize')) || '0';
      const totalSizeInMB = (parseInt(totalSize) / (1024 * 1024)).toFixed(2);
      alert(`Total size of stored tiles: ${totalSizeInMB} MB`);
    } catch (error) {
      console.error('Error displaying total size:', error);
    }
  }

  async function fetchTiles() {
    setIsLoading(true);

    const minZoom = currentZoom;
    const maxZoom = currentZoom + numZoomLevels;

    const tiles = tileGridForRegion(mapRegion, minZoom, maxZoom);

    // Create directory for tiles
    // TODO: Batch to speed up
    for (const tile of tiles) {
      const folder = `${AppConstants.TILE_FOLDER}/${tile.z}/${tile.x}`;
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });
    }

    // Download tiles in batches to avoid excessive promises in flight
    const BATCH_SIZE = 100;

    // let batch = []
    let batch: Promise<FileSystem.FileSystemDownloadResult>[] = [];

    for (const tile of tiles) {
      const fetchUrl = `${AppConstants.MAP_URL}/${tile.z}/${tile.x}/${tile.y}.png`;
      const localLocation = `${AppConstants.TILE_FOLDER}/${tile.z}/${tile.x}/${tile.y}.png`;
      console.log('fetchUrl', fetchUrl);
      console.log('localLocation', localLocation);
      

      const tilePromise = FileSystem.downloadAsync(fetchUrl, localLocation).then(
        async (result) => {
          const size = result.headers['Content-Length']
            ? parseInt(result.headers['Content-Length'], 10)
            : 0;
          await updateTotalSize(size);
          return result;
        }
      );

      batch.push(tilePromise);

      if (batch.length >= BATCH_SIZE) {
        await Promise.all(batch); // Make sure this is awaited correctly
        batch = [];
      }
    }

    // Don't forget to handle the last batch if it's not empty
    if (batch.length > 0) {
      await Promise.all(batch); // Ensuring this is awaited as well
    }

    await Promise.all(batch);
    // Retrieve the total size from AsyncStorage
    const totalSize = (await AsyncStorage.getItem('totalTileSize')) || '0';
    const calculatedSizeInMB = (parseInt(totalSize, 10) / (1024 * 1024)).toFixed(2);
    setTotalSizeInMB(calculatedSizeInMB);

    alert(
      `Finished downloading tiles. Total size: ${calculatedSizeInMB} MB. You are now viewing the offline map.`
    );

    setIsLoading(false);
    onFinish();
  }

  // Calculate the maximum value for the slider
  const maxSliderValue = Math.max(0, 18 - currentZoom);

  return (
    <Card containerStyle={styles.container}>
      <Text>Select number of zoom levels to download</Text>

      <Text style={styles.warningMessage}>
        Warning! Selecting a high detail level will take up more space.
      </Text>

      <Text style={styles.estimate}>Value of slider is: {numZoomLevels}</Text>
      <Text style={styles.estimate}>Current zoom level: {currentZoom}</Text>
      <Text style={styles.estimate}>
        Zoom level to be downloaded: {currentZoom + numZoomLevels}
      </Text>
      <Text style={styles.estimate}>Total size of tiles: {totalSizeInMB} MB</Text>
      <Slider
        style={{
          marginBottom: 30,
          marginTop: 30,
        }}
        step={1}
        minimumValue={1}
        maximumValue={maxSliderValue}
        onValueChange={setZoomLevels}
      />

      {isLoading && <ActivityIndicator />}
      {!isLoading && <Button raised title="Download tiles" onPress={fetchTiles} />}
    </Card>
  );
};

function calcZoom(longitudeDelta: number) {
  return Math.round(Math.log(360 / longitudeDelta) / Math.LN2);
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  warningMessage: {
    marginVertical: 10,
    color: '#bbb',
    fontStyle: 'italic',
    fontSize: 10,
    textAlign: 'center',
  },
  estimate: {
    marginVertical: 15,
    textAlign: 'center',
  },
});
