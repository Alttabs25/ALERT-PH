import { Redirect } from 'expo-router';

export default function Index() {
  // This sends the user straight to app/welcome.tsx
  return <Redirect href="/welcome" />;
}