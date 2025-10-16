import { Redirect } from 'expo-router';

export default function NotFound() {
  // Gracefully redirect unknown paths to the main festivals tab
  return <Redirect href="/(tabs)/festivals" />;
}
