import { Redirect } from 'expo-router';
import { useSelector } from 'react-redux';

export default function Index() {
    const user = useSelector((state: any) => state?.auth?.user);

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href={'/(auth)/login' as any} />;
}
