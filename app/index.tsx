import { Redirect } from "expo-router";

export default function Index() {
  // Just redirect to welcome; the Layout logic will handle the rest
  return <Redirect href="/welcome" />;
}