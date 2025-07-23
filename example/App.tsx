import { useEffect, useState } from 'react';
import AppLinks, { LinkHandlingResult } from 'expo-applinks';
import { Alert, Button, Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Initialize AppLinks SDK at module level
AppLinks.initialize({
  apiKey: 'pk_thund3Qt1SAqvUtJtPzFBYg7aVMJ9BPD',
  logLevel: 'debug'
}).catch(error => {
  console.error('Failed to initialize AppLinks SDK:', error);
});

export default function App() {
  const [lastLink, setLastLink] = useState<LinkHandlingResult | null>(null);
  const [initialLink, setInitialLink] = useState<LinkHandlingResult | null>(null);
  const [version] = useState(AppLinks.getVersion());
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  useEffect(() => {
    AppLinks.getInitialLink().then((result: LinkHandlingResult | null) => {
      if (result) {
        setInitialLink(result);
        setLastLink(result);
      }
    });

    const removeListener = AppLinks.addLinkListener((result: LinkHandlingResult) => {
      setLastLink(result);

      if (result.handled) {
        Alert.alert(
          'Link Received!',
          `Path: ${result.path}\nParams: ${JSON.stringify(result.params, null, 2)}`,
          [{ text: 'OK' }]
        );
      }
    });

    return removeListener;
  }, []);

  const handleCreateLink = async () => {
    try {
      const link = await AppLinks.createLink({
        domain: 'example.onapp.link',
        type: 'short',
        title: 'Check out this product!',
        deepLinkPath: 'product/special-offer',
        deepLinkParams: {
          discount: '20',
          code: 'SAVE20'
        },
        web_link: 'https://example.com/products/special',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      });

      setCreatedLink(link);
      Alert.alert('Link Created!', link);
    } catch (error) {
      Alert.alert('Error', `Failed to create link: ${error}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>AppLinks SDK Example</Text>

        <Group name="SDK Info">
          <Text style={styles.text}>Version: {version}</Text>
          <Text style={styles.text}>Status: ✅ Initialized</Text>
        </Group>

        <Group name="Instructions">
          <Text style={styles.text}>
            1. Configure your app.json with the plugin{'\n'}
            2. Open a universal link or custom scheme{'\n'}
            3. Or copy a link to clipboard and relaunch the app{'\n'}
            4. Watch for link handling events below
          </Text>
        </Group>

        <Group name="Initial Link">
          {initialLink ? (
            <View>
              <Text style={styles.text}>Handled: {initialLink.handled ? '✅' : '❌'}</Text>
              <Text style={styles.text}>URL: {initialLink.originalUrl}</Text>
              <Text style={styles.text}>Path: {initialLink.path}</Text>
              <Text style={styles.text}>
                Params: {JSON.stringify(initialLink.params, null, 2)}
              </Text>
              {initialLink.error && (
                <Text style={[styles.text, { color: 'red' }]}>Error: {initialLink.error}</Text>
              )}
            </View>
          ) : (
            <Text style={[styles.text, { fontStyle: 'italic' }]}>No initial link</Text>
          )}
        </Group>

        <Group name="Last Link Event">
          {lastLink ? (
            <View>
              <Text style={styles.text}>Handled: {lastLink.handled ? '✅' : '❌'}</Text>
              <Text style={styles.text}>URL: {lastLink.originalUrl}</Text>
              <Text style={styles.text}>Path: {lastLink.path}</Text>
              <Text style={styles.text}>
                Params: {JSON.stringify(lastLink.params, null, 2)}
              </Text>
              <Text style={styles.text}>
                Metadata: {JSON.stringify(lastLink.metadata, null, 2)}
              </Text>
              {lastLink.error && (
                <Text style={[styles.text, { color: 'red' }]}>Error: {lastLink.error}</Text>
              )}
            </View>
          ) : (
            <Text style={[styles.text, { fontStyle: 'italic' }]}>No links received yet</Text>
          )}
        </Group>

        <Group name="Create Link">
          <Button title="Create Dynamic Link" onPress={handleCreateLink} />
          {createdLink && (
            <View style={{ marginTop: 10 }}>
              <Text style={styles.text}>Created Link:</Text>
              <TouchableOpacity onPress={() => Linking.openURL(createdLink)}>
                <Text style={[styles.text, { fontSize: 14, color: '#007AFF', textDecorationLine: 'underline' }]}>
                  {createdLink}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Group>

        <Group name="Test Links">
          <Text style={styles.text}>
            Try these test URLs:{'\n'}
            • applinks://product/123{'\n'}
            • https://example.onapp.link/shoes
          </Text>
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: {
    fontSize: 30,
    margin: 20,
    fontWeight: 'bold' as const,
  },
  groupHeader: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold' as const,
  },
  group: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#eee',
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
};
