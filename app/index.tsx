import Dial from "@/components/Dial";
import { useColorScheme, View } from "react-native";

export default function Index() {
  const colorScheme = useColorScheme();
  return (
    <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? 'black' : 'white' }}>
      <Dial />
    </View>
  );
}
