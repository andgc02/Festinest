

function openExternalLink(url: string) {
  Linking.openURL(url).catch((error) => {
    console.warn('Failed to open url', error);
  });
}
